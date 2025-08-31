import React, { memo } from 'react';

interface CurrentTimeIndicatorProps {
  position: {
    top: number;
    timeString: string;
  };
}

/**
 * Linha vermelha que indica o horário atual no calendário
 */
export const CurrentTimeIndicator = memo<CurrentTimeIndicatorProps>(({ position }) => {
  return (
    <div 
      className="absolute left-0 right-0 z-50 flex items-center pointer-events-none"
      style={{ top: `${position.top}px` }}
    >
      {/* Bolinha esquerda */}
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      
      {/* Linha vermelha fina */}
      <div className="flex-1 h-0.5 bg-red-500"></div>
      
      {/* Bolinha direita */}
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    </div>
  );
});