-- Add bounded lifecycle metadata and fail closed for legacy payloads that were
-- persisted before an application data-classification policy existed.
ALTER TABLE sync_command ADD COLUMN IF NOT EXISTS lifecycle_partition VARCHAR(140);
ALTER TABLE sync_command ADD COLUMN IF NOT EXISTS retain_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE sync_command ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN DEFAULT FALSE;
ALTER TABLE sync_command ADD COLUMN IF NOT EXISTS payload_redacted_at TIMESTAMP WITH TIME ZONE;

UPDATE sync_command
SET lifecycle_partition = owner_key,
    retain_until = created_at,
    legal_hold = FALSE,
    request_body = NULL,
    request_headers = NULL,
    payload_redacted_at = CURRENT_TIMESTAMP;

ALTER TABLE sync_command ALTER COLUMN lifecycle_partition SET NOT NULL;
ALTER TABLE sync_command ALTER COLUMN retain_until SET NOT NULL;
ALTER TABLE sync_command ALTER COLUMN legal_hold SET NOT NULL;

CREATE INDEX IF NOT EXISTS ix_sync_command_lifecycle_expiry
    ON sync_command (lifecycle_partition, legal_hold, retain_until);
CREATE INDEX IF NOT EXISTS ix_sync_command_lifecycle_owner
    ON sync_command (lifecycle_partition, owner_key);
