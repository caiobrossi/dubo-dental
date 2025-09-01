-- Add quick_notes column to patients table
-- This will store quick notes as a JSON array

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS quick_notes JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN patients.quick_notes IS 'Quick notes about the patient stored as JSON array';

-- Example of how to add a note:
-- UPDATE patients 
-- SET quick_notes = quick_notes || '["New note here"]'::jsonb
-- WHERE id = 'patient-id';

-- Example of how to remove a note by index:
-- UPDATE patients 
-- SET quick_notes = quick_notes - 0  -- Removes first element (index 0)
-- WHERE id = 'patient-id';