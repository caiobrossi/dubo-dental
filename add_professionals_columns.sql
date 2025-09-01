-- Script SQL para adicionar colunas na tabela professionals
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas de informações básicas
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS cro_id TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'rather_not_say'));
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS clinic_branch TEXT;

-- Adicionar colunas de contato
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS alternative_phone TEXT;

-- Adicionar colunas de endereço
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS post_code TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS state TEXT;

-- Adicionar colunas de função e horários
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS schedule_type TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS working_hours JSONB;

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN professionals.cro_id IS 'Número de registro no CRO';
COMMENT ON COLUMN professionals.avatar_url IS 'URL da foto do profissional';
COMMENT ON COLUMN professionals.date_of_birth IS 'Data de nascimento';
COMMENT ON COLUMN professionals.gender IS 'Gênero (male, female, rather_not_say)';
COMMENT ON COLUMN professionals.clinic_branch IS 'Filial da clínica';
COMMENT ON COLUMN professionals.mobile IS 'Telefone celular';
COMMENT ON COLUMN professionals.alternative_phone IS 'Telefone alternativo';
COMMENT ON COLUMN professionals.address IS 'Endereço completo';
COMMENT ON COLUMN professionals.post_code IS 'CEP';
COMMENT ON COLUMN professionals.city IS 'Cidade';
COMMENT ON COLUMN professionals.state IS 'Estado';
COMMENT ON COLUMN professionals.role IS 'Função/cargo do profissional';
COMMENT ON COLUMN professionals.schedule_type IS 'Tipo de horário (fixed, rotating, flexible)';
COMMENT ON COLUMN professionals.start_date IS 'Data de início do trabalho';
COMMENT ON COLUMN professionals.working_hours IS 'Horários de trabalho em formato JSON';