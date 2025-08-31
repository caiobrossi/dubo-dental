import { useState, useEffect, useMemo } from 'react';
import { isToday } from '../utils/dateUtils';

/**
 * Hook para calcular a posição da linha indicadora do horário atual
 */
export const useCurrentTimePosition = (date: Date) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualiza o tempo atual a cada minuto
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date());
    };

    // Atualizar imediatamente
    updateCurrentTime();

    // Atualizar a cada minuto
    const interval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Calcular a posição da linha do tempo atual
  const timeIndicatorPosition = useMemo(() => {
    if (!isToday(date)) {
      return null; // Não mostrar indicador se não for hoje
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Verificar se está dentro do horário de funcionamento
    // Fixo: 24h deve ser tratado como 0h do próximo dia
    const isInBusinessHours = 
      (hours >= 9 && hours <= 23) || (hours >= 1 && hours <= 8) || hours === 0;

    if (!isInBusinessHours) {
      return null;
    }

    // Calcular a posição baseada nos minutos dentro da hora
    // Cada slot tem 80px de altura (h-20 = 5rem = 80px)
    const slotHeight = 80;
    const minutePercentage = minutes / 60;
    
    // Encontrar o índice do slot baseado na hora
    let slotIndex;
    if (hours >= 9 && hours <= 20) {
      // Horário normal: 9h às 20h (slots 0-11)
      slotIndex = hours - 9;
    } else if (hours >= 21 && hours <= 23) {
      // Horário tardio: 21h às 23h (slots 12-14)
      slotIndex = (hours - 21) + 12;
    } else if (hours === 0) {
      // Meia-noite: 0h (slot 15, equivalente a 24h)
      slotIndex = 15; // 12 slots (9h-20h) + 4 slots (21h-0h)
    } else {
      // Horário madrugada: 1h às 8h (slots 16-23)
      slotIndex = (hours - 1) + 16;
    }

    // Posição Y da linha
    const topPosition = (slotIndex * slotHeight) + (minutePercentage * slotHeight);
    
    return {
      top: topPosition,
      hour: hours,
      minute: minutes,
      timeString: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    };
  }, [date, currentTime]);

  return timeIndicatorPosition;
};