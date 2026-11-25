json.message "Inicio de sesión exitoso"
json.token @token
json.session_token @session_token if @session_token
json.remember_token @remember_token if @remember_token
json.expires_in 24.hours.to_i

json.user do
  json.extract! @user, :id, :first_name, :last_name, :email, :phone, :date_of_birth
  json.role @user.role
  json.role_label @user.role.to_s.humanize
  json.active @user.active?
  json.blocked @user.blocked?
  json.last_login_at @user.last_login_at
  json.document_number @user.document_number
end

json.account do
  json.extract! @account, :id, :clabe, :account_number
end

json.permissions @permissions

json.dashboard_url @dashboard_url

json.sessions do
  json.active_count @user.user_sessions.active.count
end