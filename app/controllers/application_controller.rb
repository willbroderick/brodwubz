class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  rescue_from ActiveRecord::RecordNotFound, :with => :four_oh_four if Rails.env.production?

  def four_oh_four
    respond_to do |type|
      type.html { render :template => "errors/error_404", :status => 404 }
      type.all  { render :nothing => true, :status => 404 }
    end
    true
  end
end
