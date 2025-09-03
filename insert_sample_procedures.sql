-- Insert sample procedures for Private Plan
INSERT INTO procedures (name, category, price, estimated_time, insurance_plan_id)
SELECT 
    procedure_name,
    category,
    price,
    time_estimate,
    (SELECT id FROM insurance_plans WHERE type = 'private' LIMIT 1)
FROM (VALUES
    ('Consultation', 'Others', 50.00, '30min'),
    ('Cleaning', 'Prevention', 80.00, '45min'),
    ('Filling', 'Others', 120.00, '30min'),
    ('Root Canal', 'Endodontics', 500.00, '90min'),
    ('Crown', 'Prostethics', 800.00, '60min'),
    ('Extraction', 'Surgery', 150.00, '30min'),
    ('Whitening', 'Aesthetic dentistry', 300.00, '60min'),
    ('X-Ray', 'Radiology', 40.00, '15min'),
    ('Implant', 'Implantology', 2000.00, '120min'),
    ('Braces Consultation', 'Orthodontics', 100.00, '45min'),
    ('Emergency Treatment', 'Emergency', 200.00, '45min'),
    ('Pediatric Cleaning', 'Pediatric Dentistry', 60.00, '30min'),
    ('Gum Treatment', 'Periodontics', 150.00, '45min'),
    ('Lab Test', 'Lab tests and Exams', 75.00, '15min'),
    ('Botox Treatment', 'Injectables', 400.00, '30min')
) AS t(procedure_name, category, price, time_estimate)
WHERE EXISTS (SELECT 1 FROM insurance_plans WHERE type = 'private')
ON CONFLICT (name, insurance_plan_id) DO NOTHING;

-- Show results
SELECT 
    name,
    category,
    price,
    estimated_time,
    is_active
FROM procedures
WHERE insurance_plan_id = (SELECT id FROM insurance_plans WHERE type = 'private' LIMIT 1)
ORDER BY category, name;