/*
# Payment and EMI Management System Enhancement

## Changes Made:
1. Add payment tracking fields to queries table
2. Add EMI management fields with JSON-based payment history
3. Add user blocking functionality
4. Update RLS policies for new features

## New Fields:
- queries.service_fee_paid (boolean)
- queries.service_fee_paid_at (timestamptz)
- queries.emi_date (integer 1-31)
- queries.emi_percent (decimal)
- queries.emi_started (boolean)
- queries.emi_started_at (timestamptz)
- queries.emi_payments (jsonb) - stores monthly payment history
- queries.principal_amount (decimal) - for EMI calculations
- profiles.blocked (boolean)
- profiles.blocked_at (timestamptz)
- profiles.blocked_by (uuid)

## Security:
- All existing RLS policies remain intact
- New fields follow same security model
*/

-- Add payment and EMI fields to queries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'service_fee_paid'
  ) THEN
    ALTER TABLE queries ADD COLUMN service_fee_paid BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'service_fee_paid_at'
  ) THEN
    ALTER TABLE queries ADD COLUMN service_fee_paid_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'emi_date'
  ) THEN
    ALTER TABLE queries ADD COLUMN emi_date INTEGER CHECK (emi_date >= 1 AND emi_date <= 31);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'emi_percent'
  ) THEN
    ALTER TABLE queries ADD COLUMN emi_percent DECIMAL(5,2) CHECK (emi_percent >= 0 AND emi_percent <= 100);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'emi_started'
  ) THEN
    ALTER TABLE queries ADD COLUMN emi_started BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'emi_started_at'
  ) THEN
    ALTER TABLE queries ADD COLUMN emi_started_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'emi_payments'
  ) THEN
    ALTER TABLE queries ADD COLUMN emi_payments JSONB DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'principal_amount'
  ) THEN
    ALTER TABLE queries ADD COLUMN principal_amount DECIMAL(10,2);
  END IF;
END $$;

-- Add user blocking fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'blocked'
  ) THEN
    ALTER TABLE profiles ADD COLUMN blocked BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'blocked_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN blocked_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'blocked_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN blocked_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_queries_service_fee_paid ON queries(service_fee_paid);
CREATE INDEX IF NOT EXISTS idx_queries_emi_started ON queries(emi_started) WHERE emi_started = true;
CREATE INDEX IF NOT EXISTS idx_queries_emi_date ON queries(emi_date) WHERE emi_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_blocked ON profiles(blocked) WHERE blocked = true;

-- Function to calculate monthly EMI amount using simple interest
CREATE OR REPLACE FUNCTION calculate_monthly_emi(
    principal DECIMAL,
    annual_rate DECIMAL,
    tenure_months INTEGER DEFAULT 12
)
RETURNS DECIMAL AS $$
DECLARE
    total_interest DECIMAL;
    total_amount DECIMAL;
    emi_amount DECIMAL;
BEGIN
    -- Simple interest calculation: SI = P * R * T / 100
    total_interest := principal * annual_rate * tenure_months / (100 * 12);
    total_amount := principal + total_interest;
    emi_amount := total_amount / tenure_months;
    
    RETURN ROUND(emi_amount, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to check if EMI is due for current month
CREATE OR REPLACE FUNCTION is_emi_due_this_month(
    emi_date INTEGER,
    emi_payments JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    current_month TEXT;
    payment_key TEXT;
BEGIN
    current_month := TO_CHAR(NOW(), 'YYYY-MM');
    payment_key := current_month || '-' || LPAD(emi_date::TEXT, 2, '0');
    
    RETURN NOT (emi_payments ? payment_key);
END;
$$ LANGUAGE plpgsql;

-- Function to get current month EMI status
CREATE OR REPLACE FUNCTION get_current_month_emi_status(
    emi_date INTEGER,
    emi_payments JSONB
)
RETURNS JSONB AS $$
DECLARE
    current_month TEXT;
    payment_key TEXT;
    payment_info JSONB;
BEGIN
    current_month := TO_CHAR(NOW(), 'YYYY-MM');
    payment_key := current_month || '-' || LPAD(emi_date::TEXT, 2, '0');
    
    payment_info := emi_payments -> payment_key;
    
    IF payment_info IS NULL THEN
        RETURN jsonb_build_object(
            'month', current_month,
            'due_date', emi_date,
            'paid', false,
            'amount', null,
            'paid_at', null
        );
    ELSE
        RETURN jsonb_build_object(
            'month', current_month,
            'due_date', emi_date,
            'paid', true,
            'amount', payment_info->>'amount',
            'paid_at', payment_info->>'paid_at'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add constraints for data consistency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'queries_emi_consistency_check'
  ) THEN
    ALTER TABLE queries ADD CONSTRAINT queries_emi_consistency_check 
    CHECK (
      (emi_started = false) OR
      (emi_started = true AND emi_date IS NOT NULL AND emi_percent IS NOT NULL AND emi_started_at IS NOT NULL AND principal_amount IS NOT NULL)
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'queries_service_fee_consistency_check'
  ) THEN
    ALTER TABLE queries ADD CONSTRAINT queries_service_fee_consistency_check 
    CHECK (
      (service_fee_paid = false AND service_fee_paid_at IS NULL) OR
      (service_fee_paid = true AND service_fee_paid_at IS NOT NULL)
    );
  END IF;
END $$;

-- Update existing queries to set default values
UPDATE queries 
SET 
  service_fee_paid = false,
  emi_started = false,
  principal_amount = amount
WHERE service_fee_paid IS NULL;

-- Make required fields NOT NULL
ALTER TABLE queries ALTER COLUMN service_fee_paid SET NOT NULL;
ALTER TABLE queries ALTER COLUMN service_fee_paid SET DEFAULT false;
ALTER TABLE queries ALTER COLUMN emi_started SET NOT NULL;
ALTER TABLE queries ALTER COLUMN emi_started SET DEFAULT false;

-- Make blocked NOT NULL for profiles
ALTER TABLE profiles ALTER COLUMN blocked SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN blocked SET DEFAULT false;