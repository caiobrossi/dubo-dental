import React, { memo, useMemo, useEffect, useRef, forwardRef, useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import { 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
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
import { AppointmentPopover } from '@/components/custom/AppointmentPopover';
import { useSettings } from '@/contexts/SettingsContext';

interface SchedulingGridProps {
  selectedDate: Date;
  viewMode: ViewMode;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  onSlotClick: (date: Date, hour: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onBlockedTimeClick: (blockedTime: BlockedTime) => void;
  onAppointmentStatusUpdate?: () => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (appointment: Appointment) => void;
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
  onBlockedTimeClick,
  onAppointmentStatusUpdate,
  onEditAppointment,
  onDeleteAppointment
}, ref) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { formatTime, getCurrentDateTime, settings } = useSettings();
  
  // Popover state
  const [popoverData, setPopoverData] = useState<{
    appointment: Appointment;
    position: { x: number; y: number };
    originalElement?: HTMLElement;
  } | null>(null);
  
  // Drag and drop state
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  
  // Select state to prevent popover closing
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const displayDays = useMemo(() => 
    generateDisplayDays(selectedDate, viewMode, settings.weekStartsOn), 
    [selectedDate, viewMode, settings.weekStartsOn]
  );
  
  const hours = useMemo(() => 
    generateBusinessHours(), 
    []
  );


  // Update time indicators every minute
  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());
  
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(getCurrentDateTime());
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(interval);
  }, [getCurrentDateTime]);

  // Recalculate positions when current time changes
  const updatedTimeIndicatorPositions = useMemo(() => {
    return displayDays.map(date => {
      if (!isToday(date)) {
        return null;
      }

      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();

      const isInBusinessHours = 
        (hours >= 9 && hours <= 23) || (hours >= 1 && hours <= 8) || hours === 0;

      if (!isInBusinessHours) {
        return null;
      }

      const slotHeight = 80;
      const minutePercentage = minutes / 60;
      
      let slotIndex;
      if (hours >= 9 && hours <= 20) {
        slotIndex = hours - 9;
      } else if (hours >= 21 && hours <= 23) {
        slotIndex = (hours - 21) + 12;
      } else if (hours === 0) {
        slotIndex = 15;
      } else {
        slotIndex = (hours - 1) + 16;
      }

      const topPosition = (slotIndex * slotHeight) + (minutePercentage * slotHeight);
      
      return {
        top: topPosition,
        hour: hours,
        minute: minutes,
        timeString: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      };
    });
  }, [displayDays, currentTime]);

  // Auto-scroll to current time on mount and when view changes
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const scrollTimeout = setTimeout(() => {
      const scrollContainer = (ref as React.RefObject<HTMLDivElement>)?.current || scrollContainerRef.current;
      if (scrollContainer) {
        const now = getCurrentDateTime();
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
  }, [hours, viewMode, selectedDate, getCurrentDateTime]);

  // Function to calculate popover position for an appointment
  const calculatePopoverPosition = (appointment: Appointment, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    
    // Check if appointment is in the last two columns based on current view mode
    const appointmentDate = new Date(appointment.appointment_date);
    
    // Find the index of this appointment's date in the current displayDays
    const appointmentIndex = displayDays.findIndex(day => {
      const dayStr = day.toDateString();
      const appointmentStr = appointmentDate.toDateString();
      return dayStr === appointmentStr;
    });
    
    // Check if this appointment is in the last two columns
    const totalColumns = displayDays.length;
    const isLastTwoColumns = appointmentIndex >= totalColumns - 2;
    
    // Position popover based on column position
    const POPOVER_WIDTH = 320;
    const GAP = 10;
    
    return isLastTwoColumns
      ? {
          x: Math.max(GAP, rect.left - POPOVER_WIDTH - GAP), // Show to the left for last two columns
          y: rect.top
        }
      : {
          x: Math.min(window.innerWidth - POPOVER_WIDTH - GAP, rect.right + GAP), // Show to the right for other columns
          y: rect.top
        };
  };

  // Handle appointment click to show popover
  const handleAppointmentClick = (appointment: Appointment, event?: React.MouseEvent) => {
    if (event) {
      const element = event.currentTarget as HTMLElement;
      const position = calculatePopoverPosition(appointment, element);
      setPopoverData({ appointment, position, originalElement: element });
    }
    
    // Call the original handler
    onAppointmentClick(appointment);
  };

  // Close popover
  const closePopover = () => {
    setPopoverData(null);
  };

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close popover if Select is open
      if (isSelectOpen) return;
      
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover();
      }
    };

    if (popoverData) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverData, isSelectOpen]);

  // Handle window resize to reposition popover
  useEffect(() => {
    let animationFrameId: number;
    let isThrottled = false;
    
    const handleResize = () => {
      if (isThrottled) return;
      
      isThrottled = true;
      animationFrameId = requestAnimationFrame(() => {
        if (popoverData && popoverData.originalElement) {
          // Check if the original element still exists in the DOM
          if (document.contains(popoverData.originalElement)) {
            const newPosition = calculatePopoverPosition(popoverData.appointment, popoverData.originalElement);
            setPopoverData({
              ...popoverData,
              position: newPosition
            });
          } else {
            // Element no longer exists, close popover
            closePopover();
          }
        }
        isThrottled = false;
      });
    };

    if (popoverData) {
      window.addEventListener('resize', handleResize, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [popoverData, displayDays]); // Include displayDays to recalculate when view changes

  // Handle Select open/close state
  const handleSelectOpenChange = (open: boolean) => {
    setIsSelectOpen(open);
  };

  // Handle appointment status update
  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      // Import supabase at the top if needed
      const { supabase } = await import('@/lib/supabase');
      
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment status:', error);
        // You could show a toast notification here
        return;
      }

      if (onAppointmentStatusUpdate) {
        onAppointmentStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const appointmentId = active.id as string;
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setActiveAppointment(appointment);
      // Close popover if it's open
      setPopoverData(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAppointment(null);
    
    if (!over || !active) return;
    
    const appointmentId = active.id as string;
    const dropZoneId = over.id as string;
    
    // Parse drop zone ID (format: "slot-YYYY-MM-DD-HH-MM")
    const [, ...dateParts] = dropZoneId.split('-');
    if (dateParts.length !== 5) return;
    
    const [year, month, day, hour, minutes] = dateParts;
    const newDate = `${year}-${month}-${day}`;
    const newTime = `${hour.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    // Format the new date and time for display
    const formattedDate = new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = `${hour.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    
    // Show confirmation dialog
    const confirmMessage = `Do you want to reschedule this appointment to ${formattedDate} at ${formattedTime}?`;
    
    if (!window.confirm(confirmMessage)) {
      // User cancelled, don't update
      return;
    }
    
    // Calculate new end time based on appointment duration
    const startTime = new Date(`2000-01-01T${appointment.start_time}`);
    const endTime = new Date(`2000-01-01T${appointment.end_time}`);
    const duration = endTime.getTime() - startTime.getTime();
    
    const newStartTime = new Date(`2000-01-01T${newTime}`);
    const newEndTime = new Date(newStartTime.getTime() + duration);
    
    const newEndTimeString = newEndTime.toTimeString().slice(0, 8);
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { error } = await supabase
        .from('appointments')
        .update({ 
          appointment_date: newDate,
          start_time: newTime,
          end_time: newEndTimeString
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment:', error);
        alert('Failed to reschedule appointment. Please try again.');
        return;
      }

      // Refresh data
      if (onAppointmentStatusUpdate) {
        onAppointmentStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to reschedule appointment. Please try again.');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
        {/* Fixed header with day names */}
        <div className="flex w-full overflow-x-auto">
          <div className="flex min-w-[1200px] grow shrink-0 basis-0 items-start rounded-t-rounded-xlarge border-t-2 border-r-2 border-solid border-new-white-100 bg-default-background">
            {/* Empty corner cell for time column */}
            <div className="flex w-16 flex-none flex-col items-start">
              <div className="flex h-16 w-full flex-none flex-col items-start gap-2 border-r border-solid border-white px-2 py-2" />
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
                  <div className="flex h-16 w-full flex-none items-center justify-center gap-2 px-2 py-2">
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
          <div className="flex min-w-[1200px] grow shrink-0 basis-0 items-start rounded-b-rounded-xlarge border-b-2 border-r-2 border-solid border-new-white-100 bg-new-white-50 relative">
          {/* Time column */}
          <div className="flex w-16 flex-none flex-col items-start">
            {/* Hour labels */}
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="flex h-20 w-full flex-none flex-col items-end gap-2 border-r border-b border-solid border-neutral-border px-2 py-1"
              >
                <span className="text-[14px] font-normal text-subtext-color">
                  {formatTime(`${hour}:00`)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns with time slots */}
          {displayDays.map((date, index) => {
            const isLastColumn = index === displayDays.length - 1;
            const isFirstColumn = index === 0;
            const timeIndicatorPosition = updatedTimeIndicatorPositions[index];
            
            return (
              <div 
                key={index} 
                className={`flex w-full flex-1 flex-col items-start relative overflow-visible ${isFirstColumn ? '-ml-px' : ''}`}
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
                      isFirstColumn={isFirstColumn}
                      onSlotClick={onSlotClick}
                      onAppointmentClick={handleAppointmentClick}
                      onBlockedTimeClick={onBlockedTimeClick}
                    />
                  );
                })}
              </div>
            );
          })}
          </div>
        </div>
        
        {/* Appointment Popover */}
        {popoverData && (
          <AppointmentPopover
            appointment={popoverData.appointment}
            position={popoverData.position}
            onClose={closePopover}
            popoverRef={popoverRef}
            onStatusUpdate={handleStatusUpdate}
            onEditAppointment={onEditAppointment}
            onDeleteAppointment={onDeleteAppointment}
            onSelectOpen={handleSelectOpenChange}
          />
        )}
      </div>
      
      {/* Drag overlay for smooth dragging experience */}
      <DragOverlay>
        {activeAppointment && (
          <div className="bg-blue-100 border-l-4 border-blue-500 px-2 py-1 text-xs shadow-lg rounded opacity-90">
            <div className="font-semibold text-blue-800 truncate">
              {activeAppointment.patient_name}
            </div>
            <div className="text-blue-600 text-xs">
              {formatTime(activeAppointment.start_time)} - {formatTime(activeAppointment.end_time)}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
});

SchedulingGrid.displayName = 'SchedulingGrid';