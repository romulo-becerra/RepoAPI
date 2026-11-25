class PromoteSeedAdminRole < ActiveRecord::Migration[8.0]
  def up
    admin_email = ENV.fetch("ANGELFIRE_ADMIN_EMAIL", "admin@angelfire.local")
    quoted_email = connection.quote(admin_email)
    execute "UPDATE users SET role = 3 WHERE email = #{quoted_email} AND role = 1"
  end

  def down
    admin_email = ENV.fetch("ANGELFIRE_ADMIN_EMAIL", "admin@angelfire.local")
    quoted_email = connection.quote(admin_email)
    execute "UPDATE users SET role = 1 WHERE email = #{quoted_email} AND role = 3"
  end
end
