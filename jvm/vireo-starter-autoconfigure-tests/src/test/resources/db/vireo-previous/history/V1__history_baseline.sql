-- Change history table owned by vireo-starter-history.
--
-- Append-only log. Populated by the service layer on every create/update/delete
-- of a managed entity. The action is derived from the snapshot pair (previous
-- null = create, current null = delete, else update).
--
-- The entity column holds whatever the application declares in its own
-- HistoryEntityType implementation. There is deliberately no CHECK constraint:
-- the library owns this table but not the set of values that may appear in it.
--
-- The foreign key into app_user is why this module migrates after auth.

CREATE TABLE IF NOT EXISTS history (
    id UUID PRIMARY KEY,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    owner_id UUID,
    owner_username VARCHAR(100) NOT NULL,
    entity VARCHAR(32) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    snapshot_previous TEXT,
    snapshot_current TEXT,
    CONSTRAINT fk_history_owner FOREIGN KEY (owner_id) REFERENCES app_user (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_history_entity_row ON history (entity, entity_id, occurred_at DESC);
