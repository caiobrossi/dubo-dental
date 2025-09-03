import React, { useMemo } from 'react';
import { Appointment, BlockedTime, useScheduler, LAYOUT_CONSTANTS } from '../hooks/useScheduler';
import { DayColumn } from './DayColumn';
import { useSettings } from '@/contexts/SettingsContext';

interface SchedulerGridProps {
  selectedDate: Date;
  viewMode: 'day' | '5days' | 'week';
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  onSlotClick: (date: Date, hour: number) => void;
  onAppointmentClick: (appointment: Appointment, event: React.MouseEvent<HTMLDivElement>) => void;
}

export const SchedulerGrid: React.FC<SchedulerGridProps> = ({
  selectedDate,
  viewMode,
  appointments,
  blockedTimes,
  onSlotClick,
  onAppointmentClick
}) => {
  const { hours } = useScheduler(appointments, blockedTimes);
  const { formatTime } = useSettings();

  // Gerar dias baseado no modo de visualização
  const displayDays = useMemo(() => {
    const days = [];
    
    const getWeekStart = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };

    if (viewMode === 'day') {
      days.push(new Date(selectedDate));
    } else if (viewMode === '5days') {
      const weekStart = getWeekStart(selectedDate);
      for (let i = 0; i < 5; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        days.push(date);
      }
    } else {
      const weekStart = getWeekStart(selectedDate);
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        days.push(date);
      }
    }
    
    return days;
  }, [selectedDate, viewMode]);

  return (
    <div className="flex w-full h-full">
      <div className="flex w-full rounded-b-rounded-xlarge border-2 border-t-0 border-solid border-new-white-100 bg-new-white-50">
        {/* Coluna de horários */}
        <div className="flex w-16 flex-none flex-col items-start">
          {hours.map((hour) => (
            <div 
              key={hour} 
              className="flex w-full flex-none flex-col items-end gap-2 border-r border-b border-solid border-neutral-border px-2 py-1"
              style={{ height: `${LAYOUT_CONSTANTS.SLOT_HEIGHT}px` }}
            >
              <span className="text-[14px] font-normal text-subtext-color">
                {formatTime(`${hour}:00`)}
              </span>
            </div>
          ))}
        </div>

        {/* Colunas dos dias */}
        {displayDays.map((date, index) => (
          <DayColumn
            key={index}
            date={date}
            appointments={appointments}
            blockedTimes={blockedTimes}
            viewMode={viewMode}
            isLastColumn={index === displayDays.length - 1}
            onSlotClick={onSlotClick}
            onAppointmentClick={onAppointmentClick}
          />
        ))}
      </div>
    </div>
  );
};