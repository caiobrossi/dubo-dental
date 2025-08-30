-- Script simples para testar se podemos criar dados básicos
-- Execute este script se as tabelas ainda não existirem

-- Criar tabela básica de suppliers (se não existir)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  products TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir suppliers básicos (apenas se não existirem)
INSERT INTO suppliers (name, contact_person, phone, email, products) 
SELECT * FROM (VALUES 
  ('Affilion Lab', 'Dr. Silva Costa', '987 123 456', 'contact@affilionlab.com', 'Crowns, Bridges, Veneers'),
  ('BioTech Innovations', 'Monalisa Andrade', '943 356 246', 'contact@biotech.com', 'Crowns, Venners, Lab')
) AS new_suppliers(name, contact_person, phone, email, products)
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers WHERE suppliers.name = new_suppliers.name
);

-- Mostrar dados inseridos
SELECT * FROM suppliers;