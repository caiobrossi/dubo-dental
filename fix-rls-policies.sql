-- Corrigir políticas de RLS para permitir operações anônimas (desenvolvimento)
-- Execute este arquivo no SQL Editor do Supabase

-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE professionals DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_groups DISABLE ROW LEVEL SECURITY;

-- OU, se preferir manter RLS habilitado, use estas políticas mais permissivas:

-- Reabilitar RLS
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patient_groups ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento (permitem tudo)
-- CREATE POLICY "Allow all operations for development" ON patients
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for development" ON professionals
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for development" ON patient_groups
--     FOR ALL USING (true) WITH CHECK (true);

-- Remover políticas antigas se existirem
-- DROP POLICY IF EXISTS "Patients are viewable by everyone" ON patients;
-- DROP POLICY IF EXISTS "Patients are insertable by authenticated users" ON patients;
-- DROP POLICY IF EXISTS "Patients are updatable by authenticated users" ON patients;

-- DROP POLICY IF EXISTS "Professionals are viewable by everyone" ON professionals;
-- DROP POLICY IF EXISTS "Professionals are insertable by authenticated users" ON professionals;
-- DROP POLICY IF EXISTS "Professionals are updatable by authenticated users" ON professionals;

-- DROP POLICY IF EXISTS "Patient groups are viewable by everyone" ON patient_groups;
-- DROP POLICY IF EXISTS "Patient groups are insertable by authenticated users" ON patient_groups;
-- DROP POLICY IF EXISTS "Patient groups are updatable by authenticated users" ON patient_groups;
