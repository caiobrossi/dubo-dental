-- Atualizar schema da tabela patients para tornar campos opcionais
-- Execute este arquivo no SQL Editor do Supabase

-- 1. Alterar campos para permitir NULL (exceto name que permanece NOT NULL)
ALTER TABLE patients 
ALTER COLUMN date_of_birth DROP NOT NULL,
ALTER COLUMN gender DROP NOT NULL,
ALTER COLUMN preferred_language DROP NOT NULL,
ALTER COLUMN clinic_branch DROP NOT NULL,
ALTER COLUMN referral_source DROP NOT NULL,
ALTER COLUMN address DROP NOT NULL,
ALTER COLUMN post_code DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL;

-- 2. Remover valores padrão (opcional - deixar campos como NULL)
-- ALTER TABLE patients 
-- ALTER COLUMN gender SET DEFAULT 'male',
-- ALTER COLUMN preferred_language SET DEFAULT 'Português',
-- ALTER COLUMN clinic_branch SET DEFAULT 'Principal',
-- ALTER COLUMN referral_source SET DEFAULT 'Indicação',
-- ALTER COLUMN city SET DEFAULT 'São Paulo',
-- ALTER TABLE state SET DEFAULT 'SP';

-- 3. Verificar a estrutura atualizada
-- SELECT column_name, is_nullable, column_default, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'patients' 
-- ORDER BY ordinal_position;

-- 4. Testar inserção com apenas o nome
-- INSERT INTO patients (name) VALUES ('Paciente Teste');

-- 5. Verificar se foi inserido
-- SELECT * FROM patients WHERE name = 'Paciente Teste';

-- 6. Limpar teste
-- DELETE FROM patients WHERE name = 'Paciente Teste';
