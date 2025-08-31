import React, { memo, useMemo } from 'react';
import { Appointment, BlockedTime } from '../types';
import { 
  formatTimeHM, 
  isFirstBlockedSlot, 
  shouldRemoveBottomBorder,
  calculateAppointmentHeight,
  calculateAppointmentTop
} from '../utils/timeUtils';
import { formatPatientNameForDisplay } from '../utils/nameUtils';
import { useScheduler } from '../hooks/useScheduler';
import { AppointmentCard } from './AppointmentCard';

interface TimeSlotProps {
  date: Date;
  hour: number;
  appointments: Appointment[];
  allDayAppointments: Appointment[];
  blockedTimes: BlockedTime[];
  isLastColumn: boolean;
  onSlotClick: (date: Date, hour: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onBlockedTimeClick: (blockedTime: BlockedTime) => void;
}

/**
 * Individual time slot component that displays appointments and blocked times
 */
export const TimeSlot = memo<TimeSlotProps>(({
  date,
  hour,
  appointments,
  allDayAppointments,
  blockedTimes,
  isLastColumn,
  onSlotClick,
  onAppointmentClick,
  onBlockedTimeClick
}) => {
  const hasContent = appointments.length > 0 || blockedTimes.length > 0;
  const shouldRemoveBorder = shouldRemoveBottomBorder(blockedTimes, date, hour);
  const isBlockedSlot = blockedTimes.length > 0;
  
  // Use the scheduler hook with ALL appointments for the day to calculate proper layouts
  const { calculateAppointmentLayouts } = useScheduler(allDayAppointments, blockedTimes);
  const appointmentLayouts = useMemo(() => {
    return calculateAppointmentLayouts(date);
  }, [calculateAppointmentLayouts, date]);

  const handleSlotClick = () => {
    if (!hasContent) {
      onSlotClick(date, hour);
    }
  };

  const handleAppointmentClick = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    onAppointmentClick(appointment);
  };

  const handleBlockedTimeClick = (e: React.MouseEvent, blockedTime: BlockedTime) => {
    e.stopPropagation();
    onBlockedTimeClick(blockedTime);
  };

  return (
    <div 
      className={`
        flex h-20 w-full flex-none flex-col items-start gap-1 
        ${!isLastColumn ? 'border-r' : ''} 
        ${!shouldRemoveBorder ? 'border-b' : ''} 
        border-solid border-neutral-border pl-1 pr-2 pt-1 pb-1 
        hover:bg-neutral-50 cursor-pointer relative
        ${isBlockedSlot ? 'bg-neutral-50' : ''}
      `}
      onClick={handleSlotClick}
    >
      {/* Render blocked time info only in the first slot */}
      {blockedTimes.map((blockedTime) => 
        isFirstBlockedSlot(date, hour, blockedTime) ? (
          <div
            key={`blocked-${blockedTime.id}`}
            className="w-full text-xs"
            onClick={(e) => handleBlockedTimeClick(e, blockedTime)}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neutral-700 truncate">
                {blockedTime.professional_name || 'No professional'}
              </div>
              <div className="text-neutral-600 text-xs">
                {formatTimeHM(blockedTime.start_time)} - {formatTimeHM(blockedTime.end_time)}
              </div>
            </div>
            {blockedTime.reason && (
              <div className="text-neutral-500 truncate mt-0.5 text-xs">
                {blockedTime.reason}
              </div>
            )}
          </div>
        ) : null
      )}
      
      {/* Render appointments using AppointmentCard with proper layout */}
      {appointments.map((appointment) => {
        const layout = appointmentLayouts.get(appointment.id);
        if (!layout) {
          console.warn(`No layout found for appointment ${appointment.id}`);
          return null;
        }
        
        return (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            layout={layout}
            onClick={(apt, event) => {
              event.stopPropagation();
              onAppointmentClick(apt);
            }}
          />
        );
      })}
    </div>
  );
});