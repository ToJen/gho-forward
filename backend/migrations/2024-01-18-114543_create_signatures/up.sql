-- Your SQL goes here
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    lender_address TEXT NOT NULL,
    borrow_request_id INTEGER NOT NULL,
    signature TEXT NOT NULL
);
