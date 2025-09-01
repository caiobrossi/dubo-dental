-- Script SQL para adicionar campos individuais de horário de trabalho na tabela professionals
-- Execute este script no SQL Editor do Supabase

-- Primeiro, verificar a estrutura atual da tabela
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'professionals' ORDER BY ordinal_position;

-- Adicionar campos individuais de horário de trabalho
-- Segunda-feira
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS monday_start TIME;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS monday_end TIME;

-- Terça-feira  
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS tuesday_start TIME;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS tuesday_end TIME;

-- Quarta-feira
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS wednesday_start TIME;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS wednesday_end TIME;

-- Quinta-feira
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS thursday_start TIME;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS thursday_end TIME;

-- Sexta-feira
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS friday_start TIME;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS friday_end TIME;

-- Sábado
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS saturday_start TIME;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS saturday_end TIME;

-- Domingo
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS sunday_start TIME;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS sunday_end TIME;

-- Adicionar campo para imagem (usado no código)
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS image TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN professionals.monday_start IS 'Horário de início na segunda-feira';
COMMENT ON COLUMN professionals.monday_end IS 'Horário de fim na segunda-feira';
COMMENT ON COLUMN professionals.tuesday_start IS 'Horário de início na terça-feira';
COMMENT ON COLUMN professionals.tuesday_end IS 'Horário de fim na terça-feira';
COMMENT ON COLUMN professionals.wednesday_start IS 'Horário de início na quarta-feira';
COMMENT ON COLUMN professionals.wednesday_end IS 'Horário de fim na quarta-feira';
COMMENT ON COLUMN professionals.thursday_start IS 'Horário de início na quinta-feira';
COMMENT ON COLUMN professionals.thursday_end IS 'Horário de fim na quinta-feira';
COMMENT ON COLUMN professionals.friday_start IS 'Horário de início na sexta-feira';
COMMENT ON COLUMN professionals.friday_end IS 'Horário de fim na sexta-feira';
COMMENT ON COLUMN professionals.saturday_start IS 'Horário de início no sábado';
COMMENT ON COLUMN professionals.saturday_end IS 'Horário de fim no sábado';
COMMENT ON COLUMN professionals.sunday_start IS 'Horário de início no domingo';
COMMENT ON COLUMN professionals.sunday_end IS 'Horário de fim no domingo';
COMMENT ON COLUMN professionals.image IS 'URL da imagem/avatar do profissional';

-- Verificar a estrutura atualizada
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'professionals' AND column_name LIKE '%start' OR column_name LIKE '%end' OR column_name = 'image'
-- ORDER BY ordinal_position;