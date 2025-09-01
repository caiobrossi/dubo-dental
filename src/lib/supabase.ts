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
  last_visit?: string
  created_at?: string
  updated_at?: string
}

// Tipos para profissionais
export interface Professional {
  id: string
  name: string
  cro_id?: string
  avatar_url?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'rather_not_say'
  clinic_branch?: string
  email?: string
  mobile?: string
  alternative_phone?: string
  address?: string
  post_code?: string
  city?: string
  state?: string
  role?: string
  schedule_type?: string
  start_date?: string
  working_hours?: {
    [key: string]: {
      enabled: boolean
      start: string
      end: string
    }
  }
  specialty?: string
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

// Tipos para lab orders
export interface LabOrder {
  id?: string
  order_name: string
  patient_id: string
  patient_name?: string
  professional_id: string
  professional_name?: string
  lab_name: string
  supplier_id?: string
  services: string
  due_date: string
  total_price: number
  status: 'order_created' | 'order_confirmed' | 'in_progress' | 'completed' | 'overdue'
  created_at?: string
  updated_at?: string
}

// Tipos para suppliers
export interface Supplier {
  id?: string
  name: string
  contact_person?: string
  phone?: string
  alternative_phone?: string
  website?: string
  email?: string
  products?: string
  address?: string
  city?: string
  state?: string
  post_code?: string
  created_at?: string
  updated_at?: string
}

// Tipos para supplier orders
export interface SupplierOrder {
  id?: string
  supplier_id: string
  order_number: string
  order_date: string
  total_amount: number
  status?: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Tipos para appointments
export interface Appointment {
  id?: string
  patient_id: string
  patient_name?: string
  professional_id: string
  professional_name?: string
  appointment_date: string
  start_time: string
  end_time: string
  duration_minutes?: number
  appointment_type: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  color?: string
  created_at?: string
  updated_at?: string
}

// Tipos para blocked times
export interface BlockedTime {
  id?: string
  professional_id: string
  professional_name?: string
  date: string
  start_time: string
  end_time: string
  reason?: string
  created_at?: string
  updated_at?: string
}

// Tipos para chairs and rooms
export interface ChairRoom {
  id?: string
  name: string
  type: 'chair' | 'room'
  assigned_professionals: string[]
  clinic_id?: string
  created_at?: string
  updated_at?: string
}
