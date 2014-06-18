class Instrument < ActiveRecord::Base
  has_many :tracks, dependent: :destroy
  validates :name, presence: true
  validate :oscillation_config_valid

  def load_defaults
    self.name = 'New Instrument'
    self.instrument_type = 'sine'
    self.frequency = 400
    self.envelope = set_envelope_using_obj([
      { :f => 'set', :v => 0.01, :t => 0 },
      { :f => 'exponential', :v => 1, :t => 0.1 },
      { :f => 'exponential', :v => 0.1, :t => 0.6 },
      { :f => 'linear', :v => 0, :t => 0.7 }
    ])
  end

  def oscillation_config_valid
    if instrument_type == 'sine' or instrument_type == 'square' or instrument_type == 'sawtooth' or instrument_type == 'triangle'
      # validate oscillator

      errors.add(:frequency, 'Frequency must be an integer') unless frequency.is_a? Integer

      env_obj = parsed_envelope
      if env_obj.is_a? Array
        previous_time = -1
        env_obj.each do |item|
          f = item['f']
          v = item['v']
          t = item['t']
          errors.add(:envelope, "Invalid ramp type: #{f}") unless f == 'set' or f == 'linear' or f == 'exponential'
          errors.add(:envelope, 'Invalid gain: #{v}, must be between 0 and 1') unless (v.is_a? Integer or v.is_a? Float) and v >= 0 and v <= 1
          errors.add(:envelope, 'Invalid time: #{t}, must be greater than 0 and the previous time') unless (t.is_a? Integer or t.is_a? Float) and t >= 0 and t > previous_time
          previous_time = t || 0
          # cannot go to 0 using exponential ramp - API cannot hack it
          errors.add(:envelope, 'Cannot ramp to #{v} when using exponential ramp') if v == 0 and f == 'exponential'
        end
      else
        errors.add(:envelope, 'Envelope was not parsed into an array')
      end
    else
      errors.add(:instrument_type, 'Invalid waveform')
    end
  end

  def set_envelope_using_obj(obj)
    self.envelope = JSON.generate(obj)
  end

  def parsed_envelope
    JSON.parse(self.envelope)
  end
end
