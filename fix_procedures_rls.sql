-- Fix RLS policies for procedures table

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON procedures;

-- Create more permissive policy for now
CREATE POLICY "Allow all operations for everyone" ON procedures
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'procedures';