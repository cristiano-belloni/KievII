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
    console.log ("We got some shit to pass to process; seem " + length + " samples, pitchShift factor is " +  this.shiftAmount + " und indata.length is " + data.length);
    if (length === 0) {
        return;
    }

    //var channels = this.audioParameters.channels;
    this.__shifter.process (this.shiftAmount, length, this.osamp, data);
    console.log ("After processing");

    console.log ("After processing, we got an outData that is long " + this.__shifter.outdata);
    //console.log ("o[0] " + this.__shifter.outdata[0] + " o[1] " + this.__shifter.outdata[1] + " o[2] " + this.__shifter.outdata[2] + " o[3] " + this.__shifter.outdata[3] + " o[4] " + this.__shifter.outdata[4] + "o[5] " + this.__shifter.outdata[5] + "o[6] " + this.__shifter.outdata[6] + "o[7] " + this.__shifter.outdata[7] + "o[8] " + this.__shifter.outdata[8] + "o[9] " + this.__shifter.outdata[9] + "o[10] " + this.__shifter.outdata[10]);
    data = this.__shifter.outdata;
    console.log ("data that is long " + this.__shifter.outdata);
    //console.log ("o[0] " + data[0] + " o[1] " + data[1] + " o[2] " + data[2] + " o[3] " + data[3] + " o[4] " + data[4] + "o[5] " + data[5] + "o[6] " + data[6] + "o[7] " + data[7] + "o[8] " + data[8] + "o[9] " + data[9] + "o[10] " + data[10]);

};



