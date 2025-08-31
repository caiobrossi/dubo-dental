import { DateRange, ViewMode, BUSINESS_HOURS } from '../types';

/**
 * Date utility functions for the scheduling system
 */

/**
 * Get the start of the week (Monday) for a given date
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(d.setDate(diff));
};

/**
 * Get the end of the week (Sunday) for a given date
 */
export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

/**
 * Generate date range based on view mode and selected date
 */
export const getDateRange = (selectedDate: Date, viewMode: ViewMode): DateRange => {
  switch (viewMode) {
    case 'day':
      return { start: selectedDate, end: selectedDate };
    
    case '5days': {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // Monday to Friday
      return { start: weekStart, end: weekEnd };
    }
    
    case 'week':
    default:
      return { start: getWeekStart(selectedDate), end: getWeekEnd(selectedDate) };
  }
};

/**
 * Generate array of days to display based on view mode
 */
export const generateDisplayDays = (selectedDate: Date, viewMode: ViewMode): Date[] => {
  const days: Date[] = [];
  
  if (viewMode === 'day') {
    days.push(new Date(selectedDate));
  } else {
    const { start } = getDateRange(selectedDate, viewMode);
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
 * Get day name for a date (adjusted so Monday = 0)
 */
export const getDayName = (date: Date): string => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayIndex = date.getDay();
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust so Monday = 0
  return dayNames[adjustedIndex];
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
  viewMode: ViewMode
): Date => {
  if (direction === 'today') {
    return new Date();
  }
  
  const newDate = new Date(currentDate);
  const daysToMove = viewMode === 'day' ? 1 : 7;
  
  if (direction === 'prev') {
    newDate.setDate(newDate.getDate() - daysToMove);
  } else if (direction === 'next') {
    newDate.setDate(newDate.getDate() + daysToMove);
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