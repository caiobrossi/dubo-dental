-- Corrigir RLS para tabela patient_groups
-- Execute este SQL no Supabase SQL Editor

-- Desabilitar RLS para desenvolvimento
ALTER TABLE patient_groups DISABLE ROW LEVEL SECURITY;

-- Ou, se preferir manter RLS habilitado, use esta política:
-- ALTER TABLE patient_groups ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON patient_groups;
-- CREATE POLICY "Allow all operations for authenticated users" ON patient_groups
-- FOR ALL USING (auth.role() = 'authenticated');

-- Verificar se a tabela tem os dados corretos
SELECT * FROM patient_groups ORDER BY created_at DESC;

