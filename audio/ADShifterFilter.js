/**
 * Pitch shifter filter.
 * @param next The source or destination object. Depends whether
 *   read or write will be performed.
 * @param {ShifterParams} shifterParams The init pitch shifter parameters.
 * @constructor
 * @base AudioDataFilter
 */
function AudioDataShifterFilter(next, shifterParams) {
  AudioDataFilter.call(this, next);

  /**
   * Gets shift parameters.
   * @type object
   */
  this.__shifterParams = shifterParams;
  this.shiftAmount = (this.__shifterParams.shiftAmount); // Initial shift amount
  this.osamp = (this.__shifterParams.osamp);             // Initial osamp amount 

}

AudioDataShifterFilter.prototype = new AudioDataFilter(null);

/**
 * Initializes the filter with the audio parameters.
 * @param {AudioParameters} audioParameters The parameters of the sound.
 */
AudioDataShifterFilter.prototype.init = function (audioParameters) {
  AudioDataFilter.prototype.init.call(this, audioParameters);
  if (this.__shifter == undefined) {
      console.log ("Lazily initializing the pitchshifter");
      this.__shifter = new Pitchshift(this.__shifterParams.fftFrameSize, audioParameters.sampleRate);
  }
};

/**
 * Processes the signal.
 * @param {Array} data The signal data.
 * @param {int} length The signal data to be processed starting from the beginning.
 */
AudioDataShifterFilter.prototype.process = function (data, length) {
    //console.log ("We got some shit to pass to process; seem " + length + " samples, pitchShift factor is " +  this.shiftAmount + " und indata.length is " + data.length);
    if (length === 0) {
        return;
    }

    var i, data_buf;
    //var channels = this.audioParameters.channels;
    this.__shifter.process (this.shiftAmount, length, this.osamp, data);

    data_buf = this.__shifter.outdata;

    //console.log ("After processing, we got an outData that is long " + this.__shifter.outdata.length + " first 10 samples are: " + this.__shifter.outdata.slice (0,10));
    console.log ("Copying " + data_buf.length + " worth of samples");
    for (i = 0; i < data_buf.length; i +=1) {
        data[i] = data_buf[i];
    }

    console.log ("data that is long " + data.length + " first 10 samples are: " + data.slice (0,10));

};



