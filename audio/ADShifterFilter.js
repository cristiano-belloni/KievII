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
  this.iter_number = 0;
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
      console.log ("Lazily initializing the pitchshifter, shift amount is " + this.shiftAmount);
      this.__shifter = new Pitchshift(this.__shifterParams.fftFrameSize, audioParameters.sampleRate, this.__shifterParams.algo);
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

    var i;
    //var channels = this.audioParameters.channels;

    console.log ("Before process, iteration " + this.iter_number + " data is long " + data.length + " first 10 samples are: " + data[0] + data[1] + data[2] + data[3] + data[4] + data[5] + data[6] + data[7] + data[8] + data[9]);
    console.log ("Before process, last 10 samples are: " + data[2038] + data[2039] + data[2040] + data[2041] + data[2042] + data[2043] + data[2044] + data[2045] + data[2046] + data[2047]);

    this.__shifter.process (this.shiftAmount, length, this.osamp, data);
    //data = this.__shifter.outdata.slice(0,length);

    for (i = 0; i < length; ++i) {
        data[i] = this.__shifter.outdata[i];
    }

    console.log ("After process, data is long " + data.length + " first 10 samples are: " + data[0] + data[1] + data[2] + data[3] + data[4] + data[5] + data[6] + data[7] + data[8] + data[9]);
    console.log ("After process, last 10 samples are: " + data[2038] + data[2039] + data[2040] + data[2041] + data[2042] + data[2043] + data[2044] + data[2045] + data[2046] + data[2047]);

    this.iter_number += 1;

};



