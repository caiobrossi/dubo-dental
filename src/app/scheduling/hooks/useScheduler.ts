import { useMemo, useState, useCallback } from 'react';

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
  patient_id?: string;
  patient_name: string;
  professional_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type?: string;
  notes?: string;
  status: AppointmentStatus;
}

export interface BlockedTime {
  id: string;
  professional_name: string;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

export interface TimeSlot {
  hour: number;
  appointmentsStartingHere: Appointment[];
  blockedTimesStartingHere: BlockedTime[];
  isOccupied: boolean;
  isBlocked: boolean;
  isLastBlockedSlot: boolean;
}

export interface AppointmentLayout {
  widthPercentage: number;
  leftPercentage: number;
  height: number;
  topOffset: number;
}

// Utilidades para cálculos de tempo
export const timeUtils = {
  toMinutes: (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  getDurationMinutes: (startTime: string, endTime: string): number => {
    return timeUtils.toMinutes(endTime) - timeUtils.toMinutes(startTime);
  },

  formatTimeWithoutSeconds: (time: string): string => {
    return time.substring(0, 5);
  },

  isOverlapping: (app1: Appointment, app2: Appointment): boolean => {
    // Include itself in the overlapping group
    if (app1.id === app2.id) return true;
    
    const start1 = timeUtils.toMinutes(app1.start_time);
    const end1 = timeUtils.toMinutes(app1.end_time);
    const start2 = timeUtils.toMinutes(app2.start_time);
    const end2 = timeUtils.toMinutes(app2.end_time);
    
    // Check if appointments overlap in time
    const overlaps = start1 < end2 && end1 > start2;
    
    // Debug
    if (overlaps && app1.id !== app2.id) {
      console.log(`Overlap detected: ${app1.start_time}-${app1.end_time} overlaps with ${app2.start_time}-${app2.end_time}`);
    }
    
    return overlaps;
  }
};

// Constantes do layout
export const LAYOUT_CONSTANTS = {
  SLOT_HEIGHT: 80,
  SLOT_PADDING: 6, // Increased padding for better spacing
  USABLE_HEIGHT: 68, // 80 - 12px (top+bottom padding)
  PIXELS_PER_MINUTE: 68 / 60, // ~1.13px per minute
  MIN_CARD_HEIGHT: 20,
  BASE_LEFT_OFFSET: 2, // Small offset from left edge
  CARD_WIDTH_FACTOR: 0.94, // Width factor for cards
  CARD_GAP: 2 // Gap between side-by-side cards
};

export const useScheduler = (appointments: Appointment[], blockedTimes: BlockedTime[] = []) => {
  // Gerar array de horas (9-24, 1-8)
  const hours = useMemo(() => {
    const hourArray = [];
    // 9 AM to 12 AM (midnight)
    for (let i = 9; i <= 24; i++) {
      hourArray.push(i);
    }
    // 1 AM to 8 AM
    for (let i = 1; i <= 8; i++) {
      hourArray.push(i);
    }
    return hourArray;
  }, []);

  // Processar appointments por data
  const getAppointmentsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(app => app.appointment_date === dateStr);
  }, [appointments]);

  // Processar blocked times por data
  const getBlockedTimesForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedTimes.filter(blocked => blocked.date === dateStr);
  }, [blockedTimes]);

  // Detectar overlaps para um appointment específico
  const getOverlappingAppointments = useCallback((targetAppointment: Appointment, dateAppointments: Appointment[]) => {
    const overlapping = dateAppointments.filter(app => 
      timeUtils.isOverlapping(targetAppointment, app)
    );
    
    // Include all appointments that overlap with any appointment in the group
    // This ensures that if A overlaps with B and B overlaps with C, all three are in the same group
    const expandedGroup = new Set(overlapping);
    let previousSize = 0;
    
    while (expandedGroup.size !== previousSize) {
      previousSize = expandedGroup.size;
      const currentGroup = Array.from(expandedGroup);
      
      currentGroup.forEach(app1 => {
        dateAppointments.forEach(app2 => {
          if (timeUtils.isOverlapping(app1, app2)) {
            expandedGroup.add(app2);
          }
        });
      });
    }
    
    return Array.from(expandedGroup);
  }, []);

  // Calcular layout de um appointment
  const calculateAppointmentLayout = useCallback((
    appointment: Appointment,
    overlappingApps: Appointment[]
  ): AppointmentLayout => {
    // Sort all overlapping appointments by start time, then by ID for consistency
    const sortedApps = overlappingApps.sort((a, b) => {
      const timeCompare = timeUtils.toMinutes(a.start_time) - timeUtils.toMinutes(b.start_time);
      if (timeCompare !== 0) return timeCompare;
      return a.id.localeCompare(b.id);
    });

    // Find the position of this appointment in the sorted group
    const totalOverlapping = sortedApps.length;
    const appointmentIndex = sortedApps.findIndex(app => app.id === appointment.id);

    // Calculate width and position
    // All appointments in the overlapping group get equal width
    const widthPercentage = totalOverlapping <= 1 ? 100 : (100 / totalOverlapping);
    const leftPercentage = totalOverlapping <= 1 ? 0 : (appointmentIndex * widthPercentage);

    // Calcular altura baseado na duração
    const durationMinutes = timeUtils.getDurationMinutes(appointment.start_time, appointment.end_time);
    const startMin = parseInt(appointment.start_time.split(':')[1]);
    
    // Calcular altura sem limitação para appointments multi-hora
    const height = Math.max(
      LAYOUT_CONSTANTS.MIN_CARD_HEIGHT, 
      durationMinutes * LAYOUT_CONSTANTS.PIXELS_PER_MINUTE
    );
    
    // Debug height calculation for multi-hour appointments
    if (durationMinutes >= 90) {
      console.log(`Multi-hour appointment height calculation:`, {
        patient: appointment.patient_name,
        duration: `${appointment.start_time} - ${appointment.end_time}`,
        durationMinutes,
        pixelsPerMinute: LAYOUT_CONSTANTS.PIXELS_PER_MINUTE,
        calculatedHeight: height,
        expectedSlots: Math.ceil(durationMinutes / 60)
      });
    }

    // Calcular offset vertical dentro do slot inicial
    const topOffset = (startMin / 60) * LAYOUT_CONSTANTS.USABLE_HEIGHT;

    return {
      widthPercentage,
      leftPercentage,
      height,
      topOffset
    };
  }, []);

  // Processar slots para uma data específica
  const processTimeSlots = useCallback((date: Date): TimeSlot[] => {
    const dateAppointments = getAppointmentsForDate(date);
    const dateBlockedTimes = getBlockedTimesForDate(date);

    return hours.map(hour => {
      const appointmentsStartingHere = dateAppointments.filter(app => {
        const appStartHour = parseInt(app.start_time.split(':')[0]);
        return appStartHour === hour;
      });

      const blockedTimesStartingHere = dateBlockedTimes.filter(blocked => {
        const blockedStartHour = parseInt(blocked.start_time.split(':')[0]);
        return blockedStartHour === hour;
      });

      const isOccupied = dateAppointments.some(app => {
        const appStart = timeUtils.toMinutes(app.start_time);
        const appEnd = timeUtils.toMinutes(app.end_time);
        const slotStart = hour * 60;
        const slotEnd = slotStart + 60;
        
        return appStart < slotEnd && appEnd > slotStart;
      });

      const isBlocked = dateBlockedTimes.some(blocked => {
        const blockedStart = timeUtils.toMinutes(blocked.start_time);
        const blockedEnd = timeUtils.toMinutes(blocked.end_time);
        const slotStart = hour * 60;
        const slotEnd = slotStart + 60;
        
        return blockedStart < slotEnd && blockedEnd > slotStart;
      });

      // Check if this is the last slot of any blocked time
      const isLastBlockedSlot = isBlocked && dateBlockedTimes.some(blocked => {
        const blockedStart = timeUtils.toMinutes(blocked.start_time);
        const blockedEnd = timeUtils.toMinutes(blocked.end_time);
        const slotStart = hour * 60;
        const slotEnd = slotStart + 60;
        
        // This slot is blocked by this blocked time AND the next slot is NOT blocked by this blocked time
        const isCurrentSlotBlocked = blockedStart < slotEnd && blockedEnd > slotStart;
        const nextSlotStart = (hour + 1) * 60;
        const nextSlotEnd = nextSlotStart + 60;
        const isNextSlotBlocked = blockedStart < nextSlotEnd && blockedEnd > nextSlotStart;
        
        return isCurrentSlotBlocked && !isNextSlotBlocked;
      });

      return {
        hour,
        appointmentsStartingHere,
        blockedTimesStartingHere,
        isOccupied,
        isBlocked,
        isLastBlockedSlot
      };
    });
  }, [hours, getAppointmentsForDate, getBlockedTimesForDate]);

  // Calcular layout completo para todos os appointments de uma data
  const calculateAppointmentLayouts = useCallback((date: Date) => {
    const dateAppointments = getAppointmentsForDate(date);
    const layoutMap = new Map<string, AppointmentLayout>();

    // Debug logging
    if (dateAppointments.length > 0) {
      console.log(`Processing ${dateAppointments.length} appointments for date ${date.toISOString().split('T')[0]}`);
      
      // Log all appointments for this date
      dateAppointments.forEach(apt => {
        console.log(`  - ${apt.patient_name}: ${apt.start_time} to ${apt.end_time} (${apt.professional_name})`);
      });
    }

    dateAppointments.forEach(appointment => {
      const overlapping = getOverlappingAppointments(appointment, dateAppointments);
      
      // Debug overlapping appointments
      if (overlapping.length > 1) {
        console.log(`Appointment overlaps detected:`, {
          current: `${appointment.patient_name} - ${appointment.start_time} to ${appointment.end_time}`,
          overlappingCount: overlapping.length,
          overlappingWith: overlapping.map(a => `${a.patient_name} - ${a.start_time} to ${a.end_time}`)
        });
      }
      
      const layout = calculateAppointmentLayout(appointment, overlapping);
      console.log(`Layout for ${appointment.patient_name}:`, {
        width: `${layout.widthPercentage}%`,
        left: `${layout.leftPercentage}%`,
        height: `${layout.height}px`
      });
      layoutMap.set(appointment.id, layout);
    });

    return layoutMap;
  }, [getAppointmentsForDate, getOverlappingAppointments, calculateAppointmentLayout]);


  return {
    hours,
    processTimeSlots,
    calculateAppointmentLayouts,
    getBlockedTimesForDate,
    timeUtils,
    LAYOUT_CONSTANTS
  };
};