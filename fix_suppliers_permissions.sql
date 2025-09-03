-- Fix Row Level Security policies for suppliers table

-- Enable Row Level Security (if not already enabled)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all access to suppliers" ON suppliers;
DROP POLICY IF EXISTS "Enable read access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable update access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON suppliers;

-- Create new permissive policies
CREATE POLICY "Allow all operations on suppliers" ON suppliers
  FOR ALL USING (true)
  WITH CHECK (true);

-- Alternative: If you prefer separate policies for each operation:
-- CREATE POLICY "Enable read access for all users" ON suppliers FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON suppliers FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON suppliers FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Enable delete access for all users" ON suppliers FOR DELETE USING (true);