/* 
 MultiDelay = function(maxDelayInSamplesSize, delayInSamples, masterVolume, delayVolume){
 */


function AudioDataDelayFilter(next, delayParams) {
  AudioDataFilter.call(this, next);

  /**
   * Gets delay parameters.
   * @type delayParams
   */
  this.__delayParams = delayParams;
}

AudioDataDelayFilter.prototype = new AudioDataFilter(null);

/**
 * Initializes the filter with the audio parameters.
 * @param {AudioParameters} audioParameters The parameters of the sound.
 */
AudioDataDelayFilter.prototype.init = function (audioParameters) {
  AudioDataFilter.prototype.init.call(this, audioParameters);
  if (this.__delay == undefined) {
      console.log ("Lazily initializing the delay");
      this.__delay = new MultiDelay (this.__delayParams.maxDelayInSamplesSize, this.__delayParams.delayInSamples, this.__delayParams.masterVolume, this.__delayParams.delayVolume);
  }
};

/**
 * Processes the signal.
 * @param {Array} data The signal data.
 * @param {int} length The signal data to be processed starting from the beginning.
 */
AudioDataDelayFilter.prototype.process = function (data, length) {
    //console.log ("We got some shit to pass to process; seem " + length + " samples, pitchShift factor is " +  this.shiftAmount + " und indata.length is " + data.length);
    if (length === 0) {
        return;
    }
    var i;

    var channels = this.audioParameters.channels;
    var data_buf = this.__delay.process (data);

    console.log ("Copying " + data_buf.length + " worth of samples");
    for (i = 0; i < data_buf.length; i +=1) {
        data[i] = data_buf[i];
    }

    console.log ("data that is long " + data.length + " first 10 samples are: " + data.slice (0,10));

};

