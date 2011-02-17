/**
 * Low Pass filter.
 */
function ADLowPassFilter(next, cutoff, resonance, sampleRate) {
  AudioDataFilter.call(this, next);

  /**
   * Gets shift parameters.
   * @type object
   */
  this.iter_number = 0;
  this.cutoff = cutoff;
  this.resonance = resonance;
  this.sampleRate = sampleRate;
  this.isOn = true;
}

ADLowPassFilter.prototype = new AudioDataFilter(null);

/**
 * Initializes the filter with the audio parameters.
 * @param {AudioParameters} audioParameters The parameters of the sound.
 */
ADLowPassFilter.prototype.init = function (audioParameters) {
    console.log ("Entered init");
    AudioDataFilter.prototype.init.call(this, audioParameters);
    if (this.__lowpass === undefined) {
        console.log ("Lazily initializing the lowpass filter, cutoff " + this.cutoff);
        this.__lowpass = new IIRFilter(DSP.LOWPASS, this.cutoff, this.resonance, this.sampleRate);
    }
};

/**
 * Processes the signal.
 * @param {Array} data The signal data.
 * @param {int} length The signal data to be processed starting from the beginning.
 */
ADLowPassFilter.prototype.process = function (data, length) {
    //console.log ("We got some stuff to pass to process(); seem " + length + " samples, pitchShift factor is " +  this.shiftAmount + " und indata.length is " + data.length);
    if (length === 0) {
        return;
    }

    //console.log ("Before process, iteration " + this.iter_number + " data is long " + data.length + " first 10 samples are: " + data[0] + data[1] + data[2] + data[3] + data[4] + data[5] + data[6] + data[7] + data[8] + data[9]);
    //console.log ("Before process, last 10 samples are: " + data[2038] + data[2039] + data[2040] + data[2041] + data[2042] + data[2043] + data[2044] + data[2045] + data[2046] + data[2047]);

    if (this.isOn) {
        this.__lowpass.process (data);
    }

    //console.log ("After process, data is long " + data.length + " first 10 samples are: " + data[0] + data[1] + data[2] + data[3] + data[4] + data[5] + data[6] + data[7] + data[8] + data[9]);
    //console.log ("After process, last 10 samples are: " + data[2038] + data[2039] + data[2040] + data[2041] + data[2042] + data[2043] + data[2044] + data[2045] + data[2046] + data[2047]);

    this.iter_number += 1;

};

ADLowPassFilter.prototype.setCutoff = function (cutoff) {
   var current_resonance = this.__lowpass.resonance ; // This uses a __defineGetter__
   console.log ("Calling set with cf = ", cutoff, " resonanace = ", current_resonance);
   this.__lowpass.set(cutoff, current_resonance);
}

ADLowPassFilter.prototype.setResonance = function (resonance) {
   var current_cutoff = this.__lowpass.cutoff ; // This uses a __defineGetter__
   console.log ("Calling set with cf = ", current_cutoff, " resonanace = ", resonance);
   this.__lowpass.set(current_cutoff, resonance);
}

ADLowPassFilter.prototype.setOnOff = function (bypassValue) {
   this.isOn = bypassValue;
}