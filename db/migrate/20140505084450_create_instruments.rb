class CreateInstruments < ActiveRecord::Migration
  def change
    create_table :instruments do |t|
      t.string :instrument_type
      t.text :name
      t.integer :creator_id
      t.text :envelope
      t.integer :frequency

      t.timestamps
    end
  end
end
