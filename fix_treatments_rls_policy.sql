-- Remove existing policy
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.treatments;

-- Create a more permissive policy for testing
CREATE POLICY "Allow all operations" ON public.treatments
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Alternative: if you want to keep some security, use this instead:
-- CREATE POLICY "Allow all for authenticated users" ON public.treatments
--     FOR ALL
--     USING (auth.uid() IS NOT NULL)
--     WITH CHECK (auth.uid() IS NOT NULL);