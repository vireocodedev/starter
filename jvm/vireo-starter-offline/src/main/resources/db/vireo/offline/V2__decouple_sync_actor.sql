-- Offline actors are supplied through OfflineActorResolver and need not belong
-- to the optional starter Auth user store. Keep the captured UUID as audit data
-- without coupling command persistence to Auth's replaceable schema.
ALTER TABLE sync_command DROP CONSTRAINT IF EXISTS fk_sync_command_owner;

-- H2 2.4 persists an IN-list check expression with state tied to Flyway's
-- migration session. Rebuild the constraint with an equivalent CASE expression
-- so application connections can evaluate it after Flyway closes its session.
ALTER TABLE sync_command DROP CONSTRAINT IF EXISTS ck_sync_command_status;
ALTER TABLE sync_command ADD CONSTRAINT ck_sync_command_status CHECK (
    CASE status
        WHEN 'PENDING' THEN TRUE
        WHEN 'DONE' THEN TRUE
        WHEN 'FAILED' THEN TRUE
        WHEN 'REJECTED' THEN TRUE
        ELSE FALSE
    END
);
