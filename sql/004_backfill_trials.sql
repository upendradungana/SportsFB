-- Owners verified before the trial logic existed have no plan, so their facilities are hidden from players. Safe to re-run.
INSERT INTO subscriptions (owner_id, status, expires_at)
SELECT id, 'ACTIVE', now() + interval '30 days' FROM users u
WHERE role = 'OWNER' AND is_verified_owner AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.owner_id = u.id);
