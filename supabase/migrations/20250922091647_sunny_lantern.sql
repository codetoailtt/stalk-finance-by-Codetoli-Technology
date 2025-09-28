/*
# Add other_service field to queries table

## Changes Made:
1. Add other_service field to queries table for custom service descriptions
2. Update existing queries to handle null service_id when other_service is provided

## New Fields:
- queries.other_service (text) - for custom service descriptions

## Security:
- All existing RLS policies remain intact
- New field follows same security model
*/

-- Add other_service field to queries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'other_service'
  ) THEN
    ALTER TABLE queries ADD COLUMN other_service TEXT;
  END IF;
END $$;

-- Add index for other_service field
CREATE INDEX IF NOT EXISTS idx_queries_other_service ON queries(other_service) WHERE other_service IS NOT NULL;

-- Update constraint to allow either service_id or other_service
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'queries_service_check'
  ) THEN
    ALTER TABLE queries DROP CONSTRAINT queries_service_check;
  END IF;
  
  ALTER TABLE queries ADD CONSTRAINT queries_service_check 
  CHECK (
    (service_id IS NOT NULL AND other_service IS NULL) OR
    (service_id IS NULL AND other_service IS NOT NULL)
  );
END $$;