-- Run ONCE in Neon after `npm run db:push`. Removes duplicate facilities (keeps the approved one, else the oldest), then blocks new duplicates.
-- Fails (safely) if a duplicate already has bookings; delete those bookings first if they are test data.
DELETE FROM facilities WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY owner_id, lower(name), lower(address)
    ORDER BY (approval_status = 'APPROVED') DESC, created_at, id) AS rn FROM facilities) t WHERE rn > 1);
CREATE UNIQUE INDEX IF NOT EXISTS facilities_owner_name_addr_uq ON facilities (owner_id, lower(name), lower(address));
