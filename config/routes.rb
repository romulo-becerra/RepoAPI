Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  get "/" => "users#index"

  scope :api do
    scope :v1 do
      resources :accounts, only: %i[show create index] do
        resources :transactions, only: [ :index, :create ]
        resources :loans, only: %i[index show create] do
          member do
            post :pay
            get :installments
          end
        end
      end
      resources :recipients, only: %i[index create destroy]
      resources :contacts, only: %i[index create destroy]
      resources :services, only: [ :index, :show ]
      post "accounts/:id/pay_service", to: "accounts#pay_service"
      post "accounts/:id/transfer", to: "accounts#transfer"
      post "accounts/:id/deposit", to: "accounts#deposit"
      post "accounts/:id/withdraw", to: "accounts#withdraw"
      get "accounts/:id/balance", to: "accounts#balance"
      get "accounts/:id/summary", to: "accounts#summary"
      get "recipients/search", to: "recipients#search"
      post "logout", to: "users#logout"

      scope :atm do
        post "accounts/:id/deposit", to: "atm_operations#deposit"
        post "accounts/:id/withdraw", to: "atm_operations#withdraw"
        get "accounts/:id/balance", to: "atm_operations#balance"
        get "accounts/:id/statement", to: "atm_operations#statement"
      end

      namespace :manager do
        get "reports/overview", to: "reports#overview"
        get "reports/loans", to: "reports#loans"
        get "reports/accounts_activity", to: "reports#accounts_activity"
        get "logins/download", to: "logins#download"
        get "logins", to: "logins#index"
        get "operations/download", to: "operations#download"
        get "operations", to: "operations#index"
        resources :users, only: [ :index, :show, :create, :destroy, :update ] do
          member do
            patch :block
            patch :unblock
            patch :deactivate
            put :basic_auth_password
          end
        end

        post "loans/:id/cancel", to: "loans#cancel"
        post "accounts/:account_id/loans/preview", to: "loans#preview"
        post "accounts/:account_id/loans", to: "loans#create_for_account"
        get "accounts/:account_id/summary", to: "account_operations#summary"
        get "accounts/:account_id/loans/:loan_id/installments", to: "loans#installments"
        get "accounts/:account_id/loans/:loan_id/installments/summary", to: "loans#installments_summary"
        get "accounts/:account_id/loans/:loan_id/installments/download", to: "loans#download_installments"
        post "accounts/:account_id/deposit", to: "account_operations#deposit"
        post "accounts/:account_id/withdraw", to: "account_operations#withdraw"
        post "accounts/:account_id/pay_service", to: "account_operations#pay_service"
        post "accounts/:account_id/loans/:loan_id/pay", to: "account_operations#pay_loan"
      end

      post "register", to: "users#register"
      post "login", to: "users#login"
      get "currency_rates", to: "currency_rates#index"

      get "/accounts/:account_id/transactions", to: "transactions#index"

      resources :users, only: [ :update ] do
        member do
          put :pin
          put :basic_auth_password
          get :profile
          get :address, to: "user_addresses#show"
          put :address, to: "user_addresses#upsert"
          post :files, to: "user_files#create"
          get :files, to: "user_files#index"
          delete "files/:file_id", to: "user_files#destroy"
        end

        resources :api_keys, only: %i[index create destroy]
      end
    end
  end
end
