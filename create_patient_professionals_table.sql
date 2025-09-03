-- Create patient_professionals junction table
CREATE TABLE IF NOT EXISTS public.patient_professionals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(patient_id, professional_id)
);

-- Create RLS policies
ALTER TABLE public.patient_professionals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view patient-professional relationships where they are the professional
CREATE POLICY "Users can view patient-professional relationships" ON public.patient_professionals
    FOR SELECT
    USING (professional_id = auth.uid());

-- Policy: Users can create patient-professional relationships where they are the professional
CREATE POLICY "Users can create patient-professional relationships" ON public.patient_professionals
    FOR INSERT
    WITH CHECK (professional_id = auth.uid());

-- Policy: Users can update patient-professional relationships where they are the professional
CREATE POLICY "Users can update patient-professional relationships" ON public.patient_professionals
    FOR UPDATE
    USING (professional_id = auth.uid());

-- Policy: Users can delete patient-professional relationships where they are the professional
CREATE POLICY "Users can delete patient-professional relationships" ON public.patient_professionals
    FOR DELETE
    USING (professional_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_patient_professionals_patient_id ON public.patient_professionals(patient_id);
CREATE INDEX idx_patient_professionals_professional_id ON public.patient_professionals(professional_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_patient_professionals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_patient_professionals_updated_at
    BEFORE UPDATE ON public.patient_professionals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_patient_professionals_updated_at();