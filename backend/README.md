# backend
Includes service for storing lender signatures and also for interacting with Gitcoin Passport APIs.

## Requirements
- Rust & Cargo
- Docker
- Postgres
- Diesel CLI
  - `cargo install diesel_cli --no-default-features --features postgres`

## Setup

### Server
- `cargo build`

### Docker
- `docker compose up -d`

### Database
- `diesel migration run`

## Running
- `cargo run`
