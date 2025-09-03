-- Fix RLS policies for insurance_plans table
-- Remove existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.insurance_plans;
DROP POLICY IF EXISTS "Allow all for testing" ON public.insurance_plans;

-- Create more permissive policy for testing (allows anonymous access)
CREATE POLICY "Allow all operations for everyone" ON public.insurance_plans
    FOR ALL USING (true) WITH CHECK (true);

-- Alternatively, if you want to require authentication, use this instead:
-- CREATE POLICY "Enable all operations for authenticated users" ON public.insurance_plans
--     FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Insert some default data if table is empty
INSERT INTO public.insurance_plans (name, type, description, coverage_percentage) VALUES 
('Private Plan', 'private', 'Standard private dental insurance plan', 80.00),
('Unimed Saude', 'public', 'Unimed health insurance dental coverage', 70.00),
('Medis Care', 'public', 'Medis comprehensive dental plan', 75.00),
('Cuf Health Plus', 'public', 'Cuf premium dental coverage', 85.00)
ON CONFLICT DO NOTHING;