-- Add last_visit column to patients table and set up automatic updates

-- Step 1: Add the last_visit column to the patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP WITH TIME ZONE;

-- Step 2: Initialize last_visit with created_at for existing patients
UPDATE patients 
SET last_visit = created_at 
WHERE last_visit IS NULL;

-- Step 3: Set default value for new patients
ALTER TABLE patients 
ALTER COLUMN last_visit SET DEFAULT NOW();

-- Step 4: Create or replace function to update last_visit
CREATE OR REPLACE FUNCTION update_patient_last_visit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status is changing to 'in-progress'
  IF NEW.status = 'in-progress' AND (OLD.status IS NULL OR OLD.status != 'in-progress') THEN
    -- Update the patient's last_visit timestamp
    UPDATE patients 
    SET last_visit = NOW() 
    WHERE id = NEW.patient_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to automatically update last_visit when appointment status changes
DROP TRIGGER IF EXISTS trigger_update_patient_last_visit ON appointments;

CREATE TRIGGER trigger_update_patient_last_visit
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_last_visit();

-- Step 6: Also update last_visit when a new appointment is created with 'in-progress' status
CREATE OR REPLACE FUNCTION update_patient_last_visit_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if new appointment has 'in-progress' status
  IF NEW.status = 'in-progress' THEN
    -- Update the patient's last_visit timestamp
    UPDATE patients 
    SET last_visit = NOW() 
    WHERE id = NEW.patient_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_patient_last_visit_on_insert ON appointments;

CREATE TRIGGER trigger_update_patient_last_visit_on_insert
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_last_visit_on_insert();

-- Step 7: Create index for better performance on last_visit queries
CREATE INDEX IF NOT EXISTS idx_patients_last_visit ON patients(last_visit DESC);

-- Comments for documentation
COMMENT ON COLUMN patients.last_visit IS 'Timestamp of the patient''s most recent visit (when appointment status changed to in-progress)';
COMMENT ON FUNCTION update_patient_last_visit() IS 'Updates patient last_visit when appointment status changes to in-progress';
COMMENT ON FUNCTION update_patient_last_visit_on_insert() IS 'Updates patient last_visit when new appointment is created with in-progress status';