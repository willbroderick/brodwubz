class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.integer :creator_id
      t.integer :wub_id
      t.string :name
      t.text :beats
      t.integer :instrument_id

      t.timestamps
    end
  end
end
