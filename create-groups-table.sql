-- Create or update patient_groups table with additional fields
-- Execute this in your Supabase SQL editor

-- First, let's check if the table exists and add missing columns
ALTER TABLE patient_groups
ADD COLUMN IF NOT EXISTS group_color VARCHAR(50) DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS group_icon VARCHAR(100) DEFAULT 'users',
ADD COLUMN IF NOT EXISTS participants VARCHAR(100) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS patient_count INTEGER DEFAULT 0;

-- Insert some default groups if they don't exist
INSERT INTO patient_groups (name, description, group_color, group_icon, participants, patient_count)
VALUES
  ('Aesthetics patients', 'Patients interested in cosmetic procedures', 'purple', 'syringe', 'all', 34),
  ('Patients over 65', 'Senior patients requiring special care', 'blue', 'user', 'all', 28),
  ('Kids', 'Pediatric patients', 'green', 'user', 'kids', 45),
  ('Dental patients', 'Regular dental care patients', 'orange', 'component', 'all', 67)
ON CONFLICT (name) DO NOTHING;

-- Disable RLS for development (temporário)
ALTER TABLE patient_groups DISABLE ROW LEVEL SECURITY;

-- Or enable RLS with proper policy:
-- ALTER TABLE patient_groups ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations for authenticated users" ON patient_groups
-- FOR ALL USING (auth.role() = 'authenticated');
