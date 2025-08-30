-- Tabela de fornecedores (suppliers)
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  alternative_phone VARCHAR(20),
  website TEXT,
  email VARCHAR(255),
  products TEXT, -- Comma-separated list of products/services
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  post_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de compras dos fornecedores
CREATE TABLE supplier_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  order_number VARCHAR(100) NOT NULL,
  order_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar timestamps dos suppliers
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar timestamps dos supplier_orders
CREATE TRIGGER update_supplier_orders_updated_at BEFORE UPDATE ON supplier_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura e escrita para usuários autenticados
CREATE POLICY "Suppliers are viewable by everyone" ON suppliers
    FOR SELECT USING (true);

CREATE POLICY "Suppliers are insertable by authenticated users" ON suppliers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Suppliers are updatable by authenticated users" ON suppliers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Supplier orders are viewable by everyone" ON supplier_orders
    FOR SELECT USING (true);

CREATE POLICY "Supplier orders are insertable by authenticated users" ON supplier_orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Supplier orders are updatable by authenticated users" ON supplier_orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Dados de exemplo
INSERT INTO suppliers (name, contact_person, phone, alternative_phone, website, email, products) VALUES
  ('BioTech Innovations', 'Monalisa Andrade', '943 356 246', '432 567 2256', 'www.biotech.com', 'contact@biotech.com', 'Crowns, Venners, Lab'),
  ('DentalCore Materials', 'Carlos Oliveira', '987 654 321', '123 456 789', 'www.dentalcore.com', 'sales@dentalcore.com', 'Implants, Crowns, Bridges'),
  ('ProLab Solutions', 'Ana Costa', '555 444 333', '777 888 999', 'www.prolab.com', 'info@prolab.com', 'Laboratory Equipment, Materials');

-- Inserir dados de exemplo para histórico de compras
INSERT INTO supplier_orders (supplier_id, order_number, order_date, total_amount, description) VALUES
  ((SELECT id FROM suppliers WHERE name = 'BioTech Innovations'), 'ORD35603', '2025-06-14', 345.90, 'Crown materials and lab equipment'),
  ((SELECT id FROM suppliers WHERE name = 'BioTech Innovations'), 'ORD35409', '2025-06-12', 2440.00, 'Bulk order of dental veneers'),
  ((SELECT id FROM suppliers WHERE name = 'BioTech Innovations'), 'ORD35643', '2025-05-23', 345.90, 'Laboratory consumables'),
  ((SELECT id FROM suppliers WHERE name = 'BioTech Innovations'), 'ORD35802', '2025-04-30', 345.90, 'Replacement parts and materials'),
  ((SELECT id FROM suppliers WHERE name = 'DentalCore Materials'), 'ORD35801', '2025-06-10', 1200.00, 'Dental implant kit'),
  ((SELECT id FROM suppliers WHERE name = 'ProLab Solutions'), 'ORD35800', '2025-06-08', 890.50, 'Laboratory equipment maintenance');