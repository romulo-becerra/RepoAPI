require 'cgi'
require 'net/http'
require 'uri'

class BcbExchangeRatesService
  SOURCE_URL = 'https://www.bcb.gob.bo/?q=cotizaciones_tc'.freeze

  def call
    html = fetch_html
    parsed = parse_html(html)
    return parsed if parsed

    fallback_payload
  rescue StandardError => error
    fallback_payload.merge(
      'status' => 'fallback',
      'message' => "No se pudo actualizar desde BCB: #{error.message}"
    )
  end

  private

  def fetch_html
    uri = URI.parse(SOURCE_URL)
    response = Net::HTTP.get_response(uri)
    raise "BCB respondio con status #{response.code}" unless response.is_a?(Net::HTTPSuccess)

    response.body
  end

  def parse_html(html)
    rows = extract_rows(html)

    official_row = rows.find do |cells|
      cells.length >= 4 && cells[2].to_s.strip.upcase == 'USD'
    end

    currencies = rows.select do |cells|
      code = cells[2].to_s.strip.upcase
      cells.length >= 5 && code.match?(/\A[A-Z]{3}\z/) && code != 'USD'
    end

    ufv_row = rows.find do |cells|
      cells.any? { |value| value.to_s.upcase.include?('UFV') } && cells.length >= 4
    end

    return nil if official_row.nil? || currencies.empty? || ufv_row.nil?

    title = extract_title(html)

    {
      'status' => 'ok',
      'title' => title,
      'source_url' => SOURCE_URL,
      'official_rate' => {
        'country' => official_row[0],
        'currency' => official_row[1],
        'code' => official_row[2],
        'tco_bs_usd' => official_row[3]
      },
      'currencies' => currencies.map do |cells|
        {
          'country_region' => cells[0],
          'currency' => cells[1],
          'code' => cells[2],
          'bs_per_unit' => cells[3],
          'fx_rate' => cells[4]
        }
      end,
      'ufv' => {
        'country' => ufv_row[0],
        'description' => ufv_row[1],
        'code' => ufv_row[2],
        'value' => ufv_row[3]
      },
      'updated_at' => Time.current.iso8601
    }
  end

  def extract_rows(html)
    html.scan(%r{<tr[^>]*>(.*?)</tr>}im).filter_map do |row_match|
      row_html = row_match.first
      cells = row_html.scan(%r{<(?:td|th)[^>]*>(.*?)</(?:td|th)>}im).map do |cell_match|
        normalize_text(cell_match.first)
      end

      next if cells.empty?
      next if cells.all?(&:empty?)

      cells
    end
  end

  def normalize_text(raw)
    text = raw.to_s
      .gsub(%r{<br\s*/?>}i, ' ')
      .gsub(%r{<[^>]+>}, ' ')
      .gsub(/\s+/, ' ')
      .strip

    CGI.unescapeHTML(text)
  end

  def extract_title(html)
    title = html[/TABLA\s+DE\s+COTIZACIONES[^<\n]*/i]
    return fallback_payload['title'] if title.nil?

    normalize_text(title)
  end

  def fallback_payload
    {
      'status' => 'fallback',
      'title' => 'TABLA DE COTIZACIONES DEL 1 DE AGOSTO DE 2026',
      'source_url' => SOURCE_URL,
      'official_rate' => {
        'country' => 'ESTADOS UNIDOS',
        'currency' => 'DOLAR',
        'code' => 'USD',
        'tco_bs_usd' => '12.13'
      },
      'currencies' => [
        { 'country_region' => 'ARGENTINA', 'currency' => 'PESO', 'code' => 'ARS', 'bs_per_unit' => '0.00815', 'fx_rate' => '1,487.6575' },
        { 'country_region' => 'AUSTRALIA', 'currency' => 'DOLAR', 'code' => 'AUD', 'bs_per_unit' => '8.53222', 'fx_rate' => '1.42167' },
        { 'country_region' => 'BRASIL', 'currency' => 'REAL', 'code' => 'BRL', 'bs_per_unit' => '2.39175', 'fx_rate' => '5.0716' },
        { 'country_region' => 'CANADA', 'currency' => 'DOLAR', 'code' => 'CAD', 'bs_per_unit' => '8.65316', 'fx_rate' => '1.4018' },
        { 'country_region' => 'CHILE', 'currency' => 'PESO', 'code' => 'CLP', 'bs_per_unit' => '0.01303', 'fx_rate' => '930.86' },
        { 'country_region' => 'COLOMBIA', 'currency' => 'PESO', 'code' => 'COP', 'bs_per_unit' => '0.00385', 'fx_rate' => '3,152.58' },
        { 'country_region' => 'COREA DEL SUR', 'currency' => 'WON', 'code' => 'KRW', 'bs_per_unit' => '0.0084', 'fx_rate' => '1,443.21' },
        { 'country_region' => 'EMIRATOS ARABES', 'currency' => 'DIRHAM', 'code' => 'AED', 'bs_per_unit' => '3.30248', 'fx_rate' => '3.673' },
        { 'country_region' => 'HONG KONG', 'currency' => 'DOLAR', 'code' => 'HKD', 'bs_per_unit' => '1.54676', 'fx_rate' => '7.8422' },
        { 'country_region' => 'INDIA', 'currency' => 'RUPIA', 'code' => 'INR', 'bs_per_unit' => '0.12716', 'fx_rate' => '95.3925' },
        { 'country_region' => 'JAPON', 'currency' => 'YEN', 'code' => 'JPY', 'bs_per_unit' => '0.07621', 'fx_rate' => '159.16' },
        { 'country_region' => 'MEXICO', 'currency' => 'PESO', 'code' => 'MXN', 'bs_per_unit' => '0.70014', 'fx_rate' => '17.3251' },
        { 'country_region' => 'NORUEGA', 'currency' => 'CORONA', 'code' => 'NOK', 'bs_per_unit' => '1.2794', 'fx_rate' => '9.481' },
        { 'country_region' => 'PARAGUAY', 'currency' => 'GUARANI', 'code' => 'PYG', 'bs_per_unit' => '0.00203', 'fx_rate' => '5.963' },
        { 'country_region' => 'PERU', 'currency' => 'NUEVO SOL', 'code' => 'PEN', 'bs_per_unit' => '3.56922', 'fx_rate' => '3.3985' },
        { 'country_region' => 'REINO UNIDO', 'currency' => 'LIBRA', 'code' => 'GBP', 'bs_per_unit' => '16.34264', 'fx_rate' => '0.74223' },
        { 'country_region' => 'REP. POPULAR CHINA', 'currency' => 'YUAN RENMINBI', 'code' => 'CNY', 'bs_per_unit' => '1.79664', 'fx_rate' => '6.7515' },
        { 'country_region' => 'REP. POPULAR CHINA OFFSHORE', 'currency' => 'YUAN RENMINBI OFFSHORE', 'code' => 'CNH', 'bs_per_unit' => '1.79627', 'fx_rate' => '6.7529' },
        { 'country_region' => 'SUECIA', 'currency' => 'CORONA', 'code' => 'SEK', 'bs_per_unit' => '1.27357', 'fx_rate' => '9.5244' },
        { 'country_region' => 'SUIZA', 'currency' => 'FRANCO', 'code' => 'CHF', 'bs_per_unit' => '15.00124', 'fx_rate' => '0.8086' },
        { 'country_region' => 'UNION EUROPEA', 'currency' => 'EURO', 'code' => 'EUR', 'bs_per_unit' => '13.98223', 'fx_rate' => '0.86753' },
        { 'country_region' => 'URUGUAY', 'currency' => 'PESO', 'code' => 'UYU', 'bs_per_unit' => '0.30125', 'fx_rate' => '40.265' }
      ],
      'ufv' => {
        'country' => 'BOLIVIA (UFV)',
        'description' => 'UNIDAD DE FOMENTO DE VIVIENDA',
        'code' => 'Bs/UFV',
        'value' => '3.32157'
      },
      'updated_at' => Time.current.iso8601,
      'message' => 'Se muestran datos de respaldo locales.'
    }
  end
end
