function AudioDataBeeswax() {
}

BeeswaxSource = function (sampleRate) {
    this.audioParameters = new AudioParameters(1, sampleRate);

    this.read = function(soundData) {
        var size = soundData.length;
        // In place.
        BWP.process (soundData);
        //soundData[i] = ;
        return size;
    };
}

AudioDataBeeswax.prototype.init = function (audioParameters) {
  this.sampleRate = audioParameters.sampleRate;
  this.currentSoundSample = 0;
  /* todo we want a new() here */
  this.beeswaxDSP = BWP;
  this.beeswaxDSP.init(this.sampleRate);
  this.audioSource = new BeeswaxSource(this.sampleRate);
  this.audioDestination = new AudioDataDestination();
  this.audioDestination.autoLatency = true;
  this.audioDestination.writeAsync(this.audioSource);
};

AudioDataBeeswax.prototype.noteOn = function (noteNum) {
    BWP.status[noteNum] = 1;
}

AudioDataBeeswax.prototype.noteOff = function (noteNum) {
    BWP.status[noteNum] = 0;
}

AudioDataBeeswax.prototype.setCutoff = function (cutoffValue) {
    BWP.fcutoff = Math.pow((cutoffValue + 50)/200, 5);
}

AudioDataBeeswax.prototype.setResonance = function (resValue) {
    BWP.freso = resValue / 127;
}

AudioDataBeeswax.prototype.setFeedback = function (feedValue) {
    BWP.ffeedback = 0.01 + Math.pow (feedValue / 127, 4) * 0.9;
}

AudioDataBeeswax.prototype.setVolume = function (volValue) {
    BWP.volume = volValue;
}

AudioDataBeeswax.prototype.setBypass = function (bypassON) {
    BWP.bypass = bypassON;
}