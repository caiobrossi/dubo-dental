-- Script para associar lab_orders com suppliers
-- Execute este script DEPOIS de criar as tabelas suppliers

-- Adicionar coluna supplier_id na tabela lab_orders
ALTER TABLE lab_orders 
ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_lab_orders_supplier_id ON lab_orders(supplier_id);

-- Atualizar os dados existentes para associar com suppliers
-- Associar "Affilion Lab" com "BioTech Innovations"
UPDATE lab_orders 
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'BioTech Innovations')
WHERE lab_name = 'Affilion Lab';

-- Inserir alguns suppliers adicionais para corresponder aos lab names existentes
INSERT INTO suppliers (name, contact_person, phone, email, products) VALUES
  ('Affilion Lab', 'Dr. Silva Costa', '987 123 456', 'contact@affilionlab.com', 'Crowns, Bridges, Veneers'),
  ('ProDental Solutions', 'Marina Santos', '555 789 123', 'info@prodental.com', 'Orthodontic Appliances, Crowns')
ON CONFLICT DO NOTHING; -- Evita duplicatas se já existirem

-- Atualizar lab_orders para usar os suppliers corretos
UPDATE lab_orders 
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Affilion Lab')
WHERE lab_name = 'Affilion Lab';

-- Inserir mais alguns lab orders de exemplo com diferentes suppliers
INSERT INTO lab_orders (order_name, patient_name, professional_name, lab_name, supplier_id, services, due_date, total_price, status) VALUES
('Bridge B1-23', 'Maria Silva', 'Dr. João Santos', 'ProDental Solutions', 
 (SELECT id FROM suppliers WHERE name = 'ProDental Solutions'), 
 'Bridge', '2025-05-15', 1250.00, 'order_created'),
('Veneer V2-23', 'Carlos Oliveira', 'Dr. Rafael Rodrigues', 'BioTech Innovations',
 (SELECT id FROM suppliers WHERE name = 'BioTech Innovations'),
 'Veneers', '2025-04-20', 890.50, 'in_progress'),
('Crown Advanced CA-23', 'Ana Costa', 'Dr. Maria Silva', 'Affilion Lab',
 (SELECT id FROM suppliers WHERE name = 'Affilion Lab'),
 'Advanced Crown', '2025-04-10', 1100.00, 'order_confirmed');