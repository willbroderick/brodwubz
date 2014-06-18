class WubController < ApplicationController
  before_action :authenticate_user!

  def create
    wub = Wub.new do |w|
      w.name = 'Wubway Sandwich'
      w.owner_id = current_user.id
      w.num_beats_per_bar = 4
      w.num_bars = 4
      w.bpm = 120
      w.save
    end
    redirect_to wub_path(wub)
  end

  def index
    # list all of your own wubs
    @wubs = Wub.where(owner_id: current_user.id)
  end

  def show
    @wub = Wub.find(params.require(:id))
    respond_to do |format|
      format.html
      format.json { render json: @wub }
    end
  end

  def addtrack
    @wub = Wub.find(params.require(:id))
    @instruments = Instrument.all
    
    if params.has_key? :existing or params.has_key? :new
      @track = Track.new do |t|
        t.creator_id = current_user.id
        t.wub_id = @wub.id
        t.name = 'New track'
        t.beats = ''
      end

      if params.has_key? :new
        @inst = Instrument.new
        @inst.load_defaults
        @inst.creator_id = current_user.id
        @inst.save
        @track.instrument_id = @inst.id
        @track.save
        redirect_to edit_instrument_path(@inst)
      elsif params.has_key? :existing
        @track.instrument_id = params.require(:existing_instrument).to_i
        @track.save
        redirect_to wub_path(@wub)
      end
    end
  end

  def deletetrack
    # permissionslol
    @wub = Wub.find(params.require(:wub_id))
    @track = Track.find(params.require(:track_id))
    @track.delete
    redirect_to wub_path(@wub)
  end
end
