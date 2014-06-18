class CreateWubs < ActiveRecord::Migration
  def change
    create_table :wubs do |t|
      t.string :name
      t.integer :owner_id
      t.integer :num_beats_per_bar
      t.integer :num_bars
      t.integer :bpm

      t.timestamps
    end
  end
end
