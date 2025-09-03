-- Create treatments table
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id),
    expire_date DATE,
    patient_insurance VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
    total_procedures INTEGER DEFAULT 0,
    completed_procedures INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies (simplified version without patient_professionals table)
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view treatments for patients where they are the professional
CREATE POLICY "Users can view treatments for their patients" ON public.treatments
    FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE professional_id = auth.uid()
        )
    );

-- Policy: Users can insert treatments for patients where they are the professional
CREATE POLICY "Users can create treatments for their patients" ON public.treatments
    FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE professional_id = auth.uid()
        )
    );

-- Policy: Users can update treatments for patients where they are the professional
CREATE POLICY "Users can update treatments for their patients" ON public.treatments
    FOR UPDATE
    USING (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE professional_id = auth.uid()
        )
    );

-- Policy: Users can delete treatments for patients where they are the professional
CREATE POLICY "Users can delete treatments for their patients" ON public.treatments
    FOR DELETE
    USING (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE professional_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_treatments_patient_id ON public.treatments(patient_id);
CREATE INDEX idx_treatments_professional_id ON public.treatments(professional_id);
CREATE INDEX idx_treatments_status ON public.treatments(status);
CREATE INDEX idx_treatments_created_at ON public.treatments(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_treatments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_treatments_updated_at();