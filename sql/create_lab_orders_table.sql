-- Criação da tabela lab_orders
CREATE TABLE lab_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_name TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT, -- Campo desnormalizado para performance
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  professional_name TEXT, -- Campo desnormalizado para performance
  lab_name TEXT NOT NULL,
  services TEXT NOT NULL,
  due_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'order_created' 
    CHECK (status IN ('order_created', 'order_confirmed', 'in_progress', 'completed', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_lab_orders_patient_id ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_professional_id ON lab_orders(professional_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_orders_due_date ON lab_orders(due_date);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lab_orders_updated_at 
    BEFORE UPDATE ON lab_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar status baseado na data de vencimento
CREATE OR REPLACE FUNCTION update_lab_order_status()
RETURNS VOID AS $$
BEGIN
    UPDATE lab_orders 
    SET status = 'overdue', updated_at = NOW()
    WHERE due_date < CURRENT_DATE 
    AND status NOT IN ('completed', 'overdue');
END;
$$ language 'plpgsql';

-- Trigger para executar a atualização de status automaticamente
-- Pode ser executado periodicamente ou quando dados são selecionados

-- Inserir dados de exemplo
INSERT INTO lab_orders (order_name, patient_name, professional_name, lab_name, services, due_date, total_price, status) VALUES
('Crown Q4-23', 'John Doe', 'Rafael Souza', 'Affilion Lab', 'Crown', '2025-04-03', 781.98, 'order_created'),
('Crown Q4-24', 'John Doe', 'Rafael Souza', 'Affilion Lab', 'Crown', '2025-04-03', 781.98, 'order_confirmed'),
('Crown Q4-25', 'John Doe', 'Rafael Souza', 'Affilion Lab', 'Crown', '2024-12-01', 781.98, 'overdue'),
('Crown Q4-26', 'John Doe', 'Rafael Souza', 'Affilion Lab', 'Crown', '2025-04-03', 781.98, 'order_created');

-- RLS (Row Level Security) - opcional, ajuste conforme necessário
-- ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;