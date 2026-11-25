# API & Service Communication Contracts

The application exposes a versioned REST API with synchronous JSON requests and responses, plus CSV downloads for selected management reports. It is a single API service; the currency-rates endpoint also makes a synchronous request to an external provider on cache misses.

## Service Catalog

| Service | Port | Category | Purpose |
| --- | --- | --- | --- |
| RepoAPI Rails application | 3000 (container), 3001 (local host) | API Layer | Serves the `/api/v1` REST API and the static AngelFire UI and endpoint explorer. |

## API Endpoints Inventory

Routes below are grouped by controller to keep the inventory navigable. JSON request bodies and responses are the default unless noted; Rails resource updates accept both PUT and PATCH.

| Service / Controller | Method and path | Request type | Response type / status |
| --- | --- | --- | --- |
| Rails health | GET `/up` | None | Health response, 200 |
| UsersController | GET `/` | None | Service status JSON, 200 |
| UsersController | POST `/api/v1/register` | JSON user details; optional phone, date_of_birth, address | User, JWT and default account JSON, 201; validation errors, 422 |
| UsersController | POST `/api/v1/login` | JSON account_number and PIN | User including date_of_birth, account and JWT, 200; auth errors, 401/403 |
| UsersController | POST `/api/v1/logout` | JWT header | Logout message JSON, 200 |
| UsersController | PUT/PATCH `/api/v1/users/:id` | JWT header and JSON profile attributes including optional date_of_birth | Updated user JSON, 200; errors, 400/422 |
| UsersController | PUT `/api/v1/users/:id/pin` | JWT header and JSON current_pin/new_pin | Status JSON, 200; auth/validation errors, 401/422 |
| UsersController | GET `/api/v1/users/:id/profile` | JWT header and path id | Own profile JSON including date_of_birth, 200; not found, 404 |
| UserAddressesController | GET/PUT `/api/v1/users/:id/address` | JWT; PUT JSON address attributes | Address JSON, 200/201; validation errors, 422 |
| UserFilesController | GET/POST `/api/v1/users/:id/files` | JWT; POST multipart form field `file` | File list or created file JSON, 200/201 |
| UserFilesController | DELETE `/api/v1/users/:id/files/:file_id` | JWT and path ids | Deletion status JSON, 200; not found, 404 |
| AccountsController | GET `/api/v1/accounts`, GET `/api/v1/accounts/:id` | JWT and optional path id | Account list/detail JSON, 200 |
| AccountsController | POST `/api/v1/accounts` | JWT and JSON account attributes | Created account JSON, 201 |
| AccountsController | GET `/api/v1/accounts/:id/balance`, GET `/api/v1/accounts/:id/summary` | JWT and account path id | Balance or account summary JSON, 200 |
| AccountsController | POST `/api/v1/accounts/:id/deposit`, POST `/api/v1/accounts/:id/withdraw` | JWT and JSON amount/description | Transaction result JSON, 200; validation/business errors |
| AccountsController | POST `/api/v1/accounts/:id/transfer` | JWT and JSON recipient/amount/description | Transfer result JSON, 200; validation/business errors |
| AccountsController | POST `/api/v1/accounts/:id/pay_service` | JWT and JSON service/amount/description | Payment result JSON, 200; validation/business errors |
| TransactionsController | GET `/api/v1/accounts/:account_id/transactions` | JWT, path id and pagination/filter query | Paginated transaction JSON, 200 |
| TransactionsController | POST `/api/v1/accounts/:account_id/transactions` | JWT, path id and JSON recipient/amount | Created transaction JSON, 201; validation/business errors |
| LoansController | GET/POST `/api/v1/accounts/:account_id/loans` | JWT, path id; POST JSON loan request | Loan list or created loan JSON, 200/201 |
| LoansController | GET `/api/v1/accounts/:account_id/loans/:id` | JWT and path ids | Loan detail JSON, 200 |
| LoansController | POST `/api/v1/accounts/:account_id/loans/:id/pay` | JWT, path ids and JSON payment | Payment result JSON, 200; validation/business errors |
| LoansController | GET `/api/v1/accounts/:account_id/loans/:id/installments` | JWT, path ids and pagination query | Installment summary/list JSON, 200 |
| RecipientsController | GET/POST `/api/v1/recipients` | JWT; POST recipient JSON | Recipient list or created recipient JSON, 200/201 |
| RecipientsController | DELETE `/api/v1/recipients/:id` | JWT and path id | Status JSON, 200; not found, 404 |
| RecipientsController | GET `/api/v1/recipients/search` | JWT and search query | Matching recipient JSON, 200 |
| ContactsController | GET/POST `/api/v1/contacts` | JWT; POST nested contact JSON | Contact list or created contact JSON, 200/201 |
| ContactsController | DELETE `/api/v1/contacts/:id` | JWT and path id | Status JSON, 200; not found, 404 |
| ServicesController | GET `/api/v1/services`, GET `/api/v1/services/:id` | JWT and optional path id | Service list/detail JSON, 200 |
| CurrencyRatesController | GET `/api/v1/currency_rates` | None | Exchange-rate JSON, 200; fallback payload if external fetch fails |
| AtmOperationsController | POST `/api/v1/atm/accounts/:id/deposit`, POST `/api/v1/atm/accounts/:id/withdraw` | JWT, account path id, PIN and amount in JSON | ATM operation JSON, 200; auth/business errors |
| AtmOperationsController | GET `/api/v1/atm/accounts/:id/balance`, GET `/api/v1/atm/accounts/:id/statement` | JWT, account path id and PIN query | Balance or recent transaction JSON, 200 |
| Manager::UsersController | GET `/api/v1/manager/users`, GET `/api/v1/manager/users/:id` | JWT with manager/admin role; pagination or path id | User list/detail JSON including date_of_birth, 200 |
| Manager::UsersController | POST `/api/v1/manager/users` | JWT with admin role and JSON user attributes including optional date_of_birth | Created user JSON, 201; validation errors, 422 |
| Manager::UsersController | PUT/PATCH `/api/v1/manager/users/:id` | JWT with admin role, path id and JSON attributes including date_of_birth | Updated user JSON, 200; validation errors, 422 |
| Manager::UsersController | DELETE `/api/v1/manager/users/:id` | JWT with admin role and path id | Deletion status JSON, 200; not found, 404 |
| Manager::UsersController | PATCH `/api/v1/manager/users/:id/block`, `/unblock`, `/deactivate` | JWT with admin role and path id | Updated user/status JSON, 200; authorization/state errors |
| Manager::ReportsController | GET `/api/v1/manager/reports/overview`, `/loans`, `/accounts_activity` | JWT with manager/admin role and optional filters | Report JSON, 200 |
| Manager::LoginsController | GET `/api/v1/manager/logins`, GET `/api/v1/manager/logins/download` | JWT with manager/admin role and report filters | Paginated JSON or CSV, 200 |
| Manager::OperationsController | GET `/api/v1/manager/operations`, GET `/api/v1/manager/operations/download` | JWT with manager/admin role and report filters | Paginated JSON or CSV, 200 |
| Manager::LoansController | POST `/api/v1/manager/loans/:id/cancel` | JWT with manager/admin role and path id | Status JSON, 200; state/authorization errors |
| Manager::LoansController | POST `/api/v1/manager/accounts/:account_id/loans/preview`, POST `/api/v1/manager/accounts/:account_id/loans` | JWT with manager/admin role, account path id and JSON loan request | Preview or created loan JSON, 200/201 |
| Manager::LoansController | GET `/api/v1/manager/accounts/:account_id/loans/:loan_id/installments`, `/installments/summary`, `/installments/download` | JWT with manager/admin role, path ids and optional pagination | Paginated/summary JSON or CSV, 200 |
| Manager::AccountOperationsController | GET `/api/v1/manager/accounts/:account_id/summary` | JWT with staff role and account id/number | Account/operations summary JSON, 200 |
| Manager::AccountOperationsController | POST `/api/v1/manager/accounts/:account_id/deposit`, `/withdraw` | JWT with staff role, account id and JSON amount | Operation JSON, 200; validation/business errors |
| Manager::AccountOperationsController | POST `/api/v1/manager/accounts/:account_id/loans/:loan_id/pay` | JWT with manager/admin role, path ids and JSON payment | Payment result JSON, 200; validation/business errors |

## Management & Observability Endpoints

| Service | Endpoint | Custom metrics |
| --- | --- | --- |
| Rails application | GET `/up` | None found |
| Rails application | GET `/` | Returns API service status; no metrics |

No Actuator, Prometheus, or custom metrics endpoint was found.

## DTOs & Contracts

The API uses Rails controllers and strong-parameter hashes for requests, with Active Record models and Jbuilder or controller serializers for responses. The main contract entities are `User`, `Account`, `Transaction`, `Loan`, `LoanInstallment`, `Recipient`, `Contact`, `UserAddress`, and `UserFile`; `User` responses expose the optional `date_of_birth` field where the user is represented. These are mutable service-level models, not immutable gateway DTOs. JSON is the primary serialization format; CSV is used for selected report/download endpoints. No OpenAPI/Swagger, protobuf, or GraphQL contract was found.

## Communication Patterns

- Client-to-service requests use synchronous REST over HTTP with JSON, multipart uploads, or CSV downloads.
- Controllers call application services and Active Record synchronously; persistence uses the configured SQLite database.
- `GET /api/v1/currency_rates` reads a Rails cache entry with a six-hour expiry. On a cache miss, `BcbExchangeRatesService` synchronously fetches the public Banco Central de Bolivia page. Failures return a fallback payload; there is no explicit retry, circuit breaker, or request timeout configured in the service.
- No message broker, asynchronous inter-service calls, service discovery, or API gateway was found.
- Protected endpoints use JWT authentication. Manager/admin checks protect management operations, and ownership checks constrain user/account operations. Registration, login, health, root status, and currency rates do not require a JWT. No TLS configuration was found in the application routes/configuration.

## Service Technology Matrix

| Service | Web | Data access | Discovery | Gateway | Health | Cache | Metrics |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RepoAPI Rails application | Rails API | Active Record / SQLite | None | None | `/up` | Rails cache | None found |

## Service Communication Sequence

<!-- mermaid-checked: every participant uses `participant Id as "Label"`, no \n in aliases/messages/notes, every alt/opt/loop closed by end, no `:` inside any alias -->
~~~mermaid
sequenceDiagram
    participant Client as "API Client"
    participant Rails as "RepoAPI Rails API"
    participant Auth as "JWT and Role Checks"
    participant DB as "SQLite Database"
    participant Cache as "Rails Cache"
    participant BCB as "Banco Central de Bolivia"

    Client->>Rails: POST /api/v1/login
    Rails->>DB: Find account and verify PIN
    DB-->>Rails: User and account
    Rails->>Auth: Check account status
    Auth-->>Rails: Authentication allowed
    Rails-->>Client: 200 User, account and JWT

    Client->>Rails: GET /api/v1/users/id/profile with JWT
    Rails->>Auth: Verify JWT and user ownership
    Auth-->>Rails: Request authorized
    Rails->>DB: Load profile
    DB-->>Rails: User including date_of_birth
    Rails-->>Client: 200 Profile JSON

    Client->>Rails: GET /api/v1/currency_rates
    Rails->>Cache: Read exchange rates
    alt Cache hit
        Cache-->>Rails: Cached rates
    else Cache miss
        Rails->>BCB: Fetch published rates
        alt Provider available
            BCB-->>Rails: Exchange-rate page
            Rails->>Cache: Store rates for six hours
        else Provider unavailable
            BCB-->>Rails: Request failure
            Rails->>Rails: Build fallback payload
        end
    end
    Rails-->>Client: 200 Exchange rates or fallback
~~~
