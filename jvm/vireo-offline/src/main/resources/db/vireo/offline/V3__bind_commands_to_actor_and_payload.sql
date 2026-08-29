-- Replay identities are scoped to the resolved application actor. Existing
-- rows receive a deterministic owner key, but their payload fingerprint remains
-- null so the service refuses to replay them after this security boundary is
-- introduced.
ALTER TABLE sync_command ADD COLUMN IF NOT EXISTS owner_key VARCHAR(140);
ALTER TABLE sync_command ADD COLUMN IF NOT EXISTS request_fingerprint VARCHAR(64);

UPDATE sync_command
SET owner_key = CASE
    WHEN owner_id IS NOT NULL THEN 'id:' || CAST(owner_id AS VARCHAR(36))
    ELSE 'username:' || LOWER(owner_username)
END;

ALTER TABLE sync_command ALTER COLUMN owner_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_sync_command_owner_command ON sync_command (owner_key, command_id);
