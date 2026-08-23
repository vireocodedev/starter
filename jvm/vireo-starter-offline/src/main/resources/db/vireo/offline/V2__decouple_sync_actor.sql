-- Offline actors are supplied through OfflineActorResolver and need not belong
-- to the optional starter Auth user store. Keep the captured UUID as audit data
-- without coupling command persistence to Auth's replaceable schema.
ALTER TABLE sync_command DROP CONSTRAINT IF EXISTS fk_sync_command_owner;
