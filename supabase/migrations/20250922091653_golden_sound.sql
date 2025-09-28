/*
# Add GSTIN field to stores table

## Changes Made:
1. Add gstin_no field to stores table for GST identification

## New Fields:
- stores.gstin_no (text) - for GST identification number

## Security:
- All existing RLS policies remain intact
- New field follows same security model
*/

-- Add GSTIN field to stores table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'gstin_no'
  ) THEN
    ALTER TABLE stores ADD COLUMN gstin_no TEXT;
  END IF;
END $$;

-- Add index for GSTIN field
CREATE INDEX IF NOT EXISTS idx_stores_gstin_no ON stores(gstin_no) WHERE gstin_no IS NOT NULL;

-- Add constraint for GSTIN format (15 characters)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stores_gstin_format_check'
  ) THEN
    ALTER TABLE stores ADD CONSTRAINT stores_gstin_format_check 
    CHECK (gstin_no IS NULL OR LENGTH(gstin_no) = 15);
  END IF;
END $$;