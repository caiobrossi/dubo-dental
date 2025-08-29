import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para a tabela de pacientes
export interface Patient {
  id?: string
  name: string
  avatar_url?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'rather_not_say'
  preferred_language?: string
  clinic_branch?: string
  referral_source?: string
  email?: string
  mobile?: string
  alternative_phone?: string
  preferred_contact_time?: string[]
  address?: string
  post_code?: string
  city?: string
  state?: string
  insurance_name?: string
  insurance_plan?: string
  insurance_id?: string
  insurance_valid_until?: string
  professional_id?: string
  group_id?: string
  created_at?: string
  updated_at?: string
}

// Tipos para profissionais
export interface Professional {
  id: string
  name: string
  specialty?: string
  email?: string
  created_at?: string
  updated_at?: string
}

// Tipos para grupos de pacientes
export interface PatientGroup {
  id?: string
  name: string
  description?: string
  group_color?: string
  group_icon?: string
  participants?: string
  patient_count?: number
  created_at?: string
  updated_at?: string
}
