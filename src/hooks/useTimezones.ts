import { useMemo } from 'react';
import { getTimezoneOffset, format } from 'date-fns-tz';

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  region: string;
}

/**
 * Hook to provide a comprehensive list of timezones with proper offset calculation
 */
export const useTimezones = () => {
  const timezones = useMemo((): TimezoneOption[] => {
    const now = new Date();
    
    // Comprehensive list of commonly used timezones
    const timezoneList = [
      // Europe
      { value: 'Europe/Lisbon', city: 'Lisbon', country: 'Portugal', region: 'Europe' },
      { value: 'Europe/Madrid', city: 'Madrid', country: 'Spain', region: 'Europe' },
      { value: 'Europe/London', city: 'London', country: 'United Kingdom', region: 'Europe' },
      { value: 'Europe/Berlin', city: 'Berlin', country: 'Germany', region: 'Europe' },
      { value: 'Europe/Paris', city: 'Paris', country: 'France', region: 'Europe' },
      { value: 'Europe/Rome', city: 'Rome', country: 'Italy', region: 'Europe' },
      { value: 'Europe/Amsterdam', city: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
      
      // Americas
      { value: 'America/New_York', city: 'New York', country: 'USA Eastern', region: 'Americas' },
      { value: 'America/Chicago', city: 'Chicago', country: 'USA Central', region: 'Americas' },
      { value: 'America/Denver', city: 'Denver', country: 'USA Mountain', region: 'Americas' },
      { value: 'America/Los_Angeles', city: 'Los Angeles', country: 'USA Pacific', region: 'Americas' },
      { value: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brazil', region: 'Americas' },
      { value: 'America/Argentina/Buenos_Aires', city: 'Buenos Aires', country: 'Argentina', region: 'Americas' },
      { value: 'America/Mexico_City', city: 'Mexico City', country: 'Mexico', region: 'Americas' },
      { value: 'America/Toronto', city: 'Toronto', country: 'Canada Eastern', region: 'Americas' },
      
      // Asia Pacific
      { value: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan', region: 'Asia Pacific' },
      { value: 'Asia/Shanghai', city: 'Shanghai', country: 'China', region: 'Asia Pacific' },
      { value: 'Asia/Hong_Kong', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia Pacific' },
      { value: 'Asia/Singapore', city: 'Singapore', country: 'Singapore', region: 'Asia Pacific' },
      { value: 'Asia/Dubai', city: 'Dubai', country: 'UAE', region: 'Asia Pacific' },
      { value: 'Australia/Sydney', city: 'Sydney', country: 'Australia Eastern', region: 'Asia Pacific' },
      { value: 'Australia/Melbourne', city: 'Melbourne', country: 'Australia Eastern', region: 'Asia Pacific' },
      
      // Africa
      { value: 'Africa/Cairo', city: 'Cairo', country: 'Egypt', region: 'Africa' },
      { value: 'Africa/Johannesburg', city: 'Johannesburg', country: 'South Africa', region: 'Africa' },
      
      // UTC
      { value: 'UTC', city: 'UTC', country: 'Coordinated Universal Time', region: 'UTC' },
    ];

    return timezoneList.map(({ value, city, country, region }) => {
      try {
        // Get the current offset for this timezone
        const offset = getTimezoneOffset(value, now);
        const offsetHours = Math.floor(Math.abs(offset) / (1000 * 60 * 60));
        const offsetMinutes = Math.floor((Math.abs(offset) % (1000 * 60 * 60)) / (1000 * 60));
        
        // Format offset string
        const sign = offset <= 0 ? '+' : '-';
        const offsetString = offsetMinutes > 0 
          ? `GMT${sign}${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`
          : `GMT${sign}${offsetHours}`;

        return {
          value,
          label: `${country} (${city})`,
          offset: offsetString,
          region
        };
      } catch (error) {
        console.warn(`Error processing timezone ${value}:`, error);
        return {
          value,
          label: `${country} (${city})`,
          offset: 'GMT+0',
          region
        };
      }
    }).sort((a, b) => {
      // Sort by region first, then by label
      if (a.region !== b.region) {
        // UTC first, then regions alphabetically
        if (a.region === 'UTC') return -1;
        if (b.region === 'UTC') return 1;
        return a.region.localeCompare(b.region);
      }
      return a.label.localeCompare(b.label);
    });
  }, []);

  /**
   * Get timezone option by value
   */
  const getTimezoneByValue = (value: string): TimezoneOption | undefined => {
    return timezones.find(tz => tz.value === value);
  };

  /**
   * Get user's browser timezone
   */
  const getBrowserTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  /**
   * Format datetime for a specific timezone
   */
  const formatInTimezone = (date: Date, timezone: string, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string => {
    try {
      return format(date, formatStr, { timeZone: timezone });
    } catch (error) {
      console.warn(`Error formatting date in timezone ${timezone}:`, error);
      return format(date, formatStr);
    }
  };

  /**
   * Convert date to UTC from a specific timezone
   */
  const convertToUTC = (date: Date, timezone: string): Date => {
    try {
      // Create a date string in the target timezone and parse it as UTC
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      const hour = parts.find(p => p.type === 'hour')?.value;
      const minute = parts.find(p => p.type === 'minute')?.value;
      const second = parts.find(p => p.type === 'second')?.value;
      
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    } catch (error) {
      console.warn(`Error converting to UTC from timezone ${timezone}:`, error);
      return date;
    }
  };

  return {
    timezones,
    getTimezoneByValue,
    getBrowserTimezone,
    formatInTimezone,
    convertToUTC
  };
};