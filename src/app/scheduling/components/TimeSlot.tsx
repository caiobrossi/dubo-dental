import React, { memo, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
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

// Quarter-hour drop zone component
const QuarterHourDropZone: React.FC<{
  id: string;
  minutes: number;
  hour: number;
  children?: React.ReactNode;
}> = ({ id, minutes, hour, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className={`
        absolute left-0 right-0 transition-colors duration-200
        ${isOver ? 'bg-blue-100 border-2 border-blue-400 border-dashed rounded-md' : ''}
      `}
      style={{
        top: `${minutes / 15 * 25}%`,
        height: '25%',
        zIndex: 1
      }}
    >
      {isOver && (
        <div className="absolute top-1 left-1 text-xs text-blue-600 font-semibold bg-blue-50 px-1 rounded">
          {String(hour).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
        </div>
      )}
      {children}
    </div>
  );
};

interface TimeSlotProps {
  date: Date;
  hour: number;
  appointments: Appointment[];
  allDayAppointments: Appointment[];
  blockedTimes: BlockedTime[];
  isLastColumn: boolean;
  isFirstColumn: boolean;
  onSlotClick: (date: Date, hour: number) => void;
  onAppointmentClick: (appointment: Appointment, event?: React.MouseEvent) => void;
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
  isFirstColumn,
  onSlotClick,
  onAppointmentClick,
  onBlockedTimeClick
}) => {
  // Create quarter-hour drop zones (00, 15, 30, 45)
  const quarterHours = [0, 15, 30, 45];
  const dropZones = quarterHours.map(minutes => ({
    minutes,
    id: `slot-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${hour}-${minutes.toString().padStart(2, '0')}`
  }));

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
    } else if (isBlockedSlot && blockedTimes.length === 0) {
      // This is a blocked slot but no blocked time data - treat as new blocked time creation
      console.log('Blocked slot clicked without data - opening blocked time modal for', date, hour);
      onSlotClick(date, hour);
    }
  };

  const handleAppointmentClick = (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation();
    onAppointmentClick(appointment, event);
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
        ${isFirstColumn ? 'border-l' : ''}
        border-solid border-neutral-border pl-0.5 pr-1 pt-0.5 pb-0.5 
        hover:bg-neutral-50 cursor-pointer relative overflow-visible
        ${isBlockedSlot ? 'bg-neutral-50' : ''}
      `}
      onClick={handleSlotClick}
    >
      {/* Quarter-hour drop zones */}
      {dropZones.map((zone, index) => (
        <QuarterHourDropZone
          key={zone.id}
          id={zone.id}
          minutes={zone.minutes}
          hour={hour}
        />
      ))}
      {/* Render blocked time info only in the first slot */}
      {blockedTimes.map((blockedTime) => 
        isFirstBlockedSlot(date, hour, blockedTime) ? (
          <div
            key={`blocked-${blockedTime.id}`}
            className="w-full text-xs cursor-pointer"
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
            onClick={handleAppointmentClick}
          />
        );
      })}
    </div>
  );
});