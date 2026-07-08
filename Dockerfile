FROM ruby:3.2.3-bookworm

ENV BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_JOBS=4 \
    BUNDLE_RETRY=3 \
    RAILS_ENV=development \
    PORT=3000

WORKDIR /app

RUN apt-get update -qq && apt-get install -y --no-install-recommends build-essential libsqlite3-dev libyaml-dev && rm -rf /var/lib/apt/lists/*

COPY Gemfile Gemfile.lock* ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]