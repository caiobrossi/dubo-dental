import React, { memo } from 'react';
import { Appointment, BlockedTime } from '../types';
import { 
  formatTimeHM, 
  isFirstBlockedSlot, 
  shouldRemoveBottomBorder,
  calculateAppointmentHeight,
  calculateAppointmentTop
} from '../utils/timeUtils';
import { formatPatientNameForDisplay } from '../utils/nameUtils';

interface TimeSlotProps {
  date: Date;
  hour: number;
  appointments: Appointment[];
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
  blockedTimes,
  isLastColumn,
  onSlotClick,
  onAppointmentClick,
  onBlockedTimeClick
}) => {
  const hasContent = appointments.length > 0 || blockedTimes.length > 0;
  const shouldRemoveBorder = shouldRemoveBottomBorder(blockedTimes, date, hour);
  const isBlockedSlot = blockedTimes.length > 0;

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
      
      {/* Render appointments */}
      {appointments.map((appointment, index) => {
        const cardHeight = calculateAppointmentHeight(appointment.start_time, appointment.end_time);
        const cardTop = calculateAppointmentTop(appointment.start_time, hour);
        
        return (
          <div
            key={appointment.id}
            className="absolute bg-blue-100 border-l-4 border-blue-500 px-2 py-1 text-xs overflow-hidden"
            style={{ 
              borderRadius: '4px',
              height: `${cardHeight}px`,
              top: `${cardTop + 4}px`, // Add 4px for pt-1 offset
              left: '4px', // Match pl-1
              width: 'calc(100% - 12px)', // Total padding compensation (4px left + 8px right)
              zIndex: 10 // Ensure card appears above other slots
            }}
            onClick={(e) => handleAppointmentClick(e, appointment)}
          >
            {/* Top row: Patient name and time */}
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-blue-800 truncate flex items-center gap-1">
                {formatPatientNameForDisplay(appointment.patient_name)}
                {appointments.length > 1 && index === 0 && (
                  <span className="text-blue-600 text-xs">
                    +{appointments.length - 1}
                  </span>
                )}
              </div>
              <div className="text-blue-600 text-xs flex-shrink-0">
                {formatTimeHM(appointment.start_time)} - {formatTimeHM(appointment.end_time)}
              </div>
            </div>
            
            {/* Bottom row: Procedure type */}
            <div className="text-blue-500 truncate">
              {appointment.appointment_type || 'Consulta'}
            </div>
          </div>
        );
      })}
    </div>
  );
});