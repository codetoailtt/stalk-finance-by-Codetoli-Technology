/*
# Payment and EMI Management System

## Changes Made:
1. Add payment tracking fields to queries table
2. Add EMI management fields
3. Add user blocking functionality
4. Add notification system
5. Update RLS policies for new features

## New Fields:
- queries.service_fee_paid (boolean)
- queries.service_fee_paid_at (timestamptz)
- queries.emi_date (integer 1-31)
- queries.emi_percent (decimal)
- queries.emi_started (boolean)
- queries.emi_started_at (timestamptz)
- queries.emi_payments (jsonb) - stores monthly payment history
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

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "Staff and admin can read all notifications" ON notifications
    FOR SELECT USING (is_staff_or_admin(auth.uid()));

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_query_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, query_id, title, message, type)
    VALUES (p_user_id, p_query_id, p_title, p_message, p_type)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate monthly EMI amount
CREATE OR REPLACE FUNCTION calculate_monthly_emi(
    principal DECIMAL,
    annual_rate DECIMAL,
    tenure_months INTEGER DEFAULT 12
)
RETURNS DECIMAL AS $$
DECLARE
    monthly_rate DECIMAL;
    emi_amount DECIMAL;
BEGIN
    -- Convert annual rate to monthly rate
    monthly_rate := annual_rate / 100 / 12;
    
    -- Simple EMI calculation: P * r * (1 + r)^n / ((1 + r)^n - 1)
    -- For simplicity, we'll use simple interest for now
    emi_amount := (principal + (principal * annual_rate / 100 * tenure_months / 12)) / tenure_months;
    
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

-- Trigger function to create notifications on query status change
CREATE OR REPLACE FUNCTION notify_query_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'approved' THEN
                PERFORM create_notification(
                    NEW.user_id,
                    NEW.id,
                    'Query Approved',
                    'Your query ' || NEW.reference_id || ' has been approved! You can now pay the service fee to proceed.',
                    'success'
                );
            WHEN 'rejected' THEN
                PERFORM create_notification(
                    NEW.user_id,
                    NEW.id,
                    'Query Rejected',
                    'Your query ' || NEW.reference_id || ' has been rejected. Please check the notes for more details.',
                    'error'
                );
            WHEN 'completed' THEN
                PERFORM create_notification(
                    NEW.user_id,
                    NEW.id,
                    'Query Completed',
                    'Your query ' || NEW.reference_id || ' has been completed successfully!',
                    'success'
                );
        END CASE;
    END IF;
    
    -- Create notification when EMI is started
    IF OLD.emi_started IS DISTINCT FROM NEW.emi_started AND NEW.emi_started = true THEN
        PERFORM create_notification(
            NEW.user_id,
            NEW.id,
            'EMI Started',
            'EMI has been started for your query ' || NEW.reference_id || '. Your EMI date is ' || NEW.emi_date || ' of every month.',
            'info'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for query status notifications
DROP TRIGGER IF EXISTS trigger_notify_query_status_change ON queries;
CREATE TRIGGER trigger_notify_query_status_change
    AFTER UPDATE ON queries
    FOR EACH ROW
    EXECUTE FUNCTION notify_query_status_change();

-- Function to reset monthly EMI status (to be called by cron job or manually)
CREATE OR REPLACE FUNCTION reset_monthly_emi_status()
RETURNS INTEGER AS $$
DECLARE
    query_record RECORD;
    current_month TEXT;
    payment_key TEXT;
    reset_count INTEGER := 0;
BEGIN
    current_month := TO_CHAR(NOW(), 'YYYY-MM');
    
    -- Loop through all queries with active EMI
    FOR query_record IN 
        SELECT id, user_id, reference_id, emi_date, emi_payments
        FROM queries 
        WHERE emi_started = true 
        AND status IN ('approved', 'completed')
        AND emi_date IS NOT NULL
    LOOP
        payment_key := current_month || '-' || LPAD(query_record.emi_date::TEXT, 2, '0');
        
        -- Check if current month's EMI is not paid and it's past the EMI date
        IF NOT (query_record.emi_payments ? payment_key) 
           AND EXTRACT(DAY FROM NOW()) >= query_record.emi_date THEN
            
            -- Create notification for pending EMI
            PERFORM create_notification(
                query_record.user_id,
                query_record.id,
                'EMI Payment Due',
                'Your EMI payment for query ' || query_record.reference_id || ' is due. Please pay to avoid late charges.',
                'warning'
            );
            
            reset_count := reset_count + 1;
        END IF;
    END LOOP;
    
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_queries_service_fee_paid ON queries(service_fee_paid);
CREATE INDEX IF NOT EXISTS idx_queries_emi_started ON queries(emi_started) WHERE emi_started = true;
CREATE INDEX IF NOT EXISTS idx_queries_emi_date ON queries(emi_date) WHERE emi_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_blocked ON profiles(blocked) WHERE blocked = true;

-- Add constraint to ensure EMI fields are consistent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'queries_emi_consistency_check'
  ) THEN
    ALTER TABLE queries ADD CONSTRAINT queries_emi_consistency_check 
    CHECK (
      (emi_started = false AND emi_date IS NULL AND emi_percent IS NULL AND emi_started_at IS NULL) OR
      (emi_started = true AND emi_date IS NOT NULL AND emi_percent IS NOT NULL AND emi_started_at IS NOT NULL)
    );
  END IF;
END $$;

-- Add constraint for service fee payment consistency
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

-- Update existing approved queries to have service_fee_paid = false for testing
UPDATE queries 
SET service_fee_paid = false 
WHERE status = 'approved' AND service_fee_paid IS NULL;

-- Make service_fee_paid NOT NULL after updating existing records
ALTER TABLE queries ALTER COLUMN service_fee_paid SET NOT NULL;
ALTER TABLE queries ALTER COLUMN service_fee_paid SET DEFAULT false;

-- Make blocked NOT NULL for profiles
ALTER TABLE profiles ALTER COLUMN blocked SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN blocked SET DEFAULT false;