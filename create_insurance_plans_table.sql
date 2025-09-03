-- Create insurance_plans table
CREATE TABLE public.insurance_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'private', 'custom', 'public'
    description TEXT,
    coverage_percentage DECIMAL(5,2) DEFAULT 100.00, -- Percentage of coverage (0-100)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_coverage CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
    CONSTRAINT unique_plan_name UNIQUE(name)
);

-- Create services table (dental procedures/services)
CREATE TABLE public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- Service code (like dental procedure codes)
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100), -- e.g., 'cleaning', 'restoration', 'surgery', etc.
    duration_minutes INTEGER DEFAULT 60, -- Expected duration
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_price CHECK (base_price >= 0),
    CONSTRAINT positive_duration CHECK (duration_minutes > 0)
);

-- Create insurance_plan_services table (junction table for pricing per insurance)
CREATE TABLE public.insurance_plan_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insurance_plan_id UUID NOT NULL REFERENCES public.insurance_plans(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    covered_price DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Price covered by insurance
    patient_copay DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Amount patient pays
    coverage_percentage DECIMAL(5,2), -- Override insurance default coverage
    is_covered BOOLEAN DEFAULT true, -- Whether this service is covered
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_covered_price CHECK (covered_price >= 0),
    CONSTRAINT positive_copay CHECK (patient_copay >= 0),
    CONSTRAINT valid_service_coverage CHECK (coverage_percentage IS NULL OR (coverage_percentage >= 0 AND coverage_percentage <= 100)),
    CONSTRAINT unique_insurance_service UNIQUE(insurance_plan_id, service_id)
);

-- Create indexes for better performance
CREATE INDEX idx_insurance_plans_active ON public.insurance_plans(is_active);
CREATE INDEX idx_insurance_plans_type ON public.insurance_plans(type);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_insurance_plan_services_plan ON public.insurance_plan_services(insurance_plan_id);
CREATE INDEX idx_insurance_plan_services_service ON public.insurance_plan_services(service_id);

-- Insert default services (common dental procedures)
INSERT INTO public.services (name, code, description, base_price, category, duration_minutes) VALUES
('Dental Cleaning', 'D1110', 'Prophylaxis - adult', 120.00, 'preventive', 60),
('Dental Exam', 'D0150', 'Comprehensive oral evaluation', 80.00, 'diagnostic', 30),
('X-Ray (Bitewing)', 'D0274', 'Bitewing radiographic images', 45.00, 'diagnostic', 15),
('Filling (Composite)', 'D2391', 'Composite restoration - one surface', 180.00, 'restorative', 45),
('Crown (Porcelain)', 'D2740', 'Crown - porcelain fused to metal', 1200.00, 'restorative', 120),
('Root Canal', 'D3330', 'Endodontic therapy', 900.00, 'endodontic', 90),
('Tooth Extraction', 'D7140', 'Extraction, erupted tooth', 200.00, 'surgery', 30),
('Teeth Whitening', 'D9972', 'External bleaching', 400.00, 'cosmetic', 60),
('Fluoride Treatment', 'D1208', 'Topical fluoride', 35.00, 'preventive', 15),
('Dental Sealants', 'D1351', 'Sealant - per tooth', 50.00, 'preventive', 20);

-- Insert default insurance plans
INSERT INTO public.insurance_plans (name, type, description, coverage_percentage) VALUES
('Private Plan', 'private', 'Standard private dental insurance plan', 80.00),
('Unimed Saude', 'public', 'Unimed health insurance dental coverage', 70.00),
('Medis Care', 'public', 'Medis comprehensive dental plan', 75.00),
('Cuf Health Plus', 'public', 'Cuf premium dental coverage', 85.00);

-- Create function to automatically copy services when creating from private plan
CREATE OR REPLACE FUNCTION copy_private_plan_services(new_plan_id UUID)
RETURNS VOID AS $$
DECLARE
    private_plan_id UUID;
BEGIN
    -- Get the private plan ID
    SELECT id INTO private_plan_id 
    FROM public.insurance_plans 
    WHERE name = 'Private Plan' AND type = 'private' 
    LIMIT 1;
    
    IF private_plan_id IS NOT NULL THEN
        -- Copy all services from private plan to new plan
        INSERT INTO public.insurance_plan_services 
        (insurance_plan_id, service_id, covered_price, patient_copay, coverage_percentage, is_covered, notes)
        SELECT 
            new_plan_id,
            service_id,
            covered_price,
            patient_copay,
            coverage_percentage,
            is_covered,
            'Copied from Private Plan'
        FROM public.insurance_plan_services 
        WHERE insurance_plan_id = private_plan_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_plan_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users)
CREATE POLICY "Enable all operations for authenticated users" ON public.insurance_plans
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON public.services
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON public.insurance_plan_services
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_insurance_plans_updated_at
    BEFORE UPDATE ON public.insurance_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_plan_services_updated_at
    BEFORE UPDATE ON public.insurance_plan_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();