-- Authentication tables owned by vireo-starter-auth.
--
-- This history is separate from the consuming application's. Version numbers
-- here are the library's alone, so they will never collide with, reorder or
-- invalidate a migration the consumer wrote.
--
-- `role` is a plain VARCHAR with no CHECK constraint on purpose: the library
-- owns this table but not the set of role names an application may use.

CREATE TABLE IF NOT EXISTS app_user (
    id UUID PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE,
    modified_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    keywords VARCHAR(2048),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_app_user_username UNIQUE (username)
);
