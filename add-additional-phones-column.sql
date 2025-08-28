-- Adicionar coluna para telefones adicionais na tabela patients
-- Execute este arquivo no SQL Editor do Supabase

-- Adicionar coluna additional_phones como TEXT para armazenar JSON
ALTER TABLE patients 
ADD COLUMN additional_phones TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN patients.additional_phones IS 'JSON array of additional phone numbers';

-- Verificar se a coluna foi adicionada
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'patients' AND column_name = 'additional_phones';
