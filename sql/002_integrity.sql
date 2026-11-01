-- Run in the Neon SQL editor AFTER `npm run db:push`. Safe to re-run: every object is dropped (if present) and recreated.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (facility_id WITH =, tstzrange(start_time, end_time) WITH &&)
  WHERE (status IN ('PENDING_APPROVAL','PENDING_PAYMENT','PENDING_VERIFICATION','CONFIRMED'));
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_valid_range;
ALTER TABLE bookings ADD CONSTRAINT bookings_valid_range CHECK (start_time < end_time);
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_chk;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_chk CHECK (status IN
  ('PENDING_APPROVAL','PENDING_PAYMENT','PENDING_VERIFICATION','CONFIRMED','REJECTED','EXPIRED','CANCELLED'));
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_bt;
ALTER TABLE users ADD CONSTRAINT users_phone_bt CHECK (phone IS NULL OR phone ~ '^\+975(77|17|16)[0-9]{6}$');
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS facilities_location_point;
ALTER TABLE facilities ADD CONSTRAINT facilities_location_point CHECK (geometrytype(location::geometry) = 'POINT');
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS facilities_approval_chk;
ALTER TABLE facilities ADD CONSTRAINT facilities_approval_chk CHECK (approval_status IN ('PENDING','APPROVED','REJECTED'));
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_chk;
ALTER TABLE users ADD CONSTRAINT users_role_chk CHECK (role IN ('PLAYER','OWNER','ADMIN'));

CREATE OR REPLACE FUNCTION bookings_guard() RETURNS trigger AS $$
DECLARE n int; u record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_advisory_xact_lock(hashtext(NEW.player_id::text));  -- serialises per player: cap is race-free
    SELECT is_locked, is_suspended, booking_ban_until INTO u FROM users WHERE id = NEW.player_id;
    IF u.is_locked OR u.is_suspended THEN RAISE EXCEPTION 'ACCOUNT_LOCKED' USING ERRCODE='P0001'; END IF;
    IF u.booking_ban_until IS NOT NULL AND u.booking_ban_until > now() THEN RAISE EXCEPTION 'BOOKING_BANNED' USING ERRCODE='P0001'; END IF;
    SELECT count(*) INTO n FROM bookings WHERE player_id = NEW.player_id AND status IN ('PENDING_APPROVAL','PENDING_PAYMENT');
    IF n >= 3 THEN RAISE EXCEPTION 'BOOKING_CAP' USING ERRCODE='P0001'; END IF;
    IF NEW.status <> 'PENDING_APPROVAL' THEN RAISE EXCEPTION 'BAD_INITIAL_STATUS' USING ERRCODE='P0001'; END IF;
    IF NEW.start_time <= now() THEN RAISE EXCEPTION 'PAST_BOOKING' USING ERRCODE='P0001'; END IF;
    IF NEW.start_time > now() + interval '90 days' THEN RAISE EXCEPTION 'TOO_FAR' USING ERRCODE='P0001'; END IF;
  ELSIF NEW.status = 'CONFIRMED' AND OLD.status <> 'PENDING_VERIFICATION' THEN
    RAISE EXCEPTION 'CONFIRM_REQUIRES_VERIFICATION' USING ERRCODE='P0001';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS bookings_guard_t ON bookings;
CREATE TRIGGER bookings_guard_t BEFORE INSERT OR UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION bookings_guard();

CREATE OR REPLACE FUNCTION audit_immutable() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'audit_logs is append-only'; END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS audit_no_mod ON audit_logs;
CREATE TRIGGER audit_no_mod BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION audit_immutable();
DROP TRIGGER IF EXISTS audit_no_trunc ON audit_logs;
CREATE TRIGGER audit_no_trunc BEFORE TRUNCATE ON audit_logs FOR EACH STATEMENT EXECUTE FUNCTION audit_immutable();

ALTER TABLE facility_blocks DROP CONSTRAINT IF EXISTS fb_chk;
ALTER TABLE facility_blocks ADD CONSTRAINT fb_chk CHECK ((kind = 'DATE' AND on_date IS NOT NULL) OR (kind = 'WEEKDAY' AND weekday BETWEEN 0 AND 6));
