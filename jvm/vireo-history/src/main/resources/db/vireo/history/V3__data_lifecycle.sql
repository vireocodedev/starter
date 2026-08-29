-- Every History row now has an explicit lifecycle partition, expiry, and hold.
-- Existing snapshots are redacted during adoption because no historical
-- application classification decision exists for those payloads.
ALTER TABLE history ADD COLUMN IF NOT EXISTS lifecycle_partition VARCHAR(140);
ALTER TABLE history ADD COLUMN IF NOT EXISTS retain_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE history ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN DEFAULT FALSE;

UPDATE history
SET lifecycle_partition = CASE
        WHEN actor_id IS NULL THEN 'system'
        ELSE 'actor:' || actor_id
    END,
    retain_until = occurred_at,
    legal_hold = FALSE,
    snapshot_previous = CASE WHEN snapshot_previous IS NULL THEN NULL ELSE '{}' END,
    snapshot_current = CASE WHEN snapshot_current IS NULL THEN NULL ELSE '{}' END;

ALTER TABLE history ALTER COLUMN lifecycle_partition SET NOT NULL;
ALTER TABLE history ALTER COLUMN retain_until SET NOT NULL;
ALTER TABLE history ALTER COLUMN legal_hold SET NOT NULL;

CREATE INDEX IF NOT EXISTS ix_history_lifecycle_expiry
    ON history (lifecycle_partition, legal_hold, retain_until);
CREATE INDEX IF NOT EXISTS ix_history_lifecycle_actor
    ON history (lifecycle_partition, actor_id);
