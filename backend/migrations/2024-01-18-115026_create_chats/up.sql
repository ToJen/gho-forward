-- Your SQL goes here
CREATE TABLE chats(
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    sender VARCHAR NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
