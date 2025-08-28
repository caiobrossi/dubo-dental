-- Schema para o banco de dados de pacientes
-- Execute este SQL no seu projeto Supabase

-- Tabela de profissionais
CREATE TABLE professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de grupos de pacientes
CREATE TABLE patient_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pacientes
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'rather_not_say')),
  preferred_language VARCHAR(100),
  clinic_branch VARCHAR(255),
  referral_source VARCHAR(255),
  email VARCHAR(255),
  mobile VARCHAR(20),
  alternative_phone VARCHAR(20),
  preferred_contact_time TEXT[], -- Array de strings
  address TEXT,
  post_code VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(100),
  insurance_name VARCHAR(255),
  insurance_plan VARCHAR(255),
  insurance_id VARCHAR(255),
  insurance_valid_until DATE,
  professional_id UUID REFERENCES professionals(id),
  group_id UUID REFERENCES patient_groups(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de exemplo para profissionais
INSERT INTO professionals (name, specialty, email) VALUES
  ('Dr. Rafael Rodrigues', 'Ortodontia', 'rafael.rodrigues@clinic.com'),
  ('Dra. Maria Silva', 'Endodontia', 'maria.silva@clinic.com'),
  ('Dr. João Santos', 'Periodontia', 'joao.santos@clinic.com');

-- Inserir dados de exemplo para grupos de pacientes
INSERT INTO patient_groups (name, description) VALUES
  ('Pacientes VIP', 'Pacientes com plano premium'),
  ('Pacientes Infantis', 'Crianças até 12 anos'),
  ('Pacientes Geriátricos', 'Pacientes acima de 65 anos');

-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_groups_updated_at BEFORE UPDATE ON patient_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura e escrita para usuários autenticados
CREATE POLICY "Professionals are viewable by everyone" ON professionals
    FOR SELECT USING (true);

CREATE POLICY "Professionals are insertable by authenticated users" ON professionals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Professionals are updatable by authenticated users" ON professionals
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Patient groups are viewable by everyone" ON patient_groups
    FOR SELECT USING (true);

CREATE POLICY "Patient groups are insertable by authenticated users" ON patient_groups
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Patient groups are updatable by authenticated users" ON patient_groups
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Patients are viewable by everyone" ON patients
    FOR SELECT USING (true);

CREATE POLICY "Patients are insertable by authenticated users" ON patients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Patients are updatable by authenticated users" ON patients
    FOR UPDATE USING (auth.role() = 'authenticated');
