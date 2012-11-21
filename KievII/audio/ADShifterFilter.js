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
  this.isOn = true;

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

    //console.log ("We got some stuff to pass to process(); seem " + length + " samples, pitchShift factor is " +  this.shiftAmount + " und indata.length is " + data.length);
    if (length === 0) {
        return;
    }

    var i;

    if (this.isOn) {

        this.__shifter.process (this.shiftAmount, length, this.osamp, data);
        //data = this.__shifter.outdata.slice(0,length);

        for (i = 0; i < length; ++i) {
            data[i] = this.__shifter.outdata[i];
        }

    }

    this.iter_number += 1;

};

AudioDataShifterFilter.prototype.getShift = function () {
    console.log ("getShift: returning ", this.shiftAmount);
    return this.shiftAmount;
}

AudioDataShifterFilter.prototype.setShift = function (shiftAmount) {
   this.shiftAmount = shiftAmount;
}

AudioDataShifterFilter.prototype.setOnOff = function (bypassValue) {
   this.isOn = bypassValue;
}
