// TypeScript interfaces for the scheduling system

export type ViewMode = 'day' | '5days' | 'week';
export type AppointmentModalType = 'appointment' | 'blocked';

// Export the standard AppointmentStatus type for consistency
export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed' 
  | 'cancelled' 
  | 'no-show' 
  | 'waiting' 
  | 'in-progress' 
  | 'complete';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  professional_id: string;
  professional_name: string;
  appointment_date: string; // ISO date string
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  duration_minutes: number;
  appointment_type: string;
  status: AppointmentStatus;
  notes?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedTime {
  id: string;
  professional_id: string;
  professional_name: string;
  date: string; // ISO date string
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PreSelectedDateTime {
  date: Date;
  time: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeSlot {
  date: Date;
  hour: number;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  hasContent: boolean;
}

// Constants
export const BUSINESS_HOURS = {
  START: 9,
  END: 20,
  LATE_START: 21,
  LATE_END: 24,
  NIGHT_START: 1,
  NIGHT_END: 8,
} as const;

export const DAY_NAMES = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
] as const;