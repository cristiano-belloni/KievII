function Pitchshift(fftFrameSize, sampleRate) {
  if( arguments.length ) { this.getready(fftFrameSize, sampleRate); }
}

Pitchshift.prototype.getready = function (fftFrameSize, sampleRate) {
    this.fftFrameSize_ = fftFrameSize;
    this.sampleRate_= sampleRate;
    this.hannWindow_ = []
    this.gRover_ = false;
    this.MAX_FRAME_LENGTH = 8192

    function newFilledArray(length, val) {
        var intLength = Math.floor(length);
        var array = [];
        for (var i = 0; i < intLength; i++) {
            array[i] = val;
        }
        return array;
    }

    this.gInFIFO = newFilledArray(this.MAX_FRAME_LENGTH, 0);
    this.gOutFIFO = newFilledArray(this.MAX_FRAME_LENGTH, 0);
    this.gLastPhase = newFilledArray(this.MAX_FRAME_LENGTH / 2 + 1, 0);
    this.gSumPhase = newFilledArray(this.MAX_FRAME_LENGTH / 2 + 1, 0);
    this.gOutputAccum = newFilledArray(2 * this.MAX_FRAME_LENGTH, 0);
    this.gAnaFreq = newFilledArray(this.MAX_FRAME_LENGTH, 0);
    this.gAnaMagn = newFilledArray(this.MAX_FRAME_LENGTH, 0);
    this.gSynFreq = newFilledArray(this.MAX_FRAME_LENGTH, 0);
    this.gSynMagn = newFilledArray(this.MAX_FRAME_LENGTH, 0);
    this.gFFTworksp = newFilledArray(2 * this.MAX_FRAME_LENGTH, 0);

    // Real and imaginary parts of the resynthesized signal
    this.real_ = [];
    this.imag_ = [];
    
    // Output data.
    // TODO how long is outdata for the caller??
    this.outdata = [];
    this.hanWindow_ = [];


    for (k = 0; k < fftFrameSize; k++) {
        //Pre-generating Hann wavetable
        this.hanWindow_[k]= WindowFunction.Hann(fftFrameSize, k);
    }

    // Init once, use always.
    this.fft = new FFT(this.fftFrameSize_, this.sampleRate_);

    console.log ("Pitchshift.prototype.getready returns back");

};

Pitchshift.prototype.process = function (pitchShift, numSampsToProcess, osamp, indata) {

    console.log ("We got some shit to process; seem " + numSampsToProcess + " samples, pitchShift factor is " +  pitchShift + " und indata.length is " + indata.length);

    /* pitchShift: factor value which is between 0.5 (one octave down) and 2. (one octave up). */

        /* These could be members? They won't be recalculated everytime */
	var fftFrameSize2 = this.fftFrameSize_/2,
	    stepSize = this.fftFrameSize_/osamp,
	    freqPerBin = this.sampleRate_ / this.fftFrameSize_,
	    expct = 2.* Math.PI * stepSize / this.fftFrameSize_,
	    inFifoLatency = this.fftFrameSize_ - stepSize,
            j, k = 0;

	if (this.gRover_ === false) {
            this.gRover_ = inFifoLatency;
        }

        /* main processing loop */
	for (j = 0; j < numSampsToProcess; j++){
            /* As long as we have not yet collected enough data just read in */
		this.gInFIFO[this.gRover_] = indata[j];
		this.outdata[j] = this.gOutFIFO[this.gRover_ - inFifoLatency];
		this.gRover_++;

		/* now we have enough data for processing */
		if (this.gRover_ >= this.fftFrameSize_) {

                        console.log ("Enough data to process now!");

			this.gRover_ = inFifoLatency;

			/* Do the windowing */
			for (k = 0 ; k < this.fftFrameSize_ ; k++) {
                            //Need the signal for the FFT.
                            this.gFFTworksp[k] = this.gInFIFO[k] * this.hanWindow_[k];
                            //this.gFFTworksp[k][1] = 0.;
                        }

                       console.log ("Windowing done!");
                       //So far, so good.

                       // BUG! It never logs "this.fft.forward done!". It never comes to the break.
                       this.fft.forward(this.gFFTworksp);
                       // Maybe! this.gFFTworksp = this.fft.spectrum;
                       console.log ("this.fft.forward done!");
                       break;

                       /* this is the analysis step */
                       for (k = 0; k <= fftFrameSize2; k++) {

                                //Mmmmh. Taking some "private" member out of fft here.
                                var magn = 2 * Math.sqrt (fft.real[k] * fft.real[k] + fft.imag[k] * fft.imag[k]);
                                var phase = Math.atan2 (fft.imag[k], fft.real[k]);

				/* compute phase difference */
				var tmp = phase - this.gLastPhase[k];
				this.gLastPhase[k] = phase;

				/* subtract expected phase difference */
				tmp -= k * expct;

				/* map delta phase into +/- Pi interval */
				var qpd = tmp / Math.PI;
				if (qpd >= 0) {
                                    qpd += qpd & 1;
                                }
				else {
                                    qpd -= qpd & 1;
                                }
				
                                tmp -= Math.PI * qpd;

				/* get deviation from bin frequency from the +/- Pi interval */
				tmp = osamp * tmp /(2 * Math.PI);

				/* compute the k-th partials' true frequency */
				tmp =  k * freqPerBin + tmp * freqPerBin;

				/* store magnitude and true frequency in analysis arrays */
				this.gAnaMagn[k] = magn;
				this.gAnaFreq[k] = tmp;

			}

                        console.log ("Analysis done!");
                        
                        /* ***************** PROCESSING ******************* */
			/* this does the actual pitch shifting */
			
			for (k = 0; k <= fftFrameSize2; k++) {

				var index = k / pitchShift;
				
				if (index <= fftFrameSize2) {
                                    	this.gSynMagn[k] += this.gAnaMagn[index];
					this.gSynFreq[k] = this.gAnaFreq[index] * pitchShift;
                                    }
                            }

                            console.log ("Processing done!");

                        /* ***************** SYNTHESIS ******************* */
			/* this is the synthesis step */
			for (k = 0; k <= fftFrameSize2; k++) {

				/* get magnitude and true frequency from synthesis arrays */
				magn = this.gSynMagn[k];
				tmp = this.gSynFreq[k];

				/* subtract bin mid frequency */
				tmp -= k * freqPerBin;

				/* get bin deviation from freq deviation */
				tmp /= freqPerBin;

				/* take osamp into account */
				tmp = 2.* Math.PI * tmp / osamp;

				/* add the overlap phase advance back in */
				tmp += k * expct;

				/* accumulate delta phase to get bin phase */
				this.gSumPhase[k] += tmp;
				phase = this.gSumPhase[k];

				// Get real and imag part
				this.real_[k] = magn*cos(phase);
				this.imag_[k] = magn*sin(phase);
			}

                        console.log ("Synthesis done!");

                        // zero negative frequencies
			for (k = ((fftFrameSize2)+1); (k < this.fftFrameSize_); k++) {

                            this.real_[k] = 0;
			    this.imag_[k] = 0;

                        }

                        console.log ("Negatives done!");

			// Do the Inverse transform
                       var signal = this.fft.inverse(this.real_, this.imag_);

			// Do windowing and add to output accumulator
			for(k=0; k < this.fftFrameSize_; k++) {

				this.gOutputAccum[k] += this.han_window_[k] * signal[k];

			}

                        for (k = 0; k < stepSize; k++) this.gOutFIFO[k] = this.gOutputAccum[k];

			/* shift accumulator TODO
			memmove(gOutputAccum, gOutputAccum+stepSize, fftFrameSize*sizeof(float)); */
                        //void *memmove(void *dest, const void *src, size_t n);
                        // gOutputAccum+stepSize --> gOutputAccum for fftFrameSize samples

                        var tempArray = this.gOutputAccum.slice(0, stepSize);
                        var tempArray2 = this.gOutputAccum.slice (stepSize, stepSize + this.fftFrameSize_);
                        var tempArray3 = tempArray.concat(tempArray2);
                        //var tempArray3 = this.gOutputAccum.slice(0, stepSize).concat(this.gOutputAccum.slice (stepSize, stepSize + this.fftFrameSize_));
                        this.gOutputAccum = tempArray3;

			/* move input FIFO */
			for (k = 0; k < inFifoLatency; k++) {
                            this.gInFIFO[k] = this.gInFIFO[k + stepSize];
                        }

                        console.log ("Moved input FIFO done!");
                    }
                    console.log ("After enough data! done!");
                }
                console.log ("Ok, fuck you, I'm outta here");
            }
