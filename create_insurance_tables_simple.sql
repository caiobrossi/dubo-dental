-- Simple version for testing
-- Create insurance_plans table (simplified)
CREATE TABLE IF NOT EXISTS public.insurance_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'custom',
    description TEXT,
    coverage_percentage DECIMAL(5,2) DEFAULT 80.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;

-- Create simple policy to allow all operations (for testing)
DROP POLICY IF EXISTS "Allow all for testing" ON public.insurance_plans;
CREATE POLICY "Allow all for testing" ON public.insurance_plans FOR ALL USING (true);

-- Insert some test data
INSERT INTO public.insurance_plans (name, type, description) VALUES 
('Private Plan', 'private', 'Standard private dental insurance plan'),
('Unimed Saude', 'public', 'Unimed health insurance dental coverage'),
('Medis Care', 'public', 'Medis comprehensive dental plan'),
('Cuf Health Plus', 'public', 'Cuf premium dental coverage')
ON CONFLICT (name) DO NOTHING;