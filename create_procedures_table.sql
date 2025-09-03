-- Create procedures table for managing dental procedures
CREATE TABLE IF NOT EXISTS procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    estimated_time TEXT DEFAULT '30min',
    is_active BOOLEAN DEFAULT true,
    insurance_plan_id UUID REFERENCES insurance_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(name, insurance_plan_id)
);

-- Create index for faster queries
CREATE INDEX idx_procedures_insurance_plan ON procedures(insurance_plan_id);
CREATE INDEX idx_procedures_category ON procedures(category);
CREATE INDEX idx_procedures_active ON procedures(is_active);

-- Enable RLS
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for authenticated users" ON procedures
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE
    ON procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default procedures for Private Plan
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
WHERE EXISTS (SELECT 1 FROM insurance_plans WHERE type = 'private');