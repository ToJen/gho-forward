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


## API Doc

### [1] Lender Signatures

#### [1.1] Save Signature

##### [1.1.1] Request
```http request
POST {lfgho_backend}/signatures

{
    "lender_address": "0x123",
    "borrow_request_id": 1,
    "signature": "ljnfldls"
}
```

##### [1.1.2] Response
```
{
    "id":1,
    "lender_address":"0x123",
    "borrow_request_id":1,
    "signature":"ljnfldls"
}
```

#### [1.2] Fetch Signature by Borrow Request ID

##### [1.2.1] Request
```http request
GET {lfgho_backend}/signatures?borrow_request_id=1
```

##### [1.2.2] Response
```
{
    "id":1,
    "lender_address":"0x123",
    "borrow_request_id":1,
    "signature":"ljnfldls"
}
```

### [2] Gitcoin Passport

#### [2.1] Submit Passport

##### [2.1.1] Request
```http request
POST {lfgho_backend}/submit_passport

{
    "eth_address": "0x123..."
}
```

##### [2.1.2] Response
```
{
    "address": "0x123...",
    "error": null,
    "evidence": null,
    "last_score_timestamp": "2024-01-20T13:15:56.648663+00:00",
    "score": "7.375268",
    "stamp_scores": {
        "EthGTEOneTxnProvider": 0.0,
        "githubAccountCreationGte#180": 1.230878,
        "githubAccountCreationGte#365": 1.430878,
        "githubAccountCreationGte#90": 1.020878,
        "githubContributionActivityGte#120": 1.230878,
        "githubContributionActivityGte#30": 1.230878,
        "githubContributionActivityGte#60": 1.230878
    },
    "status": "DONE"
}
```

#### [2.2] Fetch Passport Score

##### [2.2.1] Request
```http request
GET {lfgho_backend}/get_passport_score?eth_address=0x123...
```

##### [2.2.2] Response
```
{
    "address": "0x123...",
    "error": null,
    "evidence": null,
    "last_score_timestamp": "2024-01-20T13:13:25.054804+00:00",
    "score": "7.375268000",
    "stamp_scores": {
        "EthGTEOneTxnProvider": 0.0,
        "githubAccountCreationGte#180": 1.230878,
        "githubAccountCreationGte#365": 1.430878,
        "githubAccountCreationGte#90": 1.020878,
        "githubContributionActivityGte#120": 1.230878,
        "githubContributionActivityGte#30": 1.230878,
        "githubContributionActivityGte#60": 1.230878
    },
    "status": "DONE"
}
```

