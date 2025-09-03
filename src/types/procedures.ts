export interface Procedure {
  id: string;
  name: string;
  category: string;
  price: number;
  estimated_time: string;
  is_active: boolean;
  insurance_plan_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface CreateProcedureRequest {
  name: string;
  category: string;
  price: number;
  estimated_time: string;
  is_active?: boolean;
  insurance_plan_id: string;
}

export interface UpdateProcedureRequest {
  name?: string;
  category?: string;
  price?: number;
  estimated_time?: string;
  is_active?: boolean;
}

export const PROCEDURE_CATEGORIES = [
  'All',
  'Others',
  'Emergency',
  'Surgery',
  'Prostethics',
  'Prevention',
  'Periodontics',
  'Orthodontics',
  'Implantology',
  'Endodontics',
  'Aesthetic dentistry',
  'Lab tests and Exams',
  'Radiology',
  'Pediatric Dentistry',
  'Injectables'
] as const;

export type ProcedureCategory = typeof PROCEDURE_CATEGORIES[number];

export const TIME_OPTIONS = [
  '15min',
  '30min',
  '45min',
  '60min',
  '90min',
  '120min',
  'Custom'
] as const;