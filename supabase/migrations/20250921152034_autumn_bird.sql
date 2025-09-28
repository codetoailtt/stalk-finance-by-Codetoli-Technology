/*
# Complete Penalty System and Enhanced Features

## Changes Made:
1. Add penalty tracking fields to queries table
2. Add tenure_months field for EMI calculations
3. Add penalty calculation functions
4. Update existing functions for penalty integration

## New Fields:
- queries.penalty_amount (decimal) - current penalty amount
- queries.penalty_started_at (timestamptz) - when penalty started
- queries.penalty_waived (boolean) - if penalty was waived
- queries.penalty_waived_by (uuid) - who waived the penalty
- queries.tenure_months (integer) - loan tenure in months

## Security:
- All existing RLS policies remain intact
- New fields follow same security model
*/

-- Add penalty and tenure fields to queries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'penalty_amount'
  ) THEN
    ALTER TABLE queries ADD COLUMN penalty_amount DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'penalty_started_at'
  ) THEN
    ALTER TABLE queries ADD COLUMN penalty_started_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'penalty_waived'
  ) THEN
    ALTER TABLE queries ADD COLUMN penalty_waived BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'penalty_waived_by'
  ) THEN
    ALTER TABLE queries ADD COLUMN penalty_waived_by UUID REFERENCES profiles(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'tenure_months'
  ) THEN
    ALTER TABLE queries ADD COLUMN tenure_months INTEGER DEFAULT 12 CHECK (tenure_months >= 1 AND tenure_months <= 60);
  END IF;
END $$;

-- Add indexes for penalty fields
CREATE INDEX IF NOT EXISTS idx_queries_penalty_amount ON queries(penalty_amount) WHERE penalty_amount > 0;
CREATE INDEX IF NOT EXISTS idx_queries_penalty_started_at ON queries(penalty_started_at) WHERE penalty_started_at IS NOT NULL;

-- Function to calculate daily penalty (2% per day on EMI amount)
CREATE OR REPLACE FUNCTION calculate_daily_penalty(
    emi_amount DECIMAL,
    days_overdue INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
    daily_penalty_rate DECIMAL := 0.02; -- 2% per day
    total_penalty DECIMAL := 0;
    day_counter INTEGER;
BEGIN
    -- Calculate cumulative penalty (2% compounding daily)
    FOR day_counter IN 1..days_overdue LOOP
        total_penalty := total_penalty + (emi_amount * daily_penalty_rate);
    END LOOP;
    
    RETURN ROUND(total_penalty, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update penalty for overdue EMIs (with 3-day grace period)
CREATE OR REPLACE FUNCTION update_penalty_for_query(query_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    query_record RECORD;
    current_date DATE;
    emi_due_date DATE;
    grace_end_date DATE;
    days_overdue INTEGER;
    emi_amount DECIMAL;
    new_penalty DECIMAL;
    current_month TEXT;
    payment_key TEXT;
BEGIN
    -- Get query details
    SELECT q.*, calculate_monthly_emi(q.principal_amount, q.emi_percent, q.tenure_months) as monthly_emi
    INTO query_record
    FROM queries q
    WHERE q.id = query_id
    AND q.emi_started = true
    AND q.penalty_waived = false;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    current_date := CURRENT_DATE;
    current_month := TO_CHAR(current_date, 'YYYY-MM');
    payment_key := current_month || '-' || LPAD(query_record.emi_date::TEXT, 2, '0');
    
    -- Check if current month's EMI is paid
    IF query_record.emi_payments ? payment_key THEN
        RETURN query_record.penalty_amount; -- EMI paid, no new penalty
    END IF;
    
    -- Calculate EMI due date for current month
    emi_due_date := DATE(current_month || '-' || LPAD(query_record.emi_date::TEXT, 2, '0'));
    grace_end_date := emi_due_date + INTERVAL '3 days';
    
    -- Check if EMI is overdue (after grace period)
    IF current_date <= grace_end_date THEN
        RETURN query_record.penalty_amount; -- Still in grace period, no penalty
    END IF;
    
    days_overdue := current_date - grace_end_date;
    emi_amount := query_record.monthly_emi;
    
    -- Calculate new penalty (after grace period)
    new_penalty := calculate_daily_penalty(emi_amount, days_overdue);
    
    -- Update penalty in database
    UPDATE queries 
    SET 
        penalty_amount = new_penalty,
        penalty_started_at = CASE 
            WHEN penalty_started_at IS NULL THEN grace_end_date + INTERVAL '1 day'
            ELSE penalty_started_at 
        END
    WHERE id = query_id;
    
    RETURN new_penalty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to waive penalty
CREATE OR REPLACE FUNCTION waive_penalty(
    query_id UUID,
    waived_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE queries 
    SET 
        penalty_amount = 0,
        penalty_waived = true,
        penalty_waived_by = waived_by,
        penalty_started_at = NULL
    WHERE id = query_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset penalty when EMI is paid
CREATE OR REPLACE FUNCTION reset_penalty_on_payment(query_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE queries 
    SET 
        penalty_amount = 0,
        penalty_started_at = NULL,
        penalty_waived = false,
        penalty_waived_by = NULL
    WHERE id = query_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the monthly EMI calculation function to include tenure
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

-- Function to get total amount due (EMI + Penalty)
CREATE OR REPLACE FUNCTION get_total_amount_due(query_id UUID)
RETURNS JSONB AS $$
DECLARE
    query_record RECORD;
    emi_amount DECIMAL;
    penalty_amount DECIMAL;
    total_amount DECIMAL;
BEGIN
    SELECT q.*, calculate_monthly_emi(q.principal_amount, q.emi_percent, q.tenure_months) as monthly_emi
    INTO query_record
    FROM queries q
    WHERE q.id = query_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Query not found');
    END IF;
    
    emi_amount := query_record.monthly_emi;
    
    -- Update penalty before calculating
    penalty_amount := update_penalty_for_query(query_id);
    
    total_amount := emi_amount + penalty_amount;
    
    RETURN jsonb_build_object(
        'emi_amount', emi_amount,
        'penalty_amount', penalty_amount,
        'total_amount', total_amount,
        'has_penalty', penalty_amount > 0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to run daily penalty updates (to be called by cron or manually)
CREATE OR REPLACE FUNCTION update_all_penalties()
RETURNS INTEGER AS $$
DECLARE
    query_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Loop through all queries with active EMI
    FOR query_record IN 
        SELECT id
        FROM queries 
        WHERE emi_started = true 
        AND status IN ('approved', 'completed')
        AND penalty_waived = false
        AND emi_date IS NOT NULL
    LOOP
        -- Update penalty for each query
        PERFORM update_penalty_for_query(query_record.id);
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set default values for existing records
UPDATE queries 
SET 
    penalty_amount = 0,
    penalty_waived = false,
    tenure_months = 12
WHERE penalty_amount IS NULL OR tenure_months IS NULL;

-- Make required fields NOT NULL
ALTER TABLE queries ALTER COLUMN penalty_amount SET NOT NULL;
ALTER TABLE queries ALTER COLUMN penalty_amount SET DEFAULT 0;
ALTER TABLE queries ALTER COLUMN penalty_waived SET NOT NULL;
ALTER TABLE queries ALTER COLUMN penalty_waived SET DEFAULT false;
ALTER TABLE queries ALTER COLUMN tenure_months SET NOT NULL;
ALTER TABLE queries ALTER COLUMN tenure_months SET DEFAULT 12;

-- Add constraint for penalty consistency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'queries_penalty_consistency_check'
  ) THEN
    ALTER TABLE queries ADD CONSTRAINT queries_penalty_consistency_check 
    CHECK (
      (penalty_amount = 0 AND penalty_started_at IS NULL) OR
      (penalty_amount > 0 AND penalty_started_at IS NOT NULL)
    );
  END IF;
END $$;