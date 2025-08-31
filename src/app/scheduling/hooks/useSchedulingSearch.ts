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
    
    // Split search terms for more flexible matching
    const searchTerms = normalizedSearch.split(' ').filter(term => term.length > 0);

    const filteredResults = appointments.filter(appointment => {
      const patientName = (appointment.patient_name || '').toLowerCase();
      const procedureType = (appointment.appointment_type || '').toLowerCase();
      const professionalName = (appointment.professional_name || '').toLowerCase();
      const notes = (appointment.notes || '').toLowerCase();
      
      // Check if all search terms match somewhere in the appointment data
      return searchTerms.every(term => 
        patientName.includes(term) || 
        procedureType.includes(term) ||
        professionalName.includes(term) ||
        notes.includes(term)
      );
    }).map(appointment => ({
      appointment,
      matches: {
        patientName: searchTerms.some(term => (appointment.patient_name || '').toLowerCase().includes(term)),
        procedureType: searchTerms.some(term => (appointment.appointment_type || '').toLowerCase().includes(term))
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

    return filteredResults.slice(0, 15); // Limit to 15 results for better user experience
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