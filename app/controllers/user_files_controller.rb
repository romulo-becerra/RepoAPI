require "fileutils"
require "securerandom"

class UserFilesController < ApplicationController
  ALLOWED_CONTENT_TYPES = [
    "text/plain",
    "text/csv",
    "application/json",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp"
  ].freeze

  MAX_FILE_SIZE = 5.megabytes

  before_action :set_user

  def index
    files = @user.user_files.recent

    render json: {
      user_id: @user.id,
      files: files.map { |item| serialize_file(item) }
    }, status: :ok
  end

  def create
    file = params[:file]
    return render json: { errors: "Debe adjuntar un archivo" }, status: :unprocessable_entity unless file

    validate_upload!(file)

    stored_filename = "#{SecureRandom.hex(12)}_#{File.basename(file.original_filename)}"
    directory = Rails.root.join("storage", "user_uploads", @user.id.to_s)
    FileUtils.mkdir_p(directory)

    absolute_path = directory.join(stored_filename)
    File.binwrite(absolute_path, file.read)

    user_file = @user.user_files.create!(
      uploaded_by_user: current_user,
      original_filename: file.original_filename,
      stored_filename: stored_filename,
      content_type: file.content_type,
      file_size: file.size,
      storage_path: absolute_path.to_s
    )

    render json: {
      message: "Archivo cargado correctamente",
      file: serialize_file(user_file)
    }, status: :created
  rescue StandardError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  def destroy
    user_file = @user.user_files.find_by(id: params[:file_id])
    return render json: { errors: "Archivo no encontrado" }, status: :not_found unless user_file

    File.delete(user_file.storage_path) if File.exist?(user_file.storage_path)
    user_file.destroy!

    render json: { message: "Archivo eliminado correctamente", file_id: params[:file_id] }, status: :ok
  end

  private

  def set_user
    @user = User.find_by(id: params[:id])
    return render json: { errors: "Usuario no encontrado" }, status: :not_found unless @user
    return if current_user.manager? || current_user.id == @user.id

    render json: { errors: "No autorizado para gestionar archivos de este usuario" }, status: :forbidden
  end

  def validate_upload!(file)
    raise StandardError, "Tipo de archivo no permitido" unless ALLOWED_CONTENT_TYPES.include?(file.content_type)
    raise StandardError, "Archivo excede el tamaño máximo de 5MB" if file.size > MAX_FILE_SIZE
  end

  def serialize_file(user_file)
    {
      id: user_file.id,
      user_id: user_file.user_id,
      uploaded_by_user_id: user_file.uploaded_by_user_id,
      original_filename: user_file.original_filename,
      content_type: user_file.content_type,
      file_size: user_file.file_size,
      created_at: user_file.created_at
    }
  end
end
