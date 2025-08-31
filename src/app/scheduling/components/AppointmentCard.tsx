import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Appointment, AppointmentLayout, LAYOUT_CONSTANTS, timeUtils, AppointmentStatus } from '../hooks/useScheduler';

// Configuração avançada de cores e estilos para cada status
const getStatusStyles = (status: AppointmentStatus) => {
  switch (status) {
    case 'scheduled':
      return {
        bg: 'bg-blue-50',
        border: 'border-l-4 border-blue-400',
        textPrimary: 'text-blue-900',
        textSecondary: 'text-blue-700',
        hover: 'hover:bg-blue-100',
        shadow: 'shadow-blue-100',
        accent: 'bg-blue-400',
        pattern: 'solid'
      };
    case 'confirmed':
      return {
        bg: 'bg-green-50',
        border: 'border-l-4 border-green-500',
        textPrimary: 'text-green-900',
        textSecondary: 'text-green-700',
        hover: 'hover:bg-green-100',
        shadow: 'shadow-green-100',
        accent: 'bg-green-500',
        pattern: 'solid'
      };
    case 'cancelled':
      return {
        bg: 'bg-red-50',
        border: 'border-l-4 border-red-500',
        textPrimary: 'text-red-900 line-through',
        textSecondary: 'text-red-700',
        hover: 'hover:bg-red-100',
        shadow: 'shadow-red-100',
        accent: 'bg-red-500',
        pattern: 'strikethrough'
      };
    case 'no-show':
      return {
        bg: 'bg-gray-200',
        border: 'border-l-4 border-gray-600',
        textPrimary: 'text-gray-800',
        textSecondary: 'text-gray-700',
        hover: 'hover:bg-gray-300',
        shadow: 'shadow-gray-200',
        accent: 'bg-gray-600',
        pattern: 'dotted'
      };
    case 'waiting':
      return {
        bg: 'bg-orange-50',
        border: 'border-l-4 border-orange-500',
        textPrimary: 'text-orange-900',
        textSecondary: 'text-orange-700',
        hover: 'hover:bg-orange-100',
        shadow: 'shadow-orange-100',
        accent: 'bg-orange-500',
        pattern: 'pulse'
      };
    case 'in-progress':
      return {
        bg: 'bg-purple-50',
        border: 'border-l-4 border-purple-500',
        textPrimary: 'text-purple-900 font-semibold',
        textSecondary: 'text-purple-700',
        hover: 'hover:bg-purple-100',
        shadow: 'shadow-purple-100',
        accent: 'bg-purple-500',
        pattern: 'gradient'
      };
    case 'complete':
      return {
        bg: 'bg-white',
        border: 'border-l-4 border-gray-500',
        textPrimary: 'text-neutral-900',
        textSecondary: 'text-neutral-600',
        hover: 'hover:bg-neutral-50',
        shadow: 'shadow-sm',
        accent: 'bg-gray-500',
        pattern: 'checkmark'
      };
    default:
      return {
        bg: 'bg-slate-50',
        border: 'border-l-4 border-slate-400',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        hover: 'hover:bg-slate-100',
        shadow: 'shadow-slate-100',
        accent: 'bg-slate-400',
        pattern: 'solid'
      };
  }
};

// Componente para indicadores visuais especiais
const StatusIndicator: React.FC<{ status: AppointmentStatus, styles: any }> = ({ status, styles }) => {
  // Sem indicadores visuais especiais
  return null;
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: appointment.id,
  });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger click when dragging
    if (isDragging) return;
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
  // Priorizar nome do paciente quando o espaço for limitado
  const showTime = layout.widthPercentage > 50; // Só mostrar horário quando houver espaço suficiente
  const showProcedure = layout.height > 35 && layout.widthPercentage > 50;

  // Obter estilos baseado no status
  const styles = getStatusStyles(appointment.status || 'scheduled');
  
  // Debug logging for multi-hour appointments
  if (layout.height > 80) {
    console.log(`🎨 AppointmentCard rendering:`, {
      patientName: appointment.patient_name,
      timeRange: `${appointment.start_time} - ${appointment.end_time}`,
      layoutHeight: layout.height,
      topOffset: layout.topOffset,
      slotHeight: 80,
      calculatedStyle: {
        height: `${layout.height}px`,
        top: `${LAYOUT_CONSTANTS.SLOT_PADDING + layout.topOffset}px`
      }
    });
  }

  // Calculate adjusted width and left position for side-by-side appointments
  const hasOverlap = layout.widthPercentage < 100;
  const adjustedWidth = hasOverlap 
    ? `calc(${layout.widthPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR}% - ${LAYOUT_CONSTANTS.CARD_GAP}px)`
    : `${layout.widthPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR}%`;
  
  const adjustedLeft = hasOverlap
    ? `calc(${LAYOUT_CONSTANTS.BASE_LEFT_OFFSET + (layout.leftPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR)}% + ${layout.leftPercentage > 0 ? LAYOUT_CONSTANTS.CARD_GAP / 2 : 0}px)`
    : `${LAYOUT_CONSTANTS.BASE_LEFT_OFFSET + (layout.leftPercentage * LAYOUT_CONSTANTS.CARD_WIDTH_FACTOR)}%`;

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    height: `${layout.height}px`,
    top: `${LAYOUT_CONSTANTS.SLOT_PADDING + layout.topOffset}px`,
    left: adjustedLeft,
    width: adjustedWidth,
    minHeight: `${LAYOUT_CONSTANTS.MIN_CARD_HEIGHT}px`,
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
    zIndex: isDragging ? 50 : (layout.height > 80 ? 30 : 10), // Higher z-index for multi-hour appointments
    opacity: isDragging ? 0.5 : 1
  } : {
    height: `${layout.height}px`,
    top: `${LAYOUT_CONSTANTS.SLOT_PADDING + layout.topOffset}px`,
    left: adjustedLeft,
    width: adjustedWidth,
    minHeight: `${LAYOUT_CONSTANTS.MIN_CARD_HEIGHT}px`,
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
    zIndex: layout.height > 80 ? 30 : 10 // Higher z-index for multi-hour appointments
  };

  return (
    <div
      ref={setNodeRef}
      data-appointment-id={appointment.id}
      className={`${styles.bg} ${styles.border} px-2 py-1 text-xs absolute shadow-sm cursor-pointer ${styles.hover} transition-all duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={style}
      onClick={handleClick}
      title={`${appointment.patient_name ? capitalizeName(appointment.patient_name) : 'No name'} - ${timeUtils.formatTimeWithoutSeconds(appointment.start_time)} - ${timeUtils.formatTimeWithoutSeconds(appointment.end_time)} - ${appointment.status?.toUpperCase()}`}
      {...attributes}
      {...listeners}
    >
      {/* Status indicator overlay */}
      <StatusIndicator status={appointment.status || 'scheduled'} styles={styles} />
      
      {/* Layout adaptativo baseado no espaço disponível */}
      {showTime ? (
        <>
          {/* Layout normal: Nome + Horário na mesma linha */}
          <div className="flex items-center justify-between w-full mb-1">
            <div className={`font-semibold ${styles.textPrimary} truncate leading-tight text-xs flex-1 mr-1`}>
              {appointment.patient_name ? capitalizeName(appointment.patient_name) : 'No name'}
            </div>
            <div className={`${styles.textSecondary} text-xs leading-tight whitespace-nowrap`}>
              {timeUtils.formatTimeWithoutSeconds(appointment.start_time)} - {timeUtils.formatTimeWithoutSeconds(appointment.end_time)}
            </div>
          </div>
          {/* Segunda linha: Procedimentos */}
          {showProcedure && (
            <div className={`${styles.textSecondary} truncate text-xs leading-tight`}>
              {appointment.appointment_type || appointment.notes || 'Consulta'}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Layout compacto: Apenas nome do paciente (prioridade) */}
          <div className={`font-semibold ${styles.textPrimary} truncate leading-tight text-xs w-full`}>
            {appointment.patient_name ? capitalizeName(appointment.patient_name) : 'No name'}
          </div>
          {/* Se houver espaço vertical, mostrar o horário abaixo */}
          {layout.height > 30 && (
            <div className={`${styles.textSecondary} text-xs leading-tight truncate mt-0.5`}>
              {timeUtils.formatTimeWithoutSeconds(appointment.start_time)}
            </div>
          )}
        </>
      )}
    </div>
  );
};