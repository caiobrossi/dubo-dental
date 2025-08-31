import React, { memo, useMemo, useEffect, useRef, forwardRef } from 'react';
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
export const SchedulingGrid = forwardRef<HTMLDivElement, SchedulingGridProps>(({
  selectedDate,
  viewMode,
  appointments,
  blockedTimes,
  onSlotClick,
  onAppointmentClick,
  onBlockedTimeClick
}, ref) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const displayDays = useMemo(() => 
    generateDisplayDays(selectedDate, viewMode), 
    [selectedDate, viewMode]
  );
  
  const hours = useMemo(() => 
    generateBusinessHours(), 
    []
  );

  // Auto-scroll to current time on mount and when view changes
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const scrollTimeout = setTimeout(() => {
      const scrollContainer = (ref as React.RefObject<HTMLDivElement>)?.current || scrollContainerRef.current;
      if (scrollContainer) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        
        // Calculate the scroll position
        // Each hour slot is 80px tall (SLOT_HEIGHT)
        const SLOT_HEIGHT = 80;
        
        // Find the index of the current hour in the hours array
        let hourIndex = hours.findIndex(h => h === currentHour);
        
        // If current hour is not in business hours, find the closest one
        if (hourIndex === -1) {
          // If before business hours, scroll to start
          if (currentHour < hours[0]) {
            hourIndex = 0;
          } 
          // If after business hours, scroll to end
          else if (currentHour > hours[hours.length - 1] && hours[hours.length - 1] !== 0) {
            hourIndex = hours.length - 1;
          }
          // Handle wrap-around for late night hours (after midnight)
          else if (currentHour < 9 && currentHour >= 0) {
            // Find the hour in the late night section
            const lateNightIndex = hours.findIndex(h => h === currentHour);
            if (lateNightIndex !== -1) {
              hourIndex = lateNightIndex;
            } else {
              // Default to start of day
              hourIndex = 0;
            }
          }
          // Otherwise find the closest hour
          else {
            hourIndex = hours.findIndex(h => h > currentHour);
            if (hourIndex === -1) hourIndex = 0;
          }
        }
        
        // Calculate scroll position
        // Add minutes offset within the hour
        const minuteOffset = (currentMinutes / 60) * SLOT_HEIGHT;
        const scrollPosition = (hourIndex * SLOT_HEIGHT) + minuteOffset;
        
        // Get container height to center the current time
        const containerHeight = scrollContainer.clientHeight;
        const centeredPosition = scrollPosition - (containerHeight / 2) + (SLOT_HEIGHT / 2);
        
        // Smooth scroll to position
        scrollContainer.scrollTo({
          top: Math.max(0, centeredPosition),
          behavior: 'smooth'
        });
      }
    }, 100); // 100ms delay to ensure rendering is complete
    
    return () => clearTimeout(scrollTimeout);
  }, [hours, viewMode, selectedDate]);

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
      <div ref={ref || scrollContainerRef} className="flex w-full grow shrink-0 basis-0 items-start overflow-auto">
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
                  
                  // Get ALL appointments for the day to calculate proper layouts
                  const dayAppointments = appointments.filter(apt => 
                    apt.appointment_date === date.toISOString().split('T')[0]
                  );

                  return (
                    <TimeSlot
                      key={hour}
                      date={date}
                      hour={hour}
                      appointments={slotAppointments}
                      allDayAppointments={dayAppointments}
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

SchedulingGrid.displayName = 'SchedulingGrid';