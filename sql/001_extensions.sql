-- Run in the Neon SQL editor BEFORE `npm run db:push`.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- fuzzy search
