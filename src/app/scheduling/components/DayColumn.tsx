import React, { useMemo, useState, useEffect } from 'react';
import { Appointment, BlockedTime, useScheduler, LAYOUT_CONSTANTS } from '../hooks/useScheduler';
import { TimeSlotComponent } from './TimeSlotComponent';

interface DayColumnProps {
  date: Date;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  viewMode: 'day' | '5days' | 'week';
  isLastColumn: boolean;
  onSlotClick: (date: Date, hour: number) => void;
  onAppointmentClick: (appointment: Appointment, event: React.MouseEvent<HTMLDivElement>) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  appointments,
  blockedTimes,
  viewMode,
  isLastColumn,
  onSlotClick,
  onAppointmentClick
}) => {
  const { processTimeSlots, calculateAppointmentLayouts } = useScheduler(appointments, blockedTimes);

  // Memoizar cálculos pesados
  const timeSlots = useMemo(() => processTimeSlots(date), [processTimeSlots, date]);
  const appointmentLayouts = useMemo(() => calculateAppointmentLayouts(date), [calculateAppointmentLayouts, date]);

  // Estado para horário atual (atualiza a cada minuto)
  const [currentTime, setCurrentTime] = useState(new Date());

  // Verificar se é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }, [date]);

  // Atualizar horário atual a cada minuto
  useEffect(() => {
    if (!isToday) return;

    const updateTime = () => setCurrentTime(new Date());
    updateTime(); // Initial update

    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [isToday]);

  // Calcular posição da linha do horário atual
  const getCurrentTimePosition = useMemo(() => {
    if (!isToday) return null;

    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Array de horas do scheduler (9-24, 1-8)
    const hours = [];
    for (let i = 9; i <= 24; i++) hours.push(i);
    for (let i = 1; i <= 8; i++) hours.push(i);

    // Encontrar índice da hora atual
    const hourIndex = hours.findIndex(hour => hour === currentHour);
    if (hourIndex === -1) return null;

    // Calcular posição Y (sem header height pois não está mais aqui)
    const slotHeight = LAYOUT_CONSTANTS.SLOT_HEIGHT; // 80px
    const pixelsPerMinute = slotHeight / 60;
    
    const topPosition = (hourIndex * slotHeight) + (currentMinutes * pixelsPerMinute);

    return {
      top: topPosition,
      time: `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`
    };
  }, [isToday, currentTime]);

  // Obter nome do dia
  const getDayName = (date: Date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()];
  };

  const handleSlotClick = (hour: number) => {
    onSlotClick(date, hour);
  };

  return (
    <div className="flex flex-1 flex-col items-start self-stretch relative" style={{ minWidth: viewMode === 'day' ? 'auto' : '200px' }}>
      {/* Slots de tempo */}
      {timeSlots.map(timeSlot => (
        <TimeSlotComponent
          key={timeSlot.hour}
          timeSlot={timeSlot}
          appointmentLayouts={appointmentLayouts}
          isLastColumn={isLastColumn}
          onClick={() => handleSlotClick(timeSlot.hour)}
          onAppointmentClick={onAppointmentClick}
        />
      ))}

      {/* Linha indicadora do horário atual */}
      {getCurrentTimePosition && (
        <div 
          className="absolute left-0 right-0 z-40 flex items-center"
          style={{ top: `${getCurrentTimePosition.top}px` }}
        >
          {/* Círculo no início */}
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          {/* Linha vermelha */}
          <div className="flex-1 h-0.5 bg-red-500"></div>
          {/* Círculo no final */}
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};