-- Ensure Private Plan exists for all accounts and cannot be deleted

-- First, check if Private Plan exists, if not create it
INSERT INTO insurance_plans (
    name,
    type,
    description,
    coverage_percentage,
    is_active
)
SELECT 
    'Private Plan',
    'private',
    'Standard private dental insurance plan',
    80,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM insurance_plans 
    WHERE type = 'private' 
    AND name = 'Private Plan'
);

-- Create a function to prevent deletion of Private Plan
CREATE OR REPLACE FUNCTION prevent_private_plan_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.type = 'private' AND (NEW.is_active = false OR NEW IS NULL) THEN
        RAISE EXCEPTION 'Private Plan cannot be deleted or deactivated';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the rule
DROP TRIGGER IF EXISTS protect_private_plan ON insurance_plans;
CREATE TRIGGER protect_private_plan
BEFORE UPDATE OR DELETE ON insurance_plans
FOR EACH ROW
EXECUTE FUNCTION prevent_private_plan_deletion();

-- Ensure Private Plan is always active
UPDATE insurance_plans 
SET is_active = true 
WHERE type = 'private';

-- Add comment to the table
COMMENT ON COLUMN insurance_plans.type IS 'Plan type: private (required, cannot be deleted), public, or custom';

-- Verify Private Plan exists
SELECT 
    id,
    name,
    type,
    description,
    coverage_percentage,
    is_active
FROM insurance_plans
WHERE type = 'private';