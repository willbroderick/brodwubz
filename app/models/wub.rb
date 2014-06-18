class Wub < ActiveRecord::Base
  has_many :tracks, dependent: :destroy

  def to_json(some_stuff)
    Jbuilder.encode do |json|
      json.wub_id self.id
      json.name self.name
      json.owner User.find(self.owner_id)
      json.bpm self.bpm
      json.numBeatsPerBar self.num_beats_per_bar
      json.numBars self.num_bars

      json.tracks self.tracks do |track|
        json.track_id track.id
        json.name track.name
        json.beats track.beats
        json.creator User.find(track.creator_id)
        json.instrument_type track.instrument.instrument_type
        json.frequency track.instrument.frequency
        json.envelope track.instrument.parsed_envelope
      end
    end
  end
end
