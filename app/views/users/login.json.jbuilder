json.message "Inicio de sesión exitoso"
json.token @token

json.user do
  json.extract! @user, :id, :first_name, :last_name, :email, :phone, :date_of_birth
  json.role @user.role
end

json.account do
  json.extract! @account, :id, :clabe, :account_number
end
