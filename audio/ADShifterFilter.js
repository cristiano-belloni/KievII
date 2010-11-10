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
  this.__shifter = new Pitchshift(this.__shifterParams.fftFrameSize, this.audioParameters.sampleRate);
  this.shiftAmount = (this.__shifterParams.shiftAmount); // Initial shift amount
  this.osamp = (this.__shifterParams.osamp);             // Initial osamp amount (?)

}

AudioDataShifterFilter.prototype = new AudioDataFilter(null);

/**
 * Initializes the filter with the audio parameters.
 * @param {AudioParameters} audioParameters The parameters of the sound.
 */
AudioDataShifterFilter.prototype.init = function (audioParameters) {
  AudioDataFilter.prototype.init.call(this, audioParameters);
  this.__updateCoefficients();
};

/**
 * Processes the signal.
 * @param {Array} data The signal data.
 * @param {int} length The signal data to be processed starting from the beginning.
 */
AudioDataLowPassFilter.prototype.process = function (data, length) {
  if (length === 0) {
    return;
  }

  //var channels = this.audioParameters.channels;

  this.__shifter.process (this.shiftAmount, length, this.osamp, data)

};



