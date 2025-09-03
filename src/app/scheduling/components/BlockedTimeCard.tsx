import React from 'react';
import { BlockedTime, AppointmentLayout, LAYOUT_CONSTANTS, timeUtils } from '../hooks/useScheduler';
import { useSettings } from '@/contexts/SettingsContext';

interface BlockedTimeCardProps {
  blockedTime: BlockedTime;
  layout: AppointmentLayout;
  onClick?: (blockedTime: BlockedTime) => void;
}

export const BlockedTimeCard: React.FC<BlockedTimeCardProps> = ({
  blockedTime,
  layout,
  onClick
}) => {
  const { formatTime } = useSettings();
  
  // Determinar quais informações mostrar baseado no tamanho
  const showTime = layout.widthPercentage > 30;
  const showReason = layout.height > 35;

  return (
    <div
      className="bg-neutral-200 border-l-4 border-neutral-400 px-2 py-1 text-xs absolute overflow-hidden shadow-sm relative cursor-pointer hover:bg-neutral-300 transition-colors"
      onClick={() => onClick?.(blockedTime)}
      style={{
        height: `${layout.height}px`,
        top: `${LAYOUT_CONSTANTS.SLOT_PADDING + layout.topOffset}px`,
        left: `${LAYOUT_CONSTANTS.BASE_LEFT_OFFSET + (layout.leftPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR)}%`,
        width: `${layout.widthPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR}%`,
        minHeight: `${LAYOUT_CONSTANTS.MIN_CARD_HEIGHT}px`,
        borderRadius: '4px',
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 4px,
          rgba(255, 255, 255, 0.3) 4px,
          rgba(255, 255, 255, 0.3) 8px
        )`
      }}
      title={`BLOCKED: ${blockedTime.professional_name} - ${formatTime(blockedTime.start_time)} - ${formatTime(blockedTime.end_time)} - ${blockedTime.reason || 'No reason'}`}
    >
      {/* Primeira linha: Nome do profissional + Horário */}
      <div className="flex items-center justify-between w-full mb-1">
        <div className="font-semibold text-neutral-600 truncate leading-tight text-xs flex-1 mr-1">
          {blockedTime.professional_name}
        </div>
        {showTime && (
          <div className="text-neutral-500 text-xs leading-tight whitespace-nowrap">
            {formatTime(blockedTime.start_time)} - {formatTime(blockedTime.end_time)}
          </div>
        )}
      </div>

      {/* Segunda linha: Motivo */}
      {showReason && (
        <div className="text-neutral-500 truncate text-xs leading-tight">
          {blockedTime.reason || 'Blocked'}
        </div>
      )}

      {/* Indicador de bloqueio */}
      <div className="absolute top-1 right-1">
        <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
      </div>
    </div>
  );
};