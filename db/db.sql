CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "user" (
    uid         VARCHAR(128) PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS category (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name    VARCHAR(100) NOT NULL,
    color   CHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    user_uid VARCHAR(128) NOT NULL REFERENCES "user" (uid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transaction (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    timestamp   TIMESTAMP NOT NULL CHECK (timestamp <= NOW()),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_uid     VARCHAR(128) NOT NULL REFERENCES "user" (uid) ON DELETE CASCADE,
    category_id UUID REFERENCES category (id) ON DELETE SET NULL
);

CREATE INDEX idx_transaction_user_uid
    ON transaction (user_uid);

CREATE INDEX idx_transaction_timestamp
    ON transaction (timestamp);

CREATE INDEX idx_transaction_user_timestamp
    ON transaction (user_uid, timestamp);
