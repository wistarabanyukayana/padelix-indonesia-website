-- Custom SQL migration file, put your code below! --

-- MySQL's ON UPDATE CURRENT_TIMESTAMP has no direct PostgreSQL equivalent.
-- This trigger keeps updated_at current on every row update, regardless of
-- whether the write comes from Drizzle or raw SQL.

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'updated_at'
  LOOP
    EXECUTE format('
      CREATE OR REPLACE TRIGGER set_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at()', t);
  END LOOP;
END;
$$;
