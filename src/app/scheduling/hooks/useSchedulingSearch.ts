import { useMemo, useState, useCallback } from 'react';
import { Appointment } from '../types';

export interface SearchResult {
  appointment: Appointment;
  matches: {
    patientName: boolean;
    procedureType: boolean;
  };
}

/**
 * Custom hook for searching appointments
 */
export const useSchedulingSearch = (appointments: Appointment[]) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filter appointments based on search term
  const searchAppointments = useCallback((searchTerm: string): SearchResult[] => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const normalizedSearch = searchTerm.toLowerCase().trim();

    const filteredResults = appointments.filter(appointment => {
      const patientName = (appointment.patient_name || '').toLowerCase();
      const procedureType = (appointment.appointment_type || '').toLowerCase();

      return patientName.includes(normalizedSearch) || 
             procedureType.includes(normalizedSearch);
    }).map(appointment => ({
      appointment,
      matches: {
        patientName: (appointment.patient_name || '').toLowerCase().includes(normalizedSearch),
        procedureType: (appointment.appointment_type || '').toLowerCase().includes(normalizedSearch)
      }
    }));

    // Sort results chronologically (by date and time)
    filteredResults.sort((a, b) => {
      const dateCompare = a.appointment.appointment_date.localeCompare(b.appointment.appointment_date);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      // If same date, sort by start time
      return a.appointment.start_time.localeCompare(b.appointment.start_time);
    });

    return filteredResults.slice(0, 8); // Limit to 8 results for performance
  }, [appointments]);

  const openDropdown = useCallback(() => setIsOpen(true), []);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  return {
    searchAppointments,
    isOpen,
    openDropdown,
    closeDropdown
  };
};