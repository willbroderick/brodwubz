function isUndefined(obj){
  return typeof obj == 'undefined';
}

/// Main class for audio
function WubMachine(contextClass) {
  /// Constructor
  try {
    // Create new audio doodad
    window.audioContext = new contextClass();
    this.audioContext = window.audioContext;
  }
  catch(e) {
    alert('Web Audio API is not supported in this crappy browser. Chrome or Firefox only, bro.');
  }
  
  //Song data
  this.wub_id = 1; // Unique identifier for this entire song
  this.name = 'Uninitialised';
  this.owner = null;
  this.numBeatsPerBar = 4;
  this.numBars = 2;
  this.bpm = 120;
  this.tracks = [];
  this.isPlaying = false;
  this.nextLoopTimeoutID = -1;
  this.uiCurrentBeat = 0;
  this.uiBeatIntervalID = -1;
  
  /// Functions (not prototyping as this class will never actually be re-used)
  //Millisenconds between each beat
  this.getBeatIntervalMS = function() {
    return 1000 * 60.0 / this.bpm;
  }
  this.getBeatIntervalS = function() {
    return 60.0 / this.bpm;
  }
  
  this.getTotalBeats = function() {
    return this.numBeatsPerBar * this.numBars;
  }
  
  this.updateUI = function(beatUIOnly) {
    if(!beatUIOnly) {
      //Cosmetic
      $('#wubname').val(this.name);
      //Controls
      $('#play').html(this.isPlaying ? 'Stop' : 'Play');
      $('#bpm').val(this.bpm);
      $('#beatsperbar').val(this.numBeatsPerBar);
      $('#numbars').val(this.numBars);
      //Beat tracker
      $('#tracker').empty();
      for(var i=0; i<this.numBars; i++) {
        for(var j=0; j<this.numBeatsPerBar; j++) {
          $('#tracker').append('<span class="beat"></span>');
        }
      }
      //Tracks
      $('#tracks').empty();
      for(var i=0; i<this.tracks.length; i++) {
        var $track = $('<li class="track"/>').data('track-id', this.tracks[i].track_id).appendTo('#tracks');
        var $trackInfo = $('<span class="info"/>').appendTo($track).append(this.tracks[i].name)
          .append('<a href="#" class="delete">[delete]</a>');
        var $trackBeats = $('<span class="beats"/>').appendTo($track).data('beatArr', this.tracks[i].beats);
        for(var j=0; j<this.numBars*this.numBeatsPerBar; j++) {
          $trackBeats.append('<a href="#" class="beat"/>');
        }
      }
    }
    
    //Highlighting
    var self = this;
    $('#tracks .track').each(function(index, el){
      var $beats = $(el).find('.beats .beat').removeClass('active');
      for(var i=0; i<self.tracks[index].beats.length; i++) {
        $beats.eq(self.tracks[index].beats[i]).addClass('active');
      }
    });
    
    //Which beat are we on?
    if(this.isPlaying) {
      $('#tracker .beat').eq(this.uiCurrentBeat).addClass('active').siblings('.active').removeClass('active');
    } else {
      $('#tracker .beat.active').removeClass('active');
    }
  };
  
  this.addTrack = function(config){
    this.tracks.push({
      track_id: config.track_id,
      name: config.name,
      author: config.creator.email,
      instrument: new Instrument(this.audioContext, config),
      beats: config.beats || []
    });
    this.updateUI();
  };
  
  this.playIteration = function(doLoop) {
    //Play all bars
    for(var i=0; i<this.tracks.length; i++) {
      this.tracks[i].instrument.playOnBeats(this.audioContext, this.tracks[i].beats, this.getBeatIntervalS(), this.getTotalBeats());
    }
    //UI
    this.uiCurrentBeat = 0;
    this.updateUI(true);
    for(var i=0; i<this.numBeatsPerBar * this.numBars; i++) {
      clearInterval(this.uiBeatIntervalID);
      var self = this;
      this.uiBeatIntervalID = setInterval(function(){
        self.uiCurrentBeat++;
        self.updateUI(true);
      }, this.getBeatIntervalMS());
    }
    
    //Play again
    if(doLoop) {
      var self = this; // Mmmm closure
      this.nextLoopTimeoutID = setTimeout(function(){
        self.playIteration(true);
      }, this.getBeatIntervalMS() * this.numBeatsPerBar * this.numBars);
    }
  }
  
  this.togglePlay = function(onOrOff){
    //True = on, false = off, undefined == toggle
    if(isUndefined(onOrOff)) {
      onOrOff = !this.isPlaying;
    }
    if(onOrOff) {
      //Begin looped playback
      this.playIteration(true);
      this.isPlaying = true;
    } else {
      //Cease playback
      clearTimeout(this.nextLoopTimeoutID);
      for(var i=0; i<this.tracks.length; i++) {
        this.tracks[i].instrument.stop();
      }
      clearInterval(this.uiBeatIntervalID);
      this.isPlaying = false;
    }
    this.updateUI();
  };

  this.load_wub = function(wub_id){
    var self = this;
    $.getJSON('/wub/' + wub_id + '.json', function(data){
      //Loading data
      console.log('Loading: ' + JSON.stringify(data));
      //Copy all
      for(var key in data) {
        if(key == 'tracks') {
          self[key] = [];
          for(var i=0; i<data[key].length; i++) {
            self.addTrack(data[key][i]);
          }
        } else if(key == 'user') {
        } else {
          self[key] = data[key];
        }
      }
      //Reload UI
      self.updateUI();
    }).error(function(data){
      console.log('Erroneous response: ' + data);
    });
  };
}

$(function(){
  window.wubmachine = new WubMachine(window.AudioContext || window.webkitAudioContext);
  // Events
  $('#play').on('click', function(){
    wubmachine.togglePlay();
  });
  $('#beatsperbar').on('change', function(){
    wubmachine.numBeatsPerBar = parseInt($(this).val());
    wubmachine.togglePlay(false);
  });
  $('#numbars').on('change', function(){
    wubmachine.numBars = parseInt($(this).val());
    wubmachine.togglePlay(false); //Also redraws UI
  });
  $('#bpm').on('change', function(){
    wubmachine.bpm = parseInt($(this).val());
    wubmachine.togglePlay(false);
  });
  $('#new-track').on('click', function(e){
    e.preventDefault();
    window.location = '/wub/' + wubmachine.wub_id + '/addtrack';
  });
  $('#tracks').on('click', '.track .delete', function(e){
    e.preventDefault();
    window.location = '/wub/' + wubmachine.wub_id + '/deletetrack/' + $(this).closest('.track').data('track-id')
  });
  $('#tracks').on('click', '.track .beats .beat', function(){
    var thisIdx = $(this).index();
    var beatArr = $(this).parent().data('beatArr');
    if(beatArr.indexOf(thisIdx) >= 0) {
      beatArr.splice(beatArr.indexOf(thisIdx), 1);
    } else {
      beatArr.push(thisIdx);
    }
    wubmachine.updateUI();
    return false;
  });
});
