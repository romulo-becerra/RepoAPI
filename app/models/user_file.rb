class UserFile < ApplicationRecord
  belongs_to :user
  belongs_to :uploaded_by_user, class_name: "User", optional: true

  before_destroy :cleanup_storage_file

  validates :original_filename, :stored_filename, :content_type, :storage_path, presence: true
  validates :file_size, numericality: { greater_than_or_equal_to: 0 }

  scope :recent, -> { order(created_at: :desc) }

  private

  def cleanup_storage_file
    File.delete(storage_path) if storage_path.present? && File.exist?(storage_path)
  end
end
