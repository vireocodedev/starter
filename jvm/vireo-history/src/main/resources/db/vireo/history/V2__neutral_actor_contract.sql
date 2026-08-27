-- Replace the original Starter Auth-specific owner columns with the neutral
-- actor contract introduced by History 0.2. Existing actor data is preserved.

ALTER TABLE history ADD COLUMN IF NOT EXISTS actor_id VARCHAR(128);
ALTER TABLE history ADD COLUMN IF NOT EXISTS actor_label VARCHAR(100);

-- A consumer can adopt Vireo migrations after creating the current schema by
-- other means. Temporary legacy columns make this migration safe for both that
-- shape and the published V1 shape without losing either representation.
ALTER TABLE history ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE history ADD COLUMN IF NOT EXISTS owner_username VARCHAR(100);

UPDATE history
SET actor_id = COALESCE(actor_id, CAST(owner_id AS VARCHAR(128))),
    actor_label = COALESCE(actor_label, owner_username);

ALTER TABLE history DROP CONSTRAINT IF EXISTS fk_history_owner;
ALTER TABLE history DROP COLUMN IF EXISTS owner_id;
ALTER TABLE history DROP COLUMN IF EXISTS owner_username;

DROP INDEX IF EXISTS ix_history_entity_row;
CREATE INDEX ix_history_entity_row ON history (entity, entity_id, occurred_at DESC, id DESC);
