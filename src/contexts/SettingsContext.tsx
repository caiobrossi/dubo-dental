"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatInTimeZone, getTimezoneOffset } from 'date-fns-tz';

export interface AppSettings {
  weekStartsOn: 'Monday' | 'Sunday' | 'Saturday';
  calendarBlocks: 15 | 30 | 60;
  timezone: string;
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  timeFormat: '24hrs' | '12hrs';
  autoLogoutTime: 15 | 30 | 60 | 0; // 0 means never
  currencyFormat: 'EUR' | 'USD' | 'BRL' | 'GBP';
  menuLayout: 'compact' | 'roomy';
}

const defaultSettings: AppSettings = {
  weekStartsOn: 'Monday',
  calendarBlocks: 15,
  timezone: 'Europe/Lisbon',
  dateFormat: 'dd/mm/yyyy',
  timeFormat: '24hrs',
  autoLogoutTime: 30,
  currencyFormat: 'EUR',
  menuLayout: 'roomy'
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  formatDate: (date: Date | string) => string;
  formatTime: (time: Date | string) => string;
  formatCurrency: (amount: number) => string;
  getWeekDays: () => string[];
  getTimeSlotDuration: () => number;
  getCurrentDateTime: () => Date;
  convertToUserTimezone: (utcDate: Date | string) => Date;
  convertToUTC: (userDate: Date) => Date;
  formatDateWithTimezone: (date: Date | string) => string;
  formatTimeWithTimezone: (time: Date | string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save settings to localStorage whenever they change (but not during initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (settings.dateFormat) {
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`;
      case 'mm/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-mm-dd':
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const formatTime = (time: Date | string): string => {
    let hours: number;
    let minutes: number;

    if (typeof time === 'string') {
      // Handle time strings like "14:00" or "14:30"
      const [hourStr, minuteStr] = time.split(':');
      hours = parseInt(hourStr, 10);
      minutes = parseInt(minuteStr, 10);
      
      // Validate parsed values
      if (isNaN(hours) || isNaN(minutes)) {
        return time; // Return original string if parsing fails
      }
    } else {
      // Handle Date objects
      hours = time.getHours();
      minutes = time.getMinutes();
    }

    const minutesStr = String(minutes).padStart(2, '0');

    if (settings.timeFormat === '24hrs') {
      return `${String(hours).padStart(2, '0')}:${minutesStr}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutesStr} ${period}`;
    }
  };

  const formatCurrency = (amount: number): string => {
    const symbols = {
      EUR: '€',
      USD: '$',
      BRL: 'R$',
      GBP: '£'
    };

    const symbol = symbols[settings.currencyFormat];
    const formattedAmount = amount.toFixed(2);

    // For BRL and USD, symbol comes before
    if (settings.currencyFormat === 'BRL' || settings.currencyFormat === 'USD') {
      return `${symbol} ${formattedAmount}`;
    }
    // For EUR and GBP, symbol comes after
    return `${formattedAmount} ${symbol}`;
  };

  const getWeekDays = (): string[] => {
    const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let startIndex = 0;
    switch (settings.weekStartsOn) {
      case 'Sunday':
        startIndex = 0;
        break;
      case 'Monday':
        startIndex = 1;
        break;
      case 'Saturday':
        startIndex = 6;
        break;
    }

    const orderedDays = [];
    for (let i = 0; i < 7; i++) {
      const index = (startIndex + i) % 7;
      orderedDays.push(shortDays[index]);
    }
    return orderedDays;
  };

  const getTimeSlotDuration = (): number => {
    return settings.calendarBlocks;
  };

  // Get current date/time in user's selected timezone
  const getCurrentDateTime = (): Date => {
    const now = new Date();
    
    try {
      // Use date-fns-tz to get the current time in the selected timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: settings.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(now);
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      const hour = parts.find(p => p.type === 'hour')?.value;
      const minute = parts.find(p => p.type === 'minute')?.value;
      const second = parts.find(p => p.type === 'second')?.value;
      
      if (!year || !month || !day || !hour || !minute || !second) {
        console.warn('[Timezone Warning] Missing date parts, falling back to current time');
        return now;
      }
      
      // Create a new date object representing the timezone-adjusted time
      const result = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      
      if (isNaN(result.getTime())) {
        console.warn('[Timezone Warning] Invalid date created, falling back to current time');
        return now;
      }
      
      return result;
    } catch (error) {
      console.error('[Timezone Error] Error creating date:', error);
      return now;
    }
  };

  // Convert UTC date to user's timezone
  const convertToUserTimezone = (utcDate: Date | string): Date => {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    
    try {
      // Use the same logic as getCurrentDateTime but for the provided date
      const targetTimeString = date.toLocaleString('en-US', {
        timeZone: settings.timezone
      });
      
      const targetDate = new Date(targetTimeString);
      const localDate = new Date(date.toLocaleString());
      
      // Calculate the offset difference
      const offsetDifference = targetDate.getTime() - localDate.getTime();
      
      // Apply the offset to get the correct time in the target timezone
      const result = new Date(date.getTime() + offsetDifference);
      
      // Validate the result
      if (isNaN(result.getTime())) {
        console.warn('[Timezone Warning] Invalid date created in convertToUserTimezone, returning original date');
        return date;
      }
      
      return result;
    } catch (error) {
      console.error('[Timezone Error] Error creating date in convertToUserTimezone:', error);
      return date;
    }
  };

  // Convert user timezone date to UTC for database storage
  const convertToUTC = (userDate: Date): Date => {
    // For now, just return the date as-is
    // This can be improved later with proper timezone conversion for database storage
    return userDate;
  };

  // Format date with timezone awareness
  const formatDateWithTimezone = (date: Date | string): string => {
    const userDate = typeof date === 'string' ? convertToUserTimezone(new Date(date)) : convertToUserTimezone(date);
    return formatDate(userDate);
  };

  // Format time with timezone awareness
  const formatTimeWithTimezone = (time: Date | string): string => {
    if (typeof time === 'string' && time.includes(':') && !time.includes('T')) {
      // This is a time string like "14:00", not a full datetime
      return formatTime(time);
    }
    
    const userTime = typeof time === 'string' ? convertToUserTimezone(new Date(time)) : convertToUserTimezone(time);
    return formatTime(userTime);
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    formatDate,
    formatTime,
    formatCurrency,
    getWeekDays,
    getTimeSlotDuration,
    getCurrentDateTime,
    convertToUserTimezone,
    convertToUTC,
    formatDateWithTimezone,
    formatTimeWithTimezone
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};