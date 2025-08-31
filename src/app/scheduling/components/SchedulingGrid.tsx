import React, { memo, useMemo } from 'react';
import { TimeSlot } from './TimeSlot';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { Appointment, BlockedTime, ViewMode } from '../types';
import { 
  generateDisplayDays, 
  generateBusinessHours, 
  isToday, 
  getDayName 
} from '../utils/dateUtils';
import { 
  getAppointmentsForSlot, 
  getBlockedTimesForSlot 
} from '../utils/timeUtils';
import { useCurrentTimePosition } from '../hooks/useCurrentTimePosition';

interface SchedulingGridProps {
  selectedDate: Date;
  viewMode: ViewMode;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  onSlotClick: (date: Date, hour: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onBlockedTimeClick: (blockedTime: BlockedTime) => void;
}

/**
 * Main scheduling grid component displaying time slots and appointments
 */
export const SchedulingGrid = memo<SchedulingGridProps>(({
  selectedDate,
  viewMode,
  appointments,
  blockedTimes,
  onSlotClick,
  onAppointmentClick,
  onBlockedTimeClick
}) => {
  const displayDays = useMemo(() => 
    generateDisplayDays(selectedDate, viewMode), 
    [selectedDate, viewMode]
  );
  
  const hours = useMemo(() => 
    generateBusinessHours(), 
    []
  );

  return (
    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
      {/* Fixed header with day names */}
      <div className="flex w-full overflow-x-auto">
        <div className="flex min-w-[1200px] grow shrink-0 basis-0 items-start rounded-t-rounded-xlarge border-t-2 border-l-2 border-r-2 border-b border-solid border-new-white-100 bg-default-background">
          {/* Empty corner cell for time column */}
          <div className="flex w-16 flex-none flex-col items-start">
            <div className="flex h-16 w-full flex-none flex-col items-start gap-2 border-r border-b border-solid border-neutral-border px-2 py-2" />
          </div>
          
          {/* Day headers */}
          {displayDays.map((date, index) => {
            const today = isToday(date);
            
            return (
              <div 
                key={index} 
                className="flex w-full flex-1 flex-col items-start" 
                style={{ 
                  minWidth: viewMode === 'day' ? '100%' : '160px' 
                }}
              >
                <div className="flex h-16 w-full flex-none items-center justify-center gap-2 border-b-2 border-solid border-neutral-border px-2 py-2">
                  <div className="flex items-center gap-2">
                    {today ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                        <span className="text-[16px] font-semibold text-white">
                          {date.getDate()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-heading-3 font-heading-3 text-default-font">
                        {date.getDate()}
                      </span>
                    )}
                    <span className="text-[14px] font-normal text-subtext-color">
                      {getDayName(date)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Scrollable content with time slots */}
      <div className="flex w-full grow shrink-0 basis-0 items-start overflow-auto">
        <div className="flex min-w-[1200px] grow shrink-0 basis-0 items-start rounded-b-rounded-xlarge border-b-2 border-l-2 border-r-2 border-solid border-new-white-100 bg-new-white-50">
          {/* Time column */}
          <div className="flex w-16 flex-none flex-col items-start">
            {/* Hour labels */}
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="flex h-20 w-full flex-none flex-col items-end gap-2 border-r border-b border-solid border-neutral-border px-2 py-1"
              >
                <span className="text-[14px] font-normal text-subtext-color">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns with time slots */}
          {displayDays.map((date, index) => {
            const isLastColumn = index === displayDays.length - 1;
            const timeIndicatorPosition = useCurrentTimePosition(date);
            
            return (
              <div 
                key={index} 
                className="flex w-full flex-1 flex-col items-start relative" 
                style={{ 
                  minWidth: viewMode === 'day' ? '100%' : '160px' 
                }}
              >
                {/* Current time indicator - only for today */}
                {timeIndicatorPosition && (
                  <CurrentTimeIndicator position={timeIndicatorPosition} />
                )}
                
                {/* Time slots */}
                {hours.map((hour) => {
                  const slotAppointments = getAppointmentsForSlot(appointments, date, hour);
                  const slotBlockedTimes = getBlockedTimesForSlot(blockedTimes, date, hour);

                  return (
                    <TimeSlot
                      key={hour}
                      date={date}
                      hour={hour}
                      appointments={slotAppointments}
                      blockedTimes={slotBlockedTimes}
                      isLastColumn={isLastColumn}
                      onSlotClick={onSlotClick}
                      onAppointmentClick={onAppointmentClick}
                      onBlockedTimeClick={onBlockedTimeClick}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});