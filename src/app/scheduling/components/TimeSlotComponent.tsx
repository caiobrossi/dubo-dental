import React from 'react';
import { TimeSlot, AppointmentLayout, Appointment, BlockedTime, LAYOUT_CONSTANTS } from '../hooks/useScheduler';
import { AppointmentCard } from './AppointmentCard';

interface TimeSlotComponentProps {
  timeSlot: TimeSlot;
  appointmentLayouts: Map<string, AppointmentLayout>;
  isLastColumn: boolean;
  onClick: () => void;
  onAppointmentClick: (appointment: Appointment, event: React.MouseEvent<HTMLDivElement>) => void;
}

export const TimeSlotComponent: React.FC<TimeSlotComponentProps> = ({
  timeSlot,
  appointmentLayouts,
  isLastColumn,
  onClick,
  onAppointmentClick
}) => {
  const { hour, appointmentsStartingHere, blockedTimesStartingHere, isOccupied, isBlocked, isLastBlockedSlot } = timeSlot;
  // Allow clicking on slots with appointments (for multiple professionals/rooms)
  // Only block clicks on blocked time slots
  const isClickable = !isBlocked;

  // Get the blocked time information for this slot
  const blockedTimeInfo = blockedTimesStartingHere.length > 0 ? blockedTimesStartingHere[0] : null;

  const handleSlotClick = () => {
    if (isClickable) {
      onClick();
    }
  };

  return (
    <div
      className={`
        flex h-20 w-full flex-none flex-col items-start justify-start gap-1 
        ${!isLastColumn ? 'border-r' : ''} 
        ${isBlocked && !isLastBlockedSlot ? '' : 'border-b'} 
        border-solid border-neutral-border 
        pl-2 pr-2 py-1 
        ${isClickable ? 'hover:bg-neutral-50 cursor-pointer' : 'cursor-not-allowed'} 
        relative 
        ${isOccupied && appointmentsStartingHere.length === 0 ? 'bg-neutral-25' : ''}
        ${isBlocked ? 'bg-neutral-100' : ''}
      `}
      onClick={handleSlotClick}
      style={{ height: `${LAYOUT_CONSTANTS.SLOT_HEIGHT}px` }}
    >
      {/* Render appointments if any */}
      {appointmentsStartingHere.map(appointment => {
        const layout = appointmentLayouts.get(appointment.id);
        if (!layout) return null;

        return (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            layout={layout}
            onClick={onAppointmentClick}
          />
        );
      })}

      {/* Show blocked time info directly in slot */}
      {isBlocked && blockedTimeInfo && (
        <div className="w-full text-xs text-neutral-600 space-y-1 mt-1">
          <div className="flex items-center justify-between w-full">
            <div className="font-medium truncate flex-1 mr-2">
              {blockedTimeInfo.professional_name}
            </div>
            <div className="text-neutral-500 text-xs whitespace-nowrap">
              {blockedTimeInfo.start_time.substring(0, 5)} - {blockedTimeInfo.end_time.substring(0, 5)}
            </div>
          </div>
          {blockedTimeInfo.reason && (
            <div className="text-neutral-500 truncate text-xs">
              {blockedTimeInfo.reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};