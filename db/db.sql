CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    uid         VARCHAR(128) PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL CHECK ( LENGTH(email) >= 5 ),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK ( updated_at <= NOW() )
);

CREATE TABLE IF NOT EXISTS categories (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name    VARCHAR(100) NOT NULL CHECK ( LENGTH(name) >= 3 ) unique,
    color   CHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK ( updated_at <= NOW() ),
    user_uid VARCHAR(128) NOT NULL REFERENCES users (uid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL CHECK ( LENGTH(name) >= 3 ),
    price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    timestamp   TIMESTAMP NOT NULL CHECK (timestamp <= NOW()),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK ( updated_at <= NOW() ),
    user_uid     VARCHAR(128) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    category_id UUID REFERENCES categories (id) ON DELETE SET NULL
);

CREATE INDEX idx_transaction_user_uid
    ON transactions (user_uid);

CREATE INDEX idx_transaction_timestamp
    ON transactions (timestamp);

CREATE INDEX idx_transaction_user_timestamp
    ON transactions (user_uid, timestamp);
