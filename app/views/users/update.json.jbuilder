json.user do
  json.extract! @user, :id, :first_name, :last_name, :email, :phone, :date_of_birth
end
