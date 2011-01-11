/* libSoX effect: change tempo (and duration) or pitch (maintain duration)
 * Copyright (c) 2007,8 robs@users.sourceforge.net
 * Based on ideas from Olli Parviainen's SoundTouch Library.
 *
 * This library is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or (at
 * your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser
 * General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

#include "fifo.h"
#include <math.h>

#ifdef min
#undef min
#endif
#define min(a, b) ((a) <= (b) ? (a) : (b))

#ifdef max
#undef max
#endif
#define max(a, b) ((a) >= (b) ? (a) : (b))

#define sqr(a) ((a) * (a))

typedef struct {
  /* Configuration parameters: */
  size_t channels;
  int quick_search; /* Whether to quick search or linear search */
  double factor;         /* 1 for no change, < 1 for slower, > 1 for faster. */
  size_t search;         /* Wide samples to search for best overlap position */
  size_t segment;        /* Processing segment length in wide samples */
  size_t overlap;        /* In wide samples */

  size_t process_size;   /* # input wide samples needed to process 1 segment */

  /* Buffers: */
  fifo_t input_fifo;
  float * overlap_buf;
  fifo_t output_fifo;

  /* Counters: */
  size_t samples_in;
  size_t samples_out;
  size_t segments_total;
  size_t skip_total;
} tempo_t;

/* Waveform Similarity by least squares; works across multi-channels */
static float difference(const float * a, const float * b, size_t length)
{
  float diff = 0;
  size_t i = 0;

  #define _ diff += sqr(a[i] - b[i]), ++i; /* Loop optimisation */
  do {_ _ _ _ _ _ _ _} while (i < length); /* N.B. length ≡ 0 (mod 8) */
  #undef _
  return diff;
}

/* Find where the two segments are most alike over the overlap period. */
static size_t tempo_best_overlap_position(tempo_t * t, float const * new_win)
{
  float * f = t->overlap_buf;
  size_t j, best_pos, prev_best_pos = (t->search + 1) >> 1, step = 64;
  size_t i = best_pos = t->quick_search? prev_best_pos : 0;
  float diff, least_diff = difference(new_win + t->channels * i, f, t->channels * t->overlap);
  int k = 0;

  if (t->quick_search) do { /* hierarchical search */
    for (k = -1; k <= 1; k += 2) for (j = 1; j < 4 || step == 64; ++j) {
      i = prev_best_pos + k * j * step;
      if ((int)i < 0 || i >= t->search)
        break;
      diff = difference(new_win + t->channels * i, f, t->channels * t->overlap);
      if (diff < least_diff)
        least_diff = diff, best_pos = i;
    }
    prev_best_pos = best_pos;
  } while (step >>= 2);
  else for (i = 1; i < t->search; i++) { /* linear search */
    diff = difference(new_win + t->channels * i, f, t->channels * t->overlap);
    if (diff < least_diff)
      least_diff = diff, best_pos = i;
  }
  return best_pos;
}

static void tempo_overlap(
    tempo_t * t, const float * in1, const float * in2, float * output)
{
  size_t i, j, k = 0;
  float fade_step = 1.0f / (float) t->overlap;

  for (i = 0; i < t->overlap; ++i) {
    float fade_in  = fade_step * (float) i;
    float fade_out = 1.0f - fade_in;
    for (j = 0; j < t->channels; ++j, ++k)
      output[k] = in1[k] * fade_out + in2[k] * fade_in;
  }
}

static void tempo_process(tempo_t * t)
{
  while (fifo_occupancy(&t->input_fifo) >= t->process_size) {
    size_t skip, offset;

    /* Copy or overlap the first bit to the output */
    if (!t->segments_total) {
      offset = t->search / 2;
      fifo_write(&t->output_fifo, t->overlap, (float *) fifo_read_ptr(&t->input_fifo) + t->channels * offset);
    } else {
      offset = tempo_best_overlap_position(t, fifo_read_ptr(&t->input_fifo));
      tempo_overlap(t, t->overlap_buf,
          (float *) fifo_read_ptr(&t->input_fifo) + t->channels * offset,
          fifo_write(&t->output_fifo, t->overlap, NULL));
    }
    /* Copy the middle bit to the output */
    fifo_write(&t->output_fifo, t->segment - 2 * t->overlap,
               (float *) fifo_read_ptr(&t->input_fifo) +
               t->channels * (offset + t->overlap));

    /* Copy the end bit to overlap_buf ready to be mixed with
     * the beginning of the next segment. */
    memcpy(t->overlap_buf,
           (float *) fifo_read_ptr(&t->input_fifo) +
           t->channels * (offset + t->segment - t->overlap),
           t->channels * t->overlap * sizeof(*(t->overlap_buf)));

    /* Advance through the input stream */
    skip = t->factor * (++t->segments_total * (t->segment - t->overlap)) + 0.5;
    t->skip_total += skip -= t->skip_total;
    fifo_read(&t->input_fifo, skip, NULL);
  }
}

static float * tempo_input(tempo_t * t, float const * samples, size_t n)
{
  t->samples_in += n;
  return fifo_write(&t->input_fifo, n, samples);
}

static float const * tempo_output(tempo_t * t, float * samples, size_t * n)
{
  *n = min(*n, fifo_occupancy(&t->output_fifo));
  t->samples_out += *n;
  return fifo_read(&t->output_fifo, *n, samples);
}

/* Flush samples remaining in overlap_buf & input_fifo to the output. */
static void tempo_flush(tempo_t * t)
{
  size_t samples_out = t->samples_in / t->factor + .5;
  size_t remaining = samples_out - t->samples_out;
  float * buff = calloc(128 * t->channels, sizeof(*buff));

  if ((int)remaining > 0) {
    while (fifo_occupancy(&t->output_fifo) < remaining) {
      tempo_input(t, buff, (size_t) 128);
      tempo_process(t);
    }
    fifo_trim_to(&t->output_fifo, remaining);
    t->samples_in = 0;
  }
  free(buff);
}

static void tempo_setup(tempo_t * t,
  double sample_rate, int quick_search, double factor,
  double segment_ms, double search_ms, double overlap_ms)
{
  size_t max_skip;
  t->quick_search = quick_search;
  t->factor = factor;
  t->segment = sample_rate * segment_ms / 1000 + .5;
  t->search  = sample_rate * search_ms / 1000 + .5;
  t->overlap = max(sample_rate * overlap_ms / 1000 + 4.5, 16);
  t->overlap &= ~7; /* Make divisible by 8 for loop optimisation */
  if (t->overlap * 2 > t->segment)
    t->overlap -= 8;
  t->overlap_buf = malloc(t->overlap * t->channels * sizeof(*t->overlap_buf));
  max_skip = ceil(factor * (t->segment - t->overlap));
  t->process_size = max(max_skip + t->overlap, t->segment) + t->search;
  memset(fifo_reserve(&t->input_fifo, t->search / 2), 0, (t->search / 2) * t->channels * sizeof(float));
}

static void tempo_delete(tempo_t * t)
{
  free(t->overlap_buf);
  fifo_delete(&t->output_fifo);
  fifo_delete(&t->input_fifo);
  free(t);
}

static tempo_t * tempo_create(size_t channels)
{
  tempo_t * t = calloc(1, sizeof(*t));
  t->channels = channels;
  fifo_create(&t->input_fifo, t->channels * sizeof(float));
  fifo_create(&t->output_fifo, t->channels * sizeof(float));
  return t;
}

