-- Script SQL para criar a tabela de inventário
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de inventário
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Equipment', 'Consumables', 'Materials', 'Instruments')),
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    maximum_stock INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_favorite BOOLEAN DEFAULT FALSE,
    description TEXT,
    supplier VARCHAR(255),
    location VARCHAR(255),
    expiration_date DATE,
    last_restocked_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_product_name ON inventory(product_name);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_levels ON inventory(current_stock, minimum_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_updated_at();

-- Adicionar comentários para documentação
COMMENT ON TABLE inventory IS 'Tabela para gerenciamento de inventário médico-dental';
COMMENT ON COLUMN inventory.id IS 'Identificador único do produto';
COMMENT ON COLUMN inventory.product_name IS 'Nome do produto';
COMMENT ON COLUMN inventory.sku IS 'Código único do produto (Stock Keeping Unit)';
COMMENT ON COLUMN inventory.category IS 'Categoria do produto (Equipment, Consumables, Materials, Instruments)';
COMMENT ON COLUMN inventory.current_stock IS 'Quantidade atual em estoque';
COMMENT ON COLUMN inventory.minimum_stock IS 'Quantidade mínima em estoque (alerta)';
COMMENT ON COLUMN inventory.maximum_stock IS 'Quantidade máxima em estoque';
COMMENT ON COLUMN inventory.unit_price IS 'Preço unitário do produto';
COMMENT ON COLUMN inventory.is_favorite IS 'Indica se o produto é favorito';
COMMENT ON COLUMN inventory.description IS 'Descrição detalhada do produto';
COMMENT ON COLUMN inventory.supplier IS 'Fornecedor do produto';
COMMENT ON COLUMN inventory.location IS 'Localização física do produto';
COMMENT ON COLUMN inventory.expiration_date IS 'Data de validade (se aplicável)';
COMMENT ON COLUMN inventory.last_restocked_date IS 'Data do último reabastecimento';
COMMENT ON COLUMN inventory.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN inventory.updated_at IS 'Data da última atualização';
COMMENT ON COLUMN inventory.created_by IS 'Usuário que criou o registro';
COMMENT ON COLUMN inventory.updated_by IS 'Usuário que fez a última atualização';

-- Inserir dados de exemplo baseados na página de inventário
INSERT INTO inventory (product_name, sku, category, current_stock, minimum_stock, maximum_stock, unit_price, description) VALUES
('Filtro de agua Dental PureFlow', 'EQ-001', 'Equipment', 1, 3, 10, 390.99, 'Filtro de água para equipamentos dentais'),
('Dental Composite Resin A2', 'MAT-002', 'Materials', 100, 50, 300, 45.50, 'Resina composta dental cor A2'),
('Surgical Gloves (Box)', 'CON-003', 'Consumables', 5, 20, 100, 12.99, 'Caixa de luvas cirúrgicas descartáveis'),
('Dental Burs Set', 'INS-004', 'Instruments', 50, 25, 100, 89.99, 'Conjunto de brocas dentais'),
('X-Ray Film (Pack)', 'CON-005', 'Consumables', 2, 10, 50, 125.00, 'Pacote de filme radiográfico'),
('Anesthetic Cartridges', 'MAT-006', 'Materials', 200, 100, 500, 2.50, 'Cartuchos de anestésico local'),
('Dental Chair Filters', 'EQ-007', 'Equipment', 3, 10, 25, 78.50, 'Filtros para cadeira odontológica'),
('Impression Material', 'MAT-008', 'Materials', 80, 40, 200, 34.99, 'Material de moldagem dental');

-- Criar view para estatísticas do inventário
CREATE OR REPLACE VIEW inventory_stats AS
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as products_below_minimum,
    COUNT(CASE WHEN current_stock > minimum_stock AND current_stock < maximum_stock THEN 1 END) as products_good_stock,
    COUNT(CASE WHEN current_stock >= maximum_stock THEN 1 END) as products_above_maximum,
    SUM(current_stock * unit_price) as total_inventory_value
FROM inventory;

-- Criar função para calcular status do estoque
CREATE OR REPLACE FUNCTION get_inventory_stock_status(current_stock INTEGER, minimum_stock INTEGER, maximum_stock INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF current_stock <= minimum_stock THEN
        RETURN 'low';
    ELSIF current_stock >= maximum_stock THEN
        RETURN 'high';
    ELSE
        RETURN 'normal';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Adicionar política de segurança (RLS) se necessário
-- ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Exemplo de política para permitir acesso apenas a usuários autenticados
-- CREATE POLICY "Users can view inventory" ON inventory
--     FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Users can insert inventory" ON inventory
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Users can update inventory" ON inventory
--     FOR UPDATE USING (auth.role() = 'authenticated');