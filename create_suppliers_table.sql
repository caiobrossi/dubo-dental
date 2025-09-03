-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  alternative_phone TEXT,
  email TEXT,
  website TEXT,
  products TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  post_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers table
-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all access to suppliers" ON suppliers
  FOR ALL USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();