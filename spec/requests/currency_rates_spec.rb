require 'rails_helper'

RSpec.describe 'Currency rates API', type: :request do
  describe 'GET /api/v1/currency_rates' do
    let(:payload) do
      {
        'status' => 'ok',
        'title' => 'TABLA DE COTIZACIONES DEL 1 DE AGOSTO DE 2026',
        'source_url' => 'https://www.bcb.gob.bo/?q=cotizaciones_tc',
        'official_rate' => {
          'country' => 'ESTADOS UNIDOS',
          'currency' => 'DOLAR',
          'code' => 'USD',
          'tco_bs_usd' => '12.13'
        },
        'currencies' => [
          {
            'country_region' => 'PERU',
            'currency' => 'NUEVO SOL',
            'code' => 'PEN',
            'bs_per_unit' => '3.56922',
            'fx_rate' => '3.3985'
          }
        ],
        'ufv' => {
          'country' => 'BOLIVIA (UFV)',
          'description' => 'UNIDAD DE FOMENTO DE VIVIENDA',
          'code' => 'Bs/UFV',
          'value' => '3.32157'
        },
        'updated_at' => Time.current.iso8601
      }
    end

    it 'returns rates data without authentication' do
      allow_any_instance_of(BcbExchangeRatesService).to receive(:call).and_return(payload)

      get '/api/v1/currency_rates', headers: { 'Accept' => 'application/json' }

      expect(response).to have_http_status(:ok)
      parsed = JSON.parse(response.body)
      expect(parsed['official_rate']['code']).to eq('USD')
      expect(parsed['currencies']).to be_an(Array)
      expect(parsed['ufv']['code']).to eq('Bs/UFV')
    end
  end
end
