import React from 'react';
import { Appointment, AppointmentLayout, LAYOUT_CONSTANTS, timeUtils, AppointmentStatus } from '../hooks/useScheduler';

// Configuração de cores para cada status
const getStatusColors = (status: AppointmentStatus) => {
  switch (status) {
    case 'scheduled':
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-500',
        textPrimary: 'text-blue-800',
        textSecondary: 'text-blue-600',
        hover: 'hover:bg-blue-200'
      };
    case 'confirmed':
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        textPrimary: 'text-green-800',
        textSecondary: 'text-green-600',
        hover: 'hover:bg-green-200'
      };
    case 'cancelled':
      return {
        bg: 'bg-red-100',
        border: 'border-red-500',
        textPrimary: 'text-red-800',
        textSecondary: 'text-red-600',
        hover: 'hover:bg-red-200'
      };
    case 'no-show':
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-500',
        textPrimary: 'text-gray-800',
        textSecondary: 'text-gray-600',
        hover: 'hover:bg-gray-200'
      };
    case 'waiting':
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-500',
        textPrimary: 'text-yellow-800',
        textSecondary: 'text-yellow-600',
        hover: 'hover:bg-yellow-200'
      };
    case 'in-progress':
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-500',
        textPrimary: 'text-purple-800',
        textSecondary: 'text-purple-600',
        hover: 'hover:bg-purple-200'
      };
    case 'complete':
      return {
        bg: 'bg-emerald-100',
        border: 'border-emerald-500',
        textPrimary: 'text-emerald-800',
        textSecondary: 'text-emerald-600',
        hover: 'hover:bg-emerald-200'
      };
    default:
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-500',
        textPrimary: 'text-blue-800',
        textSecondary: 'text-blue-600',
        hover: 'hover:bg-blue-200'
      };
  }
};

interface AppointmentCardProps {
  appointment: Appointment;
  layout: AppointmentLayout;
  onClick: (appointment: Appointment, event: React.MouseEvent<HTMLDivElement>) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  layout,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick(appointment, e);
  };

  // Função para capitalizar nomes
  const capitalizeName = (name: string): string => {
    if (!name) return name;
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  };

  // Determinar quais informações mostrar baseado no tamanho
  const showTime = layout.widthPercentage > 30; // Sempre mostrar horário se possível
  const showProcedure = layout.height > 35 && layout.widthPercentage > 50;

  // Obter cores baseado no status
  const colors = getStatusColors(appointment.status || 'scheduled');
  
  // Sistema de cores funcionando corretamente

  // Calculate adjusted width and left position for side-by-side appointments
  const hasOverlap = layout.widthPercentage < 100;
  const adjustedWidth = hasOverlap 
    ? `calc(${layout.widthPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR}% - ${LAYOUT_CONSTANTS.CARD_GAP}px)`
    : `${layout.widthPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR}%`;
  
  const adjustedLeft = hasOverlap
    ? `calc(${LAYOUT_CONSTANTS.BASE_LEFT_OFFSET + (layout.leftPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR)}% + ${layout.leftPercentage > 0 ? LAYOUT_CONSTANTS.CARD_GAP / 2 : 0}px)`
    : `${LAYOUT_CONSTANTS.BASE_LEFT_OFFSET + (layout.leftPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR)}%`;

  return (
    <div
      data-appointment-id={appointment.id}
      className={`${colors.bg} border-l-4 ${colors.border} px-2 py-1 text-xs absolute overflow-hidden shadow-sm cursor-pointer ${colors.hover} transition-all duration-200`}
      style={{
        height: `${layout.height}px`,
        top: `${LAYOUT_CONSTANTS.SLOT_PADDING + layout.topOffset}px`,
        left: adjustedLeft,
        width: adjustedWidth,
        minHeight: `${LAYOUT_CONSTANTS.MIN_CARD_HEIGHT}px`,
        borderRadius: '4px',
        boxSizing: 'border-box',
        zIndex: 20 // Ensure multi-hour appointments appear above other slots
      }}
      onClick={handleClick}
      title={`${appointment.patient_name ? capitalizeName(appointment.patient_name) : 'No name'} - ${timeUtils.formatTimeWithoutSeconds(appointment.start_time)} - ${timeUtils.formatTimeWithoutSeconds(appointment.end_time)} - ${appointment.status?.toUpperCase()}`}
    >
      {/* Primeira linha: Nome do paciente + Horário */}
      <div className="flex items-center justify-between w-full mb-1">
        <div className={`font-semibold ${colors.textPrimary} truncate leading-tight text-xs flex-1 mr-1`}>
          {appointment.patient_name ? capitalizeName(appointment.patient_name) : 'No name'}
        </div>
        {showTime && (
          <div className={`${colors.textSecondary} text-xs leading-tight whitespace-nowrap`}>
            {timeUtils.formatTimeWithoutSeconds(appointment.start_time)} - {timeUtils.formatTimeWithoutSeconds(appointment.end_time)}
          </div>
        )}
      </div>

      {/* Segunda linha: Procedimentos */}
      {showProcedure && (
        <div className={`${colors.textSecondary} truncate text-xs leading-tight`}>
          {appointment.appointment_type || appointment.notes || 'Consulta'}
        </div>
      )}
    </div>
  );
};