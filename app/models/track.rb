class Track < ActiveRecord::Base
  belongs_to :wub
  belongs_to :instrument
end
