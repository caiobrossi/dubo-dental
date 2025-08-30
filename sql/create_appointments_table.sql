-- Tabela de appointments (agendamentos)
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT, -- Campo desnormalizado para performance
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  professional_name TEXT, -- Campo desnormalizado para performance
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type VARCHAR(100) NOT NULL, -- Ex: 'consultation', 'cleaning', 'treatment', etc
  status VARCHAR(50) DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  color VARCHAR(20) DEFAULT '#3b82f6', -- Cor para exibição no calendário
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de blocked time (horários bloqueados)
CREATE TABLE blocked_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  professional_name TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_blocked_times_date ON blocked_times(date);
CREATE INDEX idx_blocked_times_professional ON blocked_times(professional_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocked_times_updated_at 
    BEFORE UPDATE ON blocked_times 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar conflitos de horário
CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se já existe um appointment no mesmo horário
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE professional_id = NEW.professional_id
        AND appointment_date = NEW.appointment_date
        AND status NOT IN ('cancelled', 'no_show')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
        AND (
            (NEW.start_time >= start_time AND NEW.start_time < end_time)
            OR (NEW.end_time > start_time AND NEW.end_time <= end_time)
            OR (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
        RAISE EXCEPTION 'Conflito de horário: já existe um agendamento neste período';
    END IF;
    
    -- Verificar se o horário está bloqueado
    IF EXISTS (
        SELECT 1 FROM blocked_times
        WHERE professional_id = NEW.professional_id
        AND date = NEW.appointment_date
        AND (
            (NEW.start_time >= start_time AND NEW.start_time < end_time)
            OR (NEW.end_time > start_time AND NEW.end_time <= end_time)
            OR (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
        RAISE EXCEPTION 'Conflito de horário: este período está bloqueado';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar conflitos antes de inserir ou atualizar
CREATE TRIGGER check_appointment_conflict_trigger
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION check_appointment_conflict();

-- Inserir dados de exemplo
-- Buscar IDs de pacientes e profissionais existentes
DO $$
DECLARE
    patient1_id UUID;
    patient2_id UUID;
    patient3_id UUID;
    prof1_id UUID;
    prof2_id UUID;
BEGIN
    -- Buscar pacientes
    SELECT id INTO patient1_id FROM patients LIMIT 1 OFFSET 0;
    SELECT id INTO patient2_id FROM patients LIMIT 1 OFFSET 1;
    SELECT id INTO patient3_id FROM patients LIMIT 1 OFFSET 2;
    
    -- Buscar profissionais
    SELECT id INTO prof1_id FROM professionals WHERE name = 'Dr. Rafael Rodrigues';
    SELECT id INTO prof2_id FROM professionals WHERE name = 'Dra. Maria Silva';
    
    -- Inserir appointments de exemplo para a semana atual
    IF patient1_id IS NOT NULL AND prof1_id IS NOT NULL THEN
        INSERT INTO appointments (
            patient_id, patient_name, professional_id, professional_name,
            appointment_date, start_time, end_time, duration_minutes,
            appointment_type, status, color
        ) VALUES
        -- Segunda-feira
        (patient1_id, 'John Doe', prof1_id, 'Dr. Rafael Rodrigues',
         CURRENT_DATE + (1 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER,
         '09:00', '09:30', 30, 'consultation', 'scheduled', '#3b82f6'),
        
        (patient2_id, 'Maria Silva', prof1_id, 'Dr. Rafael Rodrigues',
         CURRENT_DATE + (1 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER,
         '10:00', '11:00', 60, 'treatment', 'confirmed', '#10b981'),
        
        -- Terça-feira
        (patient3_id, 'Carlos Santos', prof2_id, 'Dra. Maria Silva',
         CURRENT_DATE + (2 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER,
         '14:00', '15:00', 60, 'cleaning', 'scheduled', '#8b5cf6'),
        
        -- Quarta-feira
        (patient1_id, 'John Doe', prof1_id, 'Dr. Rafael Rodrigues',
         CURRENT_DATE + (3 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER,
         '11:00', '12:00', 60, 'treatment', 'scheduled', '#3b82f6'),
        
        -- Quinta-feira
        (patient2_id, 'Maria Silva', prof2_id, 'Dra. Maria Silva',
         CURRENT_DATE + (4 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER,
         '09:30', '10:30', 60, 'consultation', 'confirmed', '#10b981'),
        
        -- Sexta-feira
        (patient3_id, 'Carlos Santos', prof1_id, 'Dr. Rafael Rodrigues',
         CURRENT_DATE + (5 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER,
         '15:00', '16:00', 60, 'treatment', 'scheduled', '#8b5cf6');
        
        -- Inserir alguns horários bloqueados
        INSERT INTO blocked_times (
            professional_id, professional_name, date, start_time, end_time, reason
        ) VALUES
        (prof1_id, 'Dr. Rafael Rodrigues',
         CURRENT_DATE + (3 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER,
         '13:00', '14:00', 'Lunch break'),
        
        (prof2_id, 'Dra. Maria Silva',
         CURRENT_DATE + (5 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER,
         '12:00', '13:00', 'Meeting');
    END IF;
END $$;

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura e escrita para usuários autenticados
CREATE POLICY "Appointments are viewable by everyone" ON appointments
    FOR SELECT USING (true);

CREATE POLICY "Appointments are insertable by authenticated users" ON appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Appointments are updatable by authenticated users" ON appointments
    FOR UPDATE USING (true);

CREATE POLICY "Appointments are deletable by authenticated users" ON appointments
    FOR DELETE USING (true);

CREATE POLICY "Blocked times are viewable by everyone" ON blocked_times
    FOR SELECT USING (true);

CREATE POLICY "Blocked times are insertable by authenticated users" ON blocked_times
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Blocked times are updatable by authenticated users" ON blocked_times
    FOR UPDATE USING (true);

CREATE POLICY "Blocked times are deletable by authenticated users" ON blocked_times
    FOR DELETE USING (true);