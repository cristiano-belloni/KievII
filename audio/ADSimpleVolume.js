/**
 * Simple Volume .
 */
function ADSimpleVolume (next, volume) {
  AudioDataFilter.call(this, next);

  this.volume = volume;
  this.isOn = 1;

}

ADSimpleVolume.prototype = new AudioDataFilter(null);

/**
 * Initializes the filter with the audio parameters.
 * @param {AudioParameters} audioParameters The parameters of the sound.
 */
ADSimpleVolume.prototype.init = function (audioParameters) {
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
ADSimpleVolume.prototype.process = function (data, length) {
    //console.log ("We got some stuff to pass to process(); seem " + length + " samples, pitchShift factor is " +  this.shiftAmount + " und indata.length is " + data.length);
    if (length === 0) {
        return;
    }

    if (this.isOn) {
        // Yes, there are smartest ways, I guess. TODO.
        for (i = 0; i < length; ++i) {
            data[i] *= this.volume;
        }
    }

};

ADSimpleVolume.prototype.setOnOff = function (bypassValue) {
   this.isOn = bypassValue;
}

ADSimpleVolume.prototype.setVolume = function (volume) {
    this.volume = volume;
}
