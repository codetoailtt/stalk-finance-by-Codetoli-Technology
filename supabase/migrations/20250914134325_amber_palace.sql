/*
# Add Terms Acceptance and Enhanced Store Fields

## Changes Made:
1. Add terms acceptance fields to queries table
2. Add enhanced store fields (PAN card, partners, address requirement)
3. Add updated_at trigger for stores table
4. Update RLS policies as needed

## New Fields:
- queries.terms_accepted (boolean)
- queries.terms_accepted_at (timestamptz)
- stores.owner_pancard (text)
- stores.partner_name (text)
- stores.partner_name_2 (text)
- stores.updated_at (timestamptz)

## Security:
- All existing RLS policies remain intact
- New fields follow same security model
*/

-- Add terms acceptance fields to queries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'terms_accepted'
  ) THEN
    ALTER TABLE queries ADD COLUMN terms_accepted BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE queries ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add enhanced store fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'owner_pancard'
  ) THEN
    ALTER TABLE stores ADD COLUMN owner_pancard TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'partner_name'
  ) THEN
    ALTER TABLE stores ADD COLUMN partner_name TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'partner_name_2'
  ) THEN
    ALTER TABLE stores ADD COLUMN partner_name_2 TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE stores ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add updated_at trigger for stores table
DROP TRIGGER IF EXISTS trigger_update_stores_updated_at ON stores;
CREATE TRIGGER trigger_update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Update other_store JSONB structure to include address field
-- Note: This is handled at the application level, no schema change needed for JSONB

-- Add index for terms acceptance queries
CREATE INDEX IF NOT EXISTS idx_queries_terms_accepted ON queries(terms_accepted) WHERE terms_accepted = true;

-- Add index for store PAN card (for faster lookups)
CREATE INDEX IF NOT EXISTS idx_stores_owner_pancard ON stores(owner_pancard) WHERE owner_pancard IS NOT NULL;

-- Update existing queries to have terms_accepted = true (for backward compatibility)
-- In production, you might want to handle this differently
UPDATE queries 
SET terms_accepted = true, terms_accepted_at = created_at 
WHERE terms_accepted IS NULL OR terms_accepted = false;

-- Make terms_accepted NOT NULL after updating existing records
ALTER TABLE queries ALTER COLUMN terms_accepted SET NOT NULL;
ALTER TABLE queries ALTER COLUMN terms_accepted SET DEFAULT true;

-- Add constraint to ensure terms_accepted_at is set when terms_accepted is true
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'queries_terms_accepted_at_check'
  ) THEN
    ALTER TABLE queries ADD CONSTRAINT queries_terms_accepted_at_check 
    CHECK (
      (terms_accepted = false AND terms_accepted_at IS NULL) OR
      (terms_accepted = true AND terms_accepted_at IS NOT NULL)
    );
  END IF;
END $$;

-- Update sample stores with new fields (optional)
UPDATE stores 
SET 
  owner_pancard = CASE 
    WHEN name = 'Downtown Business Center' THEN 'ABCDE1234F'
    WHEN name = 'Westside Financial Hub' THEN 'FGHIJ5678K'
    ELSE NULL
  END,
  partner_name = CASE 
    WHEN name = 'Central Plaza Services' THEN 'Alice Chen'
    WHEN name = 'Northgate Business Park' THEN 'Robert Brown'
    ELSE NULL
  END,
  updated_at = NOW()
WHERE name IN ('Downtown Business Center', 'Westside Financial Hub', 'Central Plaza Services', 'Northgate Business Park');