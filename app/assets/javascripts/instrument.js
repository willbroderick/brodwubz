function Instrument(audioContext, config) {
  // Construct
  this.init = function(audioContext, config){
    //All tracks need a gain node
    this.gainNode = audioContext.createGain();
    this.gainNode.connect(audioContext.destination);
    this.gainNode.gain.value = 0;
    
    if(true) {
      this.audio_type = 'oscillator';
      this.oscillator = audioContext.createOscillator();
      this.oscillator.type = config.instrument_type;//"sine","square","sawtooth","triangle"
      this.oscillator.frequency.value = config.frequency;
      this.oscillator.connect(this.gainNode);
      //Begin silent oscillation
      this.oscillator.start(0); //Remember: Once you start, you can't stop & restart.
      this.envelope = config.envelope;
    }
    //TODO: samples
  };
  this.init(audioContext, config);
  
  // Functions
  this.play = function(time) {
    //TODO: Make this work with samples
    //Set up envelope
    for(var i=0; i<this.envelope.length; i++) {
      var e = this.envelope[i];
      if(e.f == 'set') {
        this.gainNode.gain.setValueAtTime(e.v, e.t + time);
      } else if(e.f == 'exponential') {
        this.gainNode.gain.exponentialRampToValueAtTime(e.v, e.t + time);
      } else if(e.f == 'linear') {
        this.gainNode.gain.linearRampToValueAtTime(e.v, e.t + time);
      }
    }
  };
  this.stop = function(){
    //Shush
    this.gainNode.gain.cancelScheduledValues(0);
    this.gainNode.gain.value = 0;
  };
}

Instrument.prototype.playOnBeats = function(audioContext, beats, interval, totalBeats){
  var now = audioContext.currentTime;
  for(var i=0; i<beats.length; i++) {
    var b = beats[i];
    if(b < totalBeats) {
      this.play( now + b * interval );
    }
  }
};

