import React, { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths,
  addWeeks,
  addDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/ui/components/Button';
import { supabase } from '@/lib/supabase/client';
import { useSettings } from '@/contexts/SettingsContext';

interface EnhancedCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose?: () => void;
  professionalId?: string;
}

interface DayAvailability {
  date: string;
  totalSlots: number;
  bookedSlots: number;
  status: 'available' | 'partial' | 'full';
}

export const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
  professionalId = 'all'
}) => {
  const { settings } = useSettings();
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  // Get weekStartsOn value based on settings
  const weekStartsOn = useMemo(() => {
    switch(settings.weekStartsOn) {
      case 'Sunday': return 0;
      case 'Monday': return 1;
      case 'Saturday': return 6;
      default: return 1;
    }
  }, [settings.weekStartsOn]);

  // Calculate the week range for the selected date
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn });
    const end = endOfWeek(selectedDate, { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [selectedDate, weekStartsOn]);

  // Fetch availability data for visible months
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        // Get date range for both visible months
        const startDate = startOfDay(currentMonth);
        const endDate = endOfDay(addMonths(currentMonth, 1));

        // Fetch appointments for the date range
        let query = supabase
          .from('appointments')
          .select('appointment_date, start_time, end_time')
          .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
          .lte('appointment_date', format(endDate, 'yyyy-MM-dd'));

        if (professionalId !== 'all') {
          query = query.eq('professional_id', professionalId);
        }

        const { data: appointments, error } = await query;

        if (error) {
          console.error('Error fetching availability:', error);
          return;
        }

        // Calculate availability for each day
        const dailyAvailability: { [key: string]: DayAvailability } = {};
        
        // Initialize days with default values - extend range to include all visible calendar days
        const extendedStartDate = startOfDay(subMonths(currentMonth, 1));
        const extendedEndDate = endOfDay(addMonths(currentMonth, 2));
        
        let currentDate = new Date(extendedStartDate);
        while (currentDate <= extendedEndDate) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          dailyAvailability[dateStr] = {
            date: dateStr,
            totalSlots: 24, // Assuming 24 hour slots per day
            bookedSlots: 0,
            status: 'available'
          };
          currentDate = addDays(currentDate, 1);
        }

        // Count booked slots
        appointments?.forEach(apt => {
          if (dailyAvailability[apt.appointment_date]) {
            dailyAvailability[apt.appointment_date].bookedSlots++;
          }
        });

        // Calculate status for each day
        Object.values(dailyAvailability).forEach(day => {
          const occupancyRate = day.bookedSlots / day.totalSlots;
          if (occupancyRate >= 0.8) {
            day.status = 'full';
          } else if (occupancyRate >= 0.5) {
            day.status = 'partial';
          } else {
            day.status = 'available';
          }
        });

        setAvailability(Object.values(dailyAvailability));
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [currentMonth, professionalId]);

  // Get availability status for a specific date
  const getDateStatus = (date: Date): 'available' | 'partial' | 'full' | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = availability.find(a => a.date === dateStr);
    return dayAvailability?.status;
  };

  const handleDayClick = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      // Only close after selecting a date
      setTimeout(() => onClose?.(), 100);
    }
  };

  const handleQuickJump = (weeks: number, months: number = 0) => {
    let newDate = new Date();
    if (weeks > 0) {
      newDate = addWeeks(newDate, weeks);
    }
    if (months > 0) {
      newDate = addMonths(newDate, months);
    }
    onDateSelect(newDate);
    // Only close after quick jump
    setTimeout(() => onClose?.(), 100);
  };

  // Custom modifiers for styling
  const modifiers = {
    selected: weekDays,
    available: (date: Date) => getDateStatus(date) === 'available',
    partial: (date: Date) => getDateStatus(date) === 'partial',
    full: (date: Date) => getDateStatus(date) === 'full'
  };

  const modifiersStyles = {
    selected: {
      backgroundColor: '#ede9fe',
      color: '#7c3aed',
      fontWeight: 600
    }
  };

  return (
    <div className="enhanced-calendar-container flex flex-col gap-4 p-4 bg-white/40 backdrop-blur-lg rounded-lg shadow-xl w-full relative border border-neutral-border" style={{ zIndex: 999999, position: 'relative' }}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex gap-16 justify-center flex-1">
          <h3 className="text-heading-4 font-heading-4 text-default-font text-center flex-1">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <h3 className="text-heading-4 font-heading-4 text-default-font text-center flex-1">
            {format(addMonths(currentMonth, 1), 'MMMM yyyy')}
          </h3>
        </div>
        
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rdp-custom">
        <style jsx global>{`
          /* Force calendar to be above everything */
          [data-radix-popper-content-wrapper] {
            z-index: 999999 !important;
          }
          
          .rdp-custom .rdp {
            --rdp-cell-size: 40px;
            --rdp-accent-color: #7c3aed;
            --rdp-background-color: #ede9fe;
            margin: 0;
            font-size: 14px;
          }
          
          .rdp-custom .rdp-months {
            display: flex;
            gap: 3rem;
            width: 100%;
            justify-content: space-between;
          }

          .rdp-custom .rdp-month {
            flex: 1;
            min-width: 300px;
          }
          
          .rdp-custom .rdp-table {
            width: 100%;
            margin: 0.5rem 0;
          }
          
          .rdp-custom .rdp-head_cell {
            padding: 0.25rem;
            font-weight: 600;
            font-size: 12px;
            height: 32px;
          }
          
          .rdp-custom .rdp-cell {
            padding: 1px;
            width: 40px;
            height: 40px;
          }
          
          .rdp-custom .rdp-button {
            width: 38px;
            height: 38px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
          }
          
          .rdp-custom .rdp-caption {
            display: none;
          }
          
          .rdp-custom .rdp-day {
            position: relative;
          }
          
          .rdp-custom .rdp-day_selected:not(.rdp-day_outside) {
            background-color: #ede9fe;
            color: #7c3aed;
            font-weight: 600;
          }
          
          .rdp-custom .rdp-day_selected:not(.rdp-day_outside):hover {
            background-color: #ddd6fe;
          }
          
          .rdp-custom .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: #f3f4f6;
          }
          
          /* Status indicators - show on ALL days */
          .rdp-custom .rdp-day::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #10b981; /* Default to green (available) */
          }
          
          .rdp-custom .rdp-day.day-available::after {
            background-color: #10b981;
          }
          
          .rdp-custom .rdp-day.day-partial::after {
            background-color: #f59e0b;
          }
          
          .rdp-custom .rdp-day.day-full::after {
            background-color: #ef4444;
          }
          
          /* Hide indicator for outside days only */
          .rdp-custom .rdp-day_outside::after {
            display: none;
          }
        `}</style>
        
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDayClick}
          month={currentMonth}
          numberOfMonths={2}
          weekStartsOn={weekStartsOn as 0 | 1 | 6}
          showOutsideDays={false}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          modifiersClassNames={{
            available: 'day-available',
            partial: 'day-partial',
            full: 'day-full'
          }}
        />
      </div>

      {/* Quick Jump Buttons */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          variant="neutral-secondary"
          size="medium"
          onClick={() => handleQuickJump(1)}
        >
          In 1 week
        </Button>
        <Button
          variant="neutral-secondary"
          size="medium"
          onClick={() => handleQuickJump(2)}
        >
          In 2 weeks
        </Button>
        <Button
          variant="neutral-secondary"
          size="medium"
          onClick={() => handleQuickJump(3)}
        >
          In 3 weeks
        </Button>
        <Button
          variant="neutral-secondary"
          size="medium"
          onClick={() => handleQuickJump(4)}
        >
          In 4 weeks
        </Button>
        <Button
          variant="neutral-secondary"
          size="medium"
          onClick={() => handleQuickJump(0, 3)}
        >
          In 3 months
        </Button>
        <Button
          variant="neutral-secondary"
          size="medium"
          onClick={() => handleQuickJump(0, 6)}
        >
          In 6 months
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Full</span>
        </div>
      </div>
    </div>
  );
};