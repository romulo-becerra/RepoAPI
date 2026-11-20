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
      post "accounts/:id/reverse/:transaction_id", to: "accounts#reverse"
      get "accounts/:id/balance", to: "accounts#balance"
      get "accounts/:id/summary", to: "accounts#summary"
      get "recipients/search", to: "recipients#search"
      get "receipts/:id", to: "receipts#show"
      get "receipts/:id/download", to: "receipts#download"
      get "transactions/:transaction_id/receipt", to: "receipts#transaction"
      post "logout", to: "users#logout"
      get "customer/dashboard", to: "customer_portal#dashboard"
      get "customer/transactions", to: "customer_portal#transactions"
      get "customer/accounts/:account_id/statement", to: "customer_portal#statement"
      get "customer/credit_requests", to: "customer_portal#credit_requests"
      post "customer/credit_requests", to: "customer_portal#create_credit_request"
      get "customer/tickets", to: "customer_portal#tickets"
      post "customer/tickets", to: "customer_portal#create_ticket"
      get "customer/preferences", to: "customer_portal#preferences"
      patch "customer/preferences", to: "customer_portal#update_preferences"
      get "customer/notifications", to: "customer_portal#notifications"
      patch "customer/notifications/:id/read", to: "customer_portal#mark_notification_read"

      scope :atm do
        post "accounts/:id/deposit", to: "atm_operations#deposit"
        post "accounts/:id/withdraw", to: "atm_operations#withdraw"
        get "accounts/:id/balance", to: "atm_operations#balance"
        get "accounts/:id/statement", to: "atm_operations#statement"
      end

      scope :customer_service do
        get "users/search", to: "customer_service#search"
        post "users", to: "customer_service#register"
        patch "users/:id", to: "customer_service#update"
        patch "users/:id/unblock", to: "customer_service#unblock"
        patch "users/:id/deactivate", to: "customer_service#deactivate"
        patch "users/:id/reactivate", to: "customer_service#reactivate"
        patch "users/:id/reset_password", to: "customer_service#reset_password"
        post "accounts", to: "customer_service#open_account"
        patch "accounts/:id/status", to: "customer_service#update_account_status"
        get "users/:user_id/accounts", to: "customer_service#accounts"
        get "tickets", to: "customer_service#tickets"
        post "tickets", to: "customer_service#create_ticket"
        patch "tickets/:id/close", to: "customer_service#close_ticket"
      end

      scope :cashier do
        post "cash/open", to: "cashier#open_cash"
        get "cash/status", to: "cashier#cash_status"
        get "cash/movements", to: "cashier#cash_movements"
        post "cash/reconciliation", to: "cashier#reconciliation"
        post "cash/close", to: "cashier#close_cash"
        get "reports/daily", to: "cashier#daily_report"
        get "receipts", to: "cashier#receipts"
        get "clients/search", to: "cashier#search_clients"
      end

      namespace :manager do
        resources :account_reconciliations, path: "reconciliations", only: %i[index create]
        get "users/search", to: "users#search"
        get "roles", to: "roles#index"
        resources :invoices, only: %i[index create]
        get "accounting/accounts", to: "accounting#accounts"
        post "accounting/accounts", to: "accounting#create_account"
        get "accounting/journal_entries", to: "accounting#journal_entries"
        post "accounting/journal_entries", to: "accounting#create_journal_entry"
        post "accounting/journal_entries/:id/approve", to: "accounting#approve_journal_entry"
        get "accounting/reports", to: "accounting#reports"
        get "reports/overview", to: "reports#overview"
        get "reports/dashboard", to: "reports#dashboard"
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
        patch "accounts/:account_id/limits", to: "account_operations#update_limits"
        patch "accounts/:account_id/status", to: "account_operations#update_status"
      end

      post "register", to: "users#register"
      post "login", to: "users#login"
      post "password/reset/request", to: "users#password_reset_request"
      post "password/reset", to: "users#password_reset"
      get "currency_rates", to: "currency_rates#index"
      get "practice/params", to: "practice#params_demo"

      get "/accounts/:account_id/transactions", to: "transactions#index"

      resources :users, only: [ :update ] do
        member do
          put :pin
          patch :force_password_change
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
