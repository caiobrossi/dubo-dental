-- Create patient_group_memberships table for many-to-many relationship
-- This allows patients to belong to multiple groups

CREATE TABLE IF NOT EXISTS patient_group_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    group_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_patient_group_memberships_patient 
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_patient_group_memberships_group 
        FOREIGN KEY (group_id) REFERENCES patient_groups(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate memberships
    CONSTRAINT unique_patient_group_membership 
        UNIQUE (patient_id, group_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_group_memberships_patient_id 
    ON patient_group_memberships(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_group_memberships_group_id 
    ON patient_group_memberships(group_id);

-- Add comments for documentation
COMMENT ON TABLE patient_group_memberships IS 'Many-to-many relationship between patients and groups';
COMMENT ON COLUMN patient_group_memberships.patient_id IS 'Reference to patient';
COMMENT ON COLUMN patient_group_memberships.group_id IS 'Reference to patient group';

-- Example usage:
-- 
-- Add patient to multiple groups:
-- INSERT INTO patient_group_memberships (patient_id, group_id) VALUES 
--   ('patient-uuid', 'group-1-uuid'),
--   ('patient-uuid', 'group-2-uuid'),
--   ('patient-uuid', 'group-3-uuid');
--
-- Get all groups for a patient:
-- SELECT pg.* FROM patient_groups pg
-- JOIN patient_group_memberships pgm ON pg.id = pgm.group_id
-- WHERE pgm.patient_id = 'patient-uuid';
--
-- Get all patients in a group:
-- SELECT p.* FROM patients p
-- JOIN patient_group_memberships pgm ON p.id = pgm.patient_id
-- WHERE pgm.group_id = 'group-uuid';