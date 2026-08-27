-- Offline sync tables owned by vireo-offline.
--
-- `sync_command` stores replayed offline commands and their processing status.
-- It is intentionally generic so domain-specific replay handlers can build on
-- the same command stream. `retry_count` is the bounded server-side replay
-- budget: once it reaches the service cap the row flips to REJECTED so the
-- client stops retrying and the failure stays visible.
--
-- The foreign key into app_user is why this module migrates after auth.

CREATE TABLE IF NOT EXISTS sync_command (
    id UUID PRIMARY KEY,
    command_id UUID NOT NULL UNIQUE,
    owner_id UUID,
    owner_username VARCHAR(100) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    request_body TEXT,
    request_headers TEXT,
    status VARCHAR(16) NOT NULL,
    response_status INTEGER,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT ck_sync_command_status CHECK (status IN ('PENDING', 'DONE', 'FAILED', 'REJECTED')),
    CONSTRAINT fk_sync_command_owner FOREIGN KEY (owner_id) REFERENCES app_user (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_sync_command_created_at ON sync_command (created_at DESC);
CREATE INDEX IF NOT EXISTS ix_sync_command_status_created_at ON sync_command (status, created_at DESC);

-- Monotonic per-entity revisions used by frontend hydration comparison.

CREATE TABLE IF NOT EXISTS offline_entity_version (
    entity_key VARCHAR(64) PRIMARY KEY,
    revision BIGINT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_offline_entity_version_changed_at ON offline_entity_version (changed_at DESC);
