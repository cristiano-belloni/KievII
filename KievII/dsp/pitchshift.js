function Pitchshift(fftFrameSize, sampleRate, algo) {
  if( arguments.length ) { this.getready(fftFrameSize, sampleRate, algo); }
}

Pitchshift.prototype.getready = function (fftFrameSize, sampleRate, algo) {
    this.fftFrameSize_ = fftFrameSize;
    this.sampleRate_= sampleRate;
    this.hannWindow_ = []
    this.gRover_ = false;
    this.algo = algo || "FFT";
    // This has to go.
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
    //this.gFFTworksp = newFilledArray(2 * this.MAX_FRAME_LENGTH, 0);
    // Not two, 'cos we haven't to fill phases with 0's.
    this.gFFTworksp = newFilledArray(this.fftFrameSize_,0);

    // Real and imaginary parts of the resynthesized signal
    this.real_ = [];
    this.imag_ = [];
    
    // Output data.
    this.outdata = [];
    this.hannWindow_ = [];


    for (k = 0; k < fftFrameSize; k++) {
        //Pre-generating Hann wavetable
        this.hannWindow_[k]= WindowFunction.Hann(fftFrameSize, k);
    }

    // Init once, use always.
    if (this.algo === "FFT") {
        this.fft = new FFT(this.fftFrameSize_, this.sampleRate_);
    }
    else if (this.algo === "RFFT" ) {
        this.fft = new RFFT(this.fftFrameSize_, this.sampleRate_);
    }
    else {
        throw new Error("Invalid DFT algorithm selected " + this.algo);
    }
    //Probably we don't need this.
    this.invFFT = new FFT(this.fftFrameSize_, this.sampleRate_);

    console.log ("Pitchshift.prototype.getready returns back");

};

Pitchshift.prototype.process = function (pitchShift, numSampsToProcess, osamp, indata) {


    function setArray(array, length, val) {
        var intLength = Math.floor(length);
        for (var i = 0; i < intLength; i++) {
            array[i] = val;
        }
    }

        /* pitchShift: factor value which is between 0.5 (one octave down) and 2. (one octave up). */

	var fftFrameSize2 = this.fftFrameSize_/2,
	    stepSize = this.fftFrameSize_/osamp,
	    freqPerBin = this.sampleRate_ / this.fftFrameSize_,
	    expct = 2.* Math.PI * stepSize / this.fftFrameSize_,
	    inFifoLatency = this.fftFrameSize_ - stepSize,
            j, k = 0, magn, phase, tmp, qpd, index, signal;

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

			this.gRover_ = inFifoLatency;

			/* Do the windowing */
			for (k = 0 ; k < this.fftFrameSize_ ; k++) {
                            //Need the signal for the FFT.
                            this.gFFTworksp[k] = this.gInFIFO[k] * this.hannWindow_[k];
                            //this.gFFTworksp[k][1] = 0.;
                        }

                       this.fft.forward(this.gFFTworksp);

                       /* this is the analysis step */
                       for (k = 0; k <= fftFrameSize2; k++) {

                                //These ifs make the pitchshifter code dependent on the DFT implementation; we should decorate DFTs instead.
                                if (this.algo === "FFT") {
                                    //Taking some "private" member out of fft here.
                                    magn = 2 * Math.sqrt (this.fft.real[k] * this.fft.real[k] + this.fft.imag[k] * this.fft.imag[k]);
                                    //aka magn = spectrum[k];
                                    phase = Math.atan2 (this.fft.imag[k], this.fft.real[k]);
                                }

                                else if (this.algo === "RFFT") {
                                    //Because having the same interface but a different output schema
                                    //in the same library is a great fucking idea!

                                    // Ordering of output:
                                    //
                                    // trans[0] = re[0] (==zero frequency, purely real)
                                    // trans[1] = re[1]
                                    // ...
                                    // trans[n/2-1] = re[n/2-1]
                                    // trans[n/2] = re[n/2] (==nyquist frequency, purely real)
                                    //
                                    // trans[n/2+1] = im[n/2-1]
                                    // trans[n/2+2] = im[n/2-2]
                                    // ...
                                    // trans[n-1] = im[1]

                                    var imaginary, real;

                                    real = this.fft.trans[k];

                                    if (k == 0) {
                                        imaginary = 0;
                                    }
                                    else {
                                        imaginary = this.fft.trans[this.fftFrameSize_ - k];
                                    }

                                    magn = 2 * Math.sqrt (real * real + imaginary * imaginary);
                                    phase = Math.atan2 (imaginary, real);
                                    
                                }

                                else {
                                    //If we used the constructor, we can't be here.
                                    throw new Error("Invalid DFT algorithm selected " + this.algo);
                                }

				/* compute phase difference */
				tmp = phase - this.gLastPhase[k];
				this.gLastPhase[k] = phase;

				/* subtract expected phase difference */
				tmp -= k * expct;

				/* map delta phase into +/- Pi interval */

                                /* Floor and ceil should emulate the behaviour
                                 * of a C float -> long int conversion
                                 * "Truncating conversion means that any
                                 * fractional part is discarded, so that e.g.
                                 * 3.9 is converted to 3".
                                 * (http://www.cs.tut.fi/~jkorpela/round.html)*/

				qpd = tmp / Math.PI;
				if (qpd >= 0) {
                                    qpd = Math.floor(qpd);
                                    /* This probably won't work like in C */
                                    qpd += qpd & 1;
                                }
				else {
                                    qpd = Math.ceil(qpd);
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
                        
                        
                        /* ***************** PROCESSING ******************* */
			/* this does the actual pitch shifting */

                        //memset(gSynMagn, 0, fftFrameSize*sizeof(float));
			//memset(gSynFreq, 0, fftFrameSize*sizeof(float));

                        setArray(this.gSynMagn, this.fftFrameSize_, 0);
                        setArray(this.gSynFreq, this.fftFrameSize_, 0);
			
			for (k = 0; k <= fftFrameSize2; k++) {

                                //This is an int multiplication in C.
				index = Math.floor(k * pitchShift);
				
				if (index <= fftFrameSize2) {
                                    	this.gSynMagn[index] += this.gAnaMagn[k];
					this.gSynFreq[index] = this.gAnaFreq[k] * pitchShift;
                                    }
                            }


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
				this.real_[k] = magn* Math.cos(phase);
				this.imag_[k] = magn* Math.sin(phase);
			}

                        // zero negative frequencies
			for (k = ((fftFrameSize2)+1); (k < this.fftFrameSize_); k++) {

                            //That's ok, otherwise inverse fft has a fit.
                            this.real_[k] = 0;
			    this.imag_[k] = 0;

                        }
                        
			// Do the Inverse transform
                        signal = this.invFFT.inverse(this.real_, this.imag_);

			// Do inverse windowing and add to output accumulator
                        
			for(k=0; k < this.fftFrameSize_; k++) {

				this.gOutputAccum[k] += this.hannWindow_[k] * signal[k];

			}

                        for (k = 0; k < stepSize; k++) {
                            this.gOutFIFO[k] = this.gOutputAccum[k];
                        }

			// Shift the output accumulator.
                        // Rough memmove implementation.

                        var tempArray = this.gOutputAccum.slice (stepSize, stepSize + this.fftFrameSize_);
                        for (k = 0; k < this.fftFrameSize_; k++) {
                            this.gOutputAccum[k] = tempArray[k];
                        }

			// Shift the input FIFO
                        // These memory shifts have to be optimized.

			for (k = 0; k < inFifoLatency; k++) {
                            this.gInFIFO[k] = this.gInFIFO[k + stepSize];
                        }
                        
                    }

                }
                
            }
