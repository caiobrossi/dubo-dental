import { Appointment, BlockedTime } from '../types';
import { AppSettings } from '@/contexts/SettingsContext';

/**
 * Time utility functions for the scheduling system
 */

/**
 * Format time string to show only hours and minutes (HH:MM)
 */
export const formatTimeHM = (time: string): string => {
  return time.substring(0, 5);
};

/**
 * Format period display based on view mode and selected date
 */
export const formatPeriod = (
  selectedDate: Date, 
  viewMode: 'day' | '5days' | 'week',
  weekStartsOn: 'Monday' | 'Sunday' | 'Saturday' = 'Monday'
) => {
  const monthYear = selectedDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  if (viewMode === 'day') {
    return {
      dates: selectedDate.getDate().toString(),
      monthYear
    };
  }
  
  // For 5days and week modes, calculate the range
  const getWeekStart = (date: Date, weekStartsOn: 'Monday' | 'Sunday' | 'Saturday'): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    let startDay: number;
    switch (weekStartsOn) {
      case 'Sunday':
        startDay = 0;
        break;
      case 'Monday':
        startDay = 1;
        break;
      case 'Saturday':
        startDay = 6;
        break;
    }
    
    let diff = day - startDay;
    if (diff < 0) {
      diff += 7; // Handle negative values by going back a week
    }
    
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - diff);
    return weekStart;
  };
  
  const weekStart = getWeekStart(selectedDate, weekStartsOn);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + (viewMode === '5days' ? 4 : 6));
  
  return {
    dates: `${weekStart.getDate()}-${weekEnd.getDate()}`,
    monthYear
  };
};

/**
 * Get appointments for a specific time slot - only return appointments that START in this slot
 */
export const getAppointmentsForSlot = (
  appointments: Appointment[], 
  date: Date, 
  hour: number
): Appointment[] => {
  const dateStr = date.toISOString().split('T')[0];
  
  return appointments.filter(appointment => {
    if (appointment.appointment_date !== dateStr) return false;
    
    const [startHour] = appointment.start_time.split(':').map(Number);
    
    // Only show appointment in the slot where it starts
    return startHour === hour;
  });
};

/**
 * Get blocked times for a specific time slot
 */
export const getBlockedTimesForSlot = (
  blockedTimes: BlockedTime[], 
  date: Date, 
  hour: number
): BlockedTime[] => {
  const dateStr = date.toISOString().split('T')[0];
  
  return blockedTimes.filter(blockedTime => {
    if (blockedTime.date !== dateStr) return false;
    
    const startHour = parseInt(blockedTime.start_time.split(':')[0]);
    const endHour = parseInt(blockedTime.end_time.split(':')[0]);
    const endMinute = parseInt(blockedTime.end_time.split(':')[1]);
    
    // If end time has minutes, consider it goes to the next hour
    const actualEndHour = endMinute > 0 ? endHour + 1 : endHour;
    
    return hour >= startHour && hour < actualEndHour;
  });
};

/**
 * Check if this is the first slot of a blocked time period
 */
export const isFirstBlockedSlot = (date: Date, hour: number, blockedTime: BlockedTime): boolean => {
  const startHour = parseInt(blockedTime.start_time.split(':')[0]);
  return hour === startHour;
};

/**
 * Check if this is the last slot of a blocked time period
 */
export const isLastBlockedSlot = (date: Date, hour: number, blockedTime: BlockedTime): boolean => {
  const endHour = parseInt(blockedTime.end_time.split(':')[0]);
  const endMinute = parseInt(blockedTime.end_time.split(':')[1]);
  const actualEndHour = endMinute > 0 ? endHour + 1 : endHour;
  return hour === actualEndHour - 1;
};

/**
 * Check if a slot should have its bottom border removed (for multi-hour blocked times)
 */
export const shouldRemoveBottomBorder = (
  blockedTimes: BlockedTime[], 
  date: Date, 
  hour: number
): boolean => {
  return blockedTimes.some(blockedTime => 
    !isLastBlockedSlot(date, hour, blockedTime)
  );
};

/**
 * Calculate appointment card height based on full duration
 * Each hour slot is 80px (h-20), divided into blocks based on calendarBlocks setting
 * Card extends across multiple slots if needed, but stops at slot boundaries when ending at exact hours
 */
export const calculateAppointmentHeight = (startTime: string, endTime: string, calendarBlocks: number = 15): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  // Calculate duration, but if appointment ends at exact hour (e.g., 12:00), 
  // subtract a small amount to keep it within the previous slot
  let adjustedEndMinutes = endTotalMinutes;
  if (endMinute === 0 && endHour > startHour) {
    // If ending at exact hour (like 12:00), end just before it to stay in previous slot
    adjustedEndMinutes = endTotalMinutes - 1;
  }
  
  const durationMinutes = adjustedEndMinutes - startTotalMinutes;
  
  // Calculate block height based on calendarBlocks setting
  // 80px per hour divided by (60 / calendarBlocks) blocks per hour
  const blocksPerHour = 60 / calendarBlocks;
  const heightPerBlock = 80 / blocksPerHour;
  const heightPx = (durationMinutes / calendarBlocks) * heightPerBlock;
  
  // Minimum height of one block
  return Math.max(heightPx, heightPerBlock);
};

/**
 * Calculate appointment top position within the hour slot based on start time
 */
export const calculateAppointmentTop = (startTime: string, hourSlotStart: number, calendarBlocks: number = 15): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  // If appointment starts in a different hour than the current slot, position at top
  if (startHour !== hourSlotStart) return 0;
  
  // Calculate position based on calendar blocks setting
  const blocksPerHour = 60 / calendarBlocks;
  const heightPerBlock = 80 / blocksPerHour;
  return (startMinute / calendarBlocks) * heightPerBlock;
};