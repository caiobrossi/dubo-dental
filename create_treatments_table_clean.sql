CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id),
    expire_date DATE,
    patient_insurance VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    total_procedures INTEGER DEFAULT 0,
    completed_procedures INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON public.treatments
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON public.treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_professional_id ON public.treatments(professional_id);
CREATE INDEX IF NOT EXISTS idx_treatments_status ON public.treatments(status);

CREATE OR REPLACE FUNCTION public.handle_treatments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_treatments_updated_at();