-- Function to automatically check and update EMI status
CREATE OR REPLACE FUNCTION check_emi_status()
RETURNS trigger AS $$
BEGIN
  -- If emi_started_at is set
  IF NEW.emi_started_at IS NOT NULL THEN
    -- Compare with current date
    IF CURRENT_TIMESTAMP >= NEW.emi_started_at THEN
      NEW.emi_started = true;
    ELSE
      NEW.emi_started = false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to batch update EMI status
CREATE OR REPLACE FUNCTION batch_update_emi_status()
RETURNS void AS $$
BEGIN
  UPDATE queries
  SET emi_started = true
  WHERE emi_started_at IS NOT NULL 
    AND emi_started = false 
    AND CURRENT_TIMESTAMP >= emi_started_at;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update emi_started
DROP TRIGGER IF EXISTS trigger_check_emi_status ON queries;
CREATE TRIGGER trigger_check_emi_status
  BEFORE INSERT OR UPDATE ON queries
  FOR EACH ROW
  EXECUTE FUNCTION check_emi_status();

-- Schedule the batch update (runs daily at midnight)
SELECT cron.schedule(
  'update-emi-status',
  '0 0 * * *',  -- At 00:00 every day
  'SELECT batch_update_emi_status();'
);
