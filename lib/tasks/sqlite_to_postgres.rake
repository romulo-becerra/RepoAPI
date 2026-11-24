namespace :db do
  desc "Copy SQLite records into an empty PostgreSQL database"
  task import_sqlite: :environment do
    require "sqlite3"

    source_path = ENV.fetch("SQLITE_SOURCE") do
      raise "Set SQLITE_SOURCE to the SQLite database file to import"
    end
    source_path = File.expand_path(source_path, Rails.root)
    raise "SQLite source file not found: #{source_path}" unless File.file?(source_path)

    connection = ActiveRecord::Base.connection
    unless connection.adapter_name == "PostgreSQL"
      raise "The destination database must be PostgreSQL"
    end

    ignored_tables = %w[ar_internal_metadata schema_migrations]
    source = SQLite3::Database.new(source_path, readonly: true)
    source.results_as_hash = true

    source_tables = source.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
    ).map { |row| row["name"] } - ignored_tables

    missing_tables = source_tables - connection.data_sources
    raise "PostgreSQL is missing source tables: #{missing_tables.join(', ')}" if missing_tables.any?

    populated_tables = (connection.data_sources - ignored_tables).select do |table|
      connection.select_value("SELECT COUNT(*) FROM #{connection.quote_table_name(table)}").to_i.positive?
    end
    if populated_tables.any?
      raise "PostgreSQL destination must be empty; populated tables: #{populated_tables.join(', ')}"
    end

    source_columns = source_tables.to_h do |table|
      pragma = "PRAGMA table_info(#{connection.quote_table_name(table)})"
      [ table, source.execute(pragma).map { |row| row["name"] } ]
    end
    destination_columns = source_tables.to_h do |table|
      [ table, connection.columns(table).index_by(&:name) ]
    end

    source_columns.each do |table, columns|
      unknown_columns = columns - destination_columns.fetch(table).keys
      if unknown_columns.any?
        raise "PostgreSQL table #{table} is missing source columns: #{unknown_columns.join(', ')}"
      end

      required_columns = destination_columns.fetch(table).values.select do |column|
        !column.null && column.default.nil? && column.default_function.nil? && !columns.include?(column.name)
      end
      if required_columns.any?
        raise "SQLite table #{table} is missing required columns: #{required_columns.map(&:name).join(', ')}"
      end
    end

    dependencies = source_tables.to_h do |table|
      referenced_tables = connection.foreign_keys(table).map(&:to_table)
      [ table, referenced_tables & source_tables ]
    end
    remaining_tables = source_tables.dup
    import_order = []
    until remaining_tables.empty?
      ready_tables = remaining_tables.select do |table|
        (dependencies.fetch(table) & remaining_tables).empty?
      end
      raise "Foreign key cycle prevents importing SQLite tables" if ready_tables.empty?

      import_order.concat(ready_tables)
      remaining_tables -= ready_tables
    end

    begin
      connection.transaction do
        import_order.each do |table|
          columns = source_columns.fetch(table)
          quoted_table = connection.quote_table_name(table)
          quoted_columns = columns.map { |column| connection.quote_column_name(column) }
          source_count = source.get_first_value("SELECT COUNT(*) FROM #{quoted_table}").to_i
          insert_sql = "INSERT INTO #{quoted_table} (#{quoted_columns.join(', ')}) VALUES "
          imported_count = 0

          source.execute("SELECT * FROM #{quoted_table}") do |row|
            values = columns.map do |column|
              destination_column = destination_columns.fetch(table).fetch(column)
              value = ActiveRecord::Type.lookup(destination_column.type).deserialize(row[column])
              connection.quote(value)
            end
            connection.execute("#{insert_sql}(#{values.join(', ')})")
            imported_count += 1
          end

          connection.reset_pk_sequence!(table)
          destination_count = connection.select_value("SELECT COUNT(*) FROM #{quoted_table}").to_i
          unless source_count == imported_count && source_count == destination_count
            raise "Row count mismatch for #{table}: SQLite=#{source_count}, imported=#{imported_count}, PostgreSQL=#{destination_count}"
          end

          puts "[sqlite-import] #{table}: #{imported_count} rows"
        end
      end
    ensure
      source.close
    end
  end
end
