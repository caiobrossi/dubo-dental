-- Script to capitalize all insurance plan names
-- This will properly capitalize all existing insurance plan names

UPDATE insurance_plans
SET name = INITCAP(name)
WHERE name != INITCAP(name);

-- Show the results
SELECT 
    id,
    name,
    type,
    created_at
FROM insurance_plans
ORDER BY created_at DESC;

-- Output message
SELECT COUNT(*) || ' insurance plan names have been capitalized' as result
FROM insurance_plans
WHERE name != INITCAP(name);