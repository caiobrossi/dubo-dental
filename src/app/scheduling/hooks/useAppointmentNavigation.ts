import { useCallback, useRef } from 'react';
import { Appointment } from '../types';

/**
 * Hook for navigating to specific appointments in the calendar
 */
export const useAppointmentNavigation = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToAppointment = useCallback((appointment: Appointment) => {
    if (!scrollContainerRef.current) return;

    // Parse appointment start time
    const [startHour, startMinutes] = appointment.start_time.split(':').map(Number);
    
    // Generate hours array (same as in useScheduler)
    const hours = [];
    for (let i = 9; i <= 24; i++) hours.push(i);
    for (let i = 1; i <= 8; i++) hours.push(i);

    // Find the hour index
    const hourIndex = hours.findIndex(h => h === startHour);
    if (hourIndex === -1) return;

    // Calculate scroll position
    const SLOT_HEIGHT = 80;
    const minuteOffset = (startMinutes / 60) * SLOT_HEIGHT;
    const scrollPosition = (hourIndex * SLOT_HEIGHT) + minuteOffset;

    // Get container height to center the appointment
    const containerHeight = scrollContainerRef.current.clientHeight;
    const centeredPosition = scrollPosition - (containerHeight / 2) + (SLOT_HEIGHT / 2);

    // Smooth scroll to position with a slight delay to ensure DOM is ready
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: Math.max(0, centeredPosition),
        behavior: 'smooth'
      });
    }, 100);

    // Highlight the appointment briefly
    highlightAppointment(appointment.id);
  }, []);

  const highlightAppointment = useCallback((appointmentId: string) => {
    // Find the appointment card element and briefly highlight it
    setTimeout(() => {
      const appointmentElement = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
      if (appointmentElement) {
        const originalStyle = appointmentElement.getAttribute('style') || '';
        
        // Add highlight effect
        (appointmentElement as HTMLElement).style.cssText = originalStyle + '; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important; transform: scale(1.02) !important; transition: all 0.3s ease !important;';
        
        // Remove highlight after 2 seconds
        setTimeout(() => {
          (appointmentElement as HTMLElement).style.cssText = originalStyle + '; transition: all 0.3s ease !important;';
          
          // Remove transition after animation
          setTimeout(() => {
            (appointmentElement as HTMLElement).style.cssText = originalStyle;
          }, 300);
        }, 2000);
      }
    }, 200); // Small delay to ensure appointment is rendered
  }, []);

  return {
    scrollContainerRef,
    scrollToAppointment
  };
};