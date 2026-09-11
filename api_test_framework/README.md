# API Test Framework

Black-box HTTP test harness for RepoAPI. It does **not** load Rails: it talks to a running server the same way a client would.

## Layout

```
api_test_framework/
  lib/api_test_framework/   # client, config, session, response
  spec/repo_api/            # contract tests against the live API
  spec/unit/                # framework unit tests (no server)
```

## Setup

```bash
cd api_test_framework
bundle install
cp .env.example .env
```

Default base URL is `http://localhost:3001`. Override with `API_BASE_URL`.

## Run tests

Start RepoAPI first:

```bash
# from the Rails app root
bin/rails s -p 3001
```

Then:

```bash
cd api_test_framework
bundle exec rspec
```

Unit specs (no server):

```bash
bundle exec rspec spec/unit
```

If the API is down and you still want the suite to skip instead of fail:

```bash
API_SKIP_IF_DOWN=1 bundle exec rspec
```

## Writing a new test

```ruby
session = ApiTestFramework::Session.new
session.register(first_name: "Ana", last_name: "Lopez", email: "ana@example.com", pin: "1234")
api = session.authenticated_client

response = api.get("/api/v1/accounts")
expect(response).to have_http_status(200)
expect(response).to have_json_keys("accounts") # adjust to the real payload
```

`Client` methods: `get`, `post`, `put`, `patch`, `delete`.  
`Response` helpers: `status`, `json`, `[]`, `success?`, `elapsed_ms`.
