class InstrumentController < ApplicationController
  before_action :authenticate_user!

  def index
    # list instruments you have made
    @instruments = Instrument.where(:creator_id => current_user.id)
  end

  def edit
    @instrument = Instrument.find(params.require(:id))
=begin
    #TODO: move both edit & create forms to this one controller method
    #wub#addtrack will just creatinst = Instrument.new do |i|
        i.name = params.require(:name)
        i.creator_id = current_user.id
        i.instrument_type = params.require(:waveform)
        i.frequency = params.require(:frequency).to_i
        envobj = []
        params.require(:env_node_count).to_i.times do |iter|
          envobj.push({
            :f => params.require(:env_gain_ramp)[iter],
            :v => params.require(:env_gain)[iter].to_f,
            :t => params.require(:env_time)[iter].to_f
          })
        end
        i.set_envelope_using_obj(envobj)
        i.save
      end
      # no errors? add track
      if inst.errors.size == 0
        new_instrument_id = inst.id
      else
        @errors = inst.errors
      end
=end
  end

  def delete
    Instrument.where(:creator_id => current_user.id).find(params.require(:id)).destroy
    redirect_to my_instruments_path
  end
end
