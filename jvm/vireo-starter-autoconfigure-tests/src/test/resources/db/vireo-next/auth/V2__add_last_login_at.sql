-- Stands in for a later release of vireo-auth. Merged into the auth
-- module's real location by the upgrade test, so the test sees the genuine V1
-- alongside this new file — exactly the shape of a library version bump.

ALTER TABLE app_user ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
