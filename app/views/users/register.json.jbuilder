json.message "Usuario registrado exitosamente"
json.token @token

json.user do
  json.extract! @user, :id, :first_name, :last_name, :email, :phone, :date_of_birth
  json.role @user.role
end

if @user.user_address
  json.address do
    json.extract! @user.user_address, :country, :city, :province, :street, :street_number, :district, :postal_code, :reference
  end
end

json.account do
  json.extract! @account, :account_number, :balance, :clabe
end
