export interface InsurancePlan {
  id: string;
  name: string;
  type: 'private' | 'custom' | 'public';
  description?: string;
  coverage_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Service {
  id: string;
  name: string;
  code?: string;
  description?: string;
  base_price: number;
  category?: string;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsurancePlanService {
  id: string;
  insurance_plan_id: string;
  service_id: string;
  covered_price: number;
  patient_copay: number;
  coverage_percentage?: number;
  is_covered: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields when fetching with relations
  service?: Service;
  insurance_plan?: InsurancePlan;
}

export interface CreateInsurancePlanRequest {
  name: string;
  type?: 'private' | 'custom' | 'public';
  description?: string;
  coverage_percentage?: number;
  copy_from_private?: boolean; // Whether to copy services from private plan
}

export interface UpdateInsurancePlanRequest {
  name?: string;
  description?: string;
  coverage_percentage?: number;
  is_active?: boolean;
}

export interface CreateServiceRequest {
  name: string;
  code?: string;
  description?: string;
  base_price: number;
  category?: string;
  duration_minutes?: number;
}

export interface UpdateServiceRequest {
  name?: string;
  code?: string;
  description?: string;
  base_price?: number;
  category?: string;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface InsurancePlanServiceRequest {
  insurance_plan_id: string;
  service_id: string;
  covered_price: number;
  patient_copay: number;
  coverage_percentage?: number;
  is_covered?: boolean;
  notes?: string;
}

// Utility types for API responses
export interface InsurancePlanWithServices extends InsurancePlan {
  services: InsurancePlanService[];
}

export interface ServiceWithPlans extends Service {
  insurance_plans: InsurancePlanService[];
}

// Common dental service categories
export const SERVICE_CATEGORIES = [
  'preventive',
  'diagnostic', 
  'restorative',
  'endodontic',
  'surgery',
  'cosmetic',
  'orthodontic',
  'periodontic',
  'prosthodontic'
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

// Insurance plan types
export const INSURANCE_TYPES = [
  'private',
  'custom', 
  'public'
] as const;

export type InsuranceType = typeof INSURANCE_TYPES[number];