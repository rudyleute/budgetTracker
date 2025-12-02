CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE loan_types AS ENUM ('borrowed', 'lent');
CREATE TYPE priority_types AS ENUM ('low', 'medium', 'high');

CREATE TABLE IF NOT EXISTS users
(
    uid        VARCHAR(128) PRIMARY KEY,
    email      VARCHAR(255) UNIQUE      NOT NULL CHECK ( LENGTH(email) >= 5 ),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK ( updated_at <= NOW() )
);

CREATE TABLE IF NOT EXISTS categories
(
    id         UUID PRIMARY KEY                  DEFAULT uuid_generate_v4(),
    name       VARCHAR(100)             NOT NULL CHECK ( LENGTH(name) >= 3 ) unique,
    color      CHAR(7)                  NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK ( updated_at <= NOW() ),
    user_uid   VARCHAR(128)             NOT NULL REFERENCES users (uid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions
(
    id          UUID PRIMARY KEY                  DEFAULT uuid_generate_v4(),
    name        VARCHAR(255)             NOT NULL CHECK ( LENGTH(name) >= 3 ),
    price       NUMERIC(10, 2)           NOT NULL CHECK (price > 0),
    timestamp   TIMESTAMP                NOT NULL CHECK (timestamp <= NOW()),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK ( updated_at <= NOW() ),
    user_uid    VARCHAR(128)             NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    category_id UUID                     REFERENCES categories (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS counterparties
(
    id         UUID PRIMARY KEY                  DEFAULT uuid_generate_v4(),
    name       VARCHAR(100)             NOT NULL CHECK (LENGTH(name) >= 3),
    email      VARCHAR(255) CHECK ( LENGTH(email) >= 5 ),
    phone      VARCHAR(15) CHECK (phone ~ '^[1-9][0-9]{6,14}$'),
    note       VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK (updated_at <= NOW()),
    user_uid   VARCHAR(128)             NOT NULL REFERENCES users (uid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loans
(
    id              UUID PRIMARY KEY                  DEFAULT uuid_generate_v4(),
    name            VARCHAR(100)             NOT NULL CHECK (LENGTH(name) >= 3),
    timestamp       TIMESTAMP WITH TIME ZONE NOT NULL CHECK ( timestamp <= NOW() ),
    deadline        TIMESTAMP WITH TIME ZONE,
    type            loan_types               NOT NULL,
    priority        priority_types,
    price           NUMERIC(10, 2)           NOT NULL CHECK (price > 0),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK (created_at <= NOW()),
    counterparty_id UUID                     NOT NULL REFERENCES counterparties (id) ON DELETE CASCADE,
    user_uid        VARCHAR(128)             NOT NULL REFERENCES users (uid) ON DELETE CASCADE
);

CREATE INDEX idx_loans_user_uid ON loans (user_uid);
CREATE INDEX idx_loans_user_uid_counterparty_id ON loans (counterparty_id, user_uid);
CREATE INDEX idx_loans_user_uid_deadline ON loans (user_uid, deadline);
CREATE INDEX idx_loans_user_uid_priority ON loans (user_uid, priority);

CREATE INDEX idx_counterparties_user_uid ON counterparties (user_uid);
CREATE INDEX idx_counterparties_user_uid_name ON counterparties (user_uid, name);

CREATE INDEX idx_transaction_user_uid
    ON transactions (user_uid);

CREATE INDEX idx_transaction_timestamp
    ON transactions (timestamp);

CREATE INDEX idx_transaction_user_timestamp
    ON transactions (user_uid, timestamp);