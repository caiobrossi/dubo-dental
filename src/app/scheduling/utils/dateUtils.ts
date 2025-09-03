import { DateRange, ViewMode, BUSINESS_HOURS } from '../types';

/**
 * Date utility functions for the scheduling system
 */

/**
 * Get the start of the week for a given date based on the week start day
 */
export const getWeekStart = (date: Date, weekStartsOn: 'Monday' | 'Sunday' | 'Saturday' = 'Monday'): Date => {
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

/**
 * Get the end of the week for a given date based on the week start day
 */
export const getWeekEnd = (date: Date, weekStartsOn: 'Monday' | 'Sunday' | 'Saturday' = 'Monday'): Date => {
  const weekStart = getWeekStart(date, weekStartsOn);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

/**
 * Generate date range based on view mode and selected date
 */
export const getDateRange = (selectedDate: Date, viewMode: ViewMode, weekStartsOn: 'Monday' | 'Sunday' | 'Saturday' = 'Monday'): DateRange => {
  switch (viewMode) {
    case 'day':
      return { start: selectedDate, end: selectedDate };
    
    case '5days': {
      const weekStart = getWeekStart(selectedDate, weekStartsOn);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // First 5 days of the week
      return { start: weekStart, end: weekEnd };
    }
    
    case 'week':
    default:
      return { start: getWeekStart(selectedDate, weekStartsOn), end: getWeekEnd(selectedDate, weekStartsOn) };
  }
};

/**
 * Generate array of days to display based on view mode
 */
export const generateDisplayDays = (selectedDate: Date, viewMode: ViewMode, weekStartsOn: 'Monday' | 'Sunday' | 'Saturday' = 'Monday'): Date[] => {
  const days: Date[] = [];
  
  if (viewMode === 'day') {
    days.push(new Date(selectedDate));
  } else {
    const { start } = getDateRange(selectedDate, viewMode, weekStartsOn);
    const dayCount = viewMode === '5days' ? 5 : 7;
    
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
  }
  
  return days;
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Get day name for a date
 */
export const getDayName = (date: Date): string => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayIndex = date.getDay();
  return dayNames[dayIndex];
};

/**
 * Generate business hours array
 */
export const generateBusinessHours = (): number[] => {
  const hours: number[] = [];
  
  // Regular hours: 9 AM to 8 PM
  for (let i = BUSINESS_HOURS.START; i <= BUSINESS_HOURS.END; i++) {
    hours.push(i);
  }
  
  // Late night hours: 9 PM to midnight (21, 22, 23, 24)
  for (let i = 21; i <= 24; i++) {
    hours.push(i);
  }
  
  // Night hours: 1 AM to 8 AM
  for (let i = BUSINESS_HOURS.NIGHT_START; i <= BUSINESS_HOURS.NIGHT_END; i++) {
    hours.push(i);
  }
  
  return hours;
};

/**
 * Navigate to different dates based on view mode
 */
export const navigateDate = (
  currentDate: Date, 
  direction: 'prev' | 'next' | 'today',
  viewMode: ViewMode,
  weekStartsOn: 'Monday' | 'Sunday' | 'Saturday' = 'Monday'
): Date => {
  if (direction === 'today') {
    return new Date();
  }
  
  const newDate = new Date(currentDate);
  
  if (viewMode === 'day') {
    // For day view, just move by 1 day
    const daysToMove = 1;
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - daysToMove);
    } else if (direction === 'next') {
      newDate.setDate(newDate.getDate() + daysToMove);
    }
  } else {
    // For week/5days view, move by 7 days
    const daysToMove = 7;
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - daysToMove);
    } else if (direction === 'next') {
      newDate.setDate(newDate.getDate() + daysToMove);
    }
  }
  
  return newDate;
};

/**
 * Jump to specific future dates
 */
export const jumpToFuture = (weeks: number = 0, months: number = 0): Date => {
  const newDate = new Date();
  
  if (weeks > 0) {
    newDate.setDate(newDate.getDate() + (weeks * 7));
  }
  
  if (months > 0) {
    newDate.setMonth(newDate.getMonth() + months);
  }
  
  return newDate;
};