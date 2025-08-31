"use client";

import React, { useState, useEffect, useRef } from "react";
import { FeatherCommand } from "@subframe/core";
import { FeatherMoreVertical } from "@subframe/core";
import { FeatherNotebookPen } from "@subframe/core";
import { FeatherPhone } from "@subframe/core";
import { FeatherRepeat } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherEdit3 } from "@subframe/core";
import { FeatherTrash2 } from "@subframe/core";
import * as SubframeUtils from "../../ui/utils";
import * as SubframeCore from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { Appointment, AppointmentStatus } from "@/app/scheduling/hooks/useScheduler";
import { supabase } from "@/lib/supabase";
import { formatPatientNameForDisplay } from "@/app/scheduling/utils/nameUtils";

// Função para obter a cor do status para o status bar
const getStatusVariant = (status: AppointmentStatus): "default" | "booked" | "cancelled" | "variation" | "waiting" | "in-progress" | "no-show" | "complete" => {
  switch (status) {
    case 'scheduled':
      return 'booked'; // bg-brand-600 (azul)
    case 'confirmed':
      return 'default'; // bg-success-600 (verde)
    case 'cancelled':
      return 'cancelled'; // bg-error-600 (vermelho)
    case 'no-show':
      return 'no-show'; // bg-gray-600 (cinza)
    case 'waiting':
      return 'waiting'; // bg-yellow-600 (amarelo)
    case 'in-progress':
      return 'in-progress'; // bg-purple-600 (roxo)
    case 'complete':
      return 'complete'; // bg-emerald-600 (verde esmeralda)
    default:
      return 'booked';
  }
};

// Labels amigáveis para cada status
const getStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'confirmed':
      return 'Confirmed';
    case 'cancelled':
      return 'Cancelled';
    case 'no-show':
      return 'No Show';
    case 'waiting':
      return 'Waiting';
    case 'in-progress':
      return 'In Progress';
    case 'complete':
      return 'Complete';
    default:
      return 'Scheduled';
  }
};

interface PatientData {
  mobile?: string;
  alternative_phone?: string;
}

interface AppointmentStatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  timeSlot?: React.ReactNode;
  select?: React.ReactNode;
  variant?: "default" | "booked" | "cancelled" | "variation" | "waiting" | "in-progress" | "no-show" | "complete";
  className?: string;
}

const AppointmentStatusBar = React.forwardRef<HTMLDivElement, AppointmentStatusBarProps>(
  function AppointmentStatusBar(
    {
      timeSlot,
      select,
      variant = "default",
      className,
      ...otherProps
    }: AppointmentStatusBarProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/7eb2f251 flex w-full items-center justify-between rounded-md bg-success-600 pl-4 pr-2",
          {
            "bg-error-600": variant === "variation" || variant === "cancelled",
            "bg-brand-600": variant === "booked",
            "bg-yellow-600": variant === "waiting",
            "bg-purple-600": variant === "in-progress", 
            "bg-gray-600": variant === "no-show",
            "bg-emerald-600": variant === "complete",
            "bg-success-600": variant === "default",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {timeSlot ? (
          <span className="text-body-medium font-body-medium text-white">
            {timeSlot}
          </span>
        ) : null}
        {select ? (
          <div className="flex items-center justify-between">{select}</div>
        ) : null}
      </div>
    );
  }
);

interface AppointmentPopoverProps {
  appointment: Appointment;
  position: { x: number; y: number } | null;
  onClose: () => void;
  popoverRef?: React.RefObject<HTMLDivElement>;
  onSelectOpen?: (open: boolean) => void;
  onStatusUpdate?: (appointmentId: string, newStatus: string) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (appointment: Appointment) => void;
}

export const AppointmentPopover: React.FC<AppointmentPopoverProps> = ({
  appointment,
  position,
  onClose,
  popoverRef,
  onSelectOpen,
  onStatusUpdate,
  onEditAppointment,
  onDeleteAppointment
}) => {
  
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus>(appointment.status || 'scheduled');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (appointment.patient_id) {
        try {
          const { data, error } = await supabase
            .from('patients')
            .select('mobile, alternative_phone')
            .eq('id', appointment.patient_id)
            .single();
          
          if (error) {
            console.error('Error fetching patient data:', error);
          } else {
            setPatientData(data);
          }
        } catch (error) {
          console.error('Error fetching patient data:', error);
        }
      }
    };

    if (position) {
      fetchPatientData();
    }
  }, [appointment.patient_id, position]);

  if (!position) return null;

  // Removed capitalizeName function - now using centralized utility

  const formatTime = (time: string): string => {
    return time.substring(0, 5);
  };

  // Função para atualizar status do appointment
  const handleStatusChange = async (newStatus: string) => {
    try {
      
      // Atualizar estado local imediatamente para UI responsiva
      setCurrentStatus(newStatus as AppointmentStatus);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id)
        .select('id, status');

      if (error) {
        console.error('Error updating appointment status:', error);
        // Reverter estado local em caso de erro
        setCurrentStatus(appointment.status || 'scheduled');
      } else {
        // Callback para atualizar a UI com mudança imediata
        onStatusUpdate?.(appointment.id, newStatus);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Reverter estado local em caso de erro
      setCurrentStatus(appointment.status || 'scheduled');
    }
  };

  // Handle menu toggle
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Prevent popover from closing when Select is being used
  const handleSelectOpenChange = (open: boolean) => {
    if (onSelectOpen) {
      onSelectOpen(open);
    }
  };

  // Handle actions
  const handleEditClick = () => {
    setShowMenu(false);
    onEditAppointment?.(appointment);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    onDeleteAppointment?.(appointment);
    onClose();
  };

  return (
    <>
      {/* Popover card - exact design from SchedulingCardDetails */}
      <div 
        ref={popoverRef}
        className="fixed z-50 flex w-80 flex-col items-start gap-2 rounded-lg bg-white/20 backdrop-blur-lg px-2 py-2 shadow-xl border border-white/30"
        style={{
          left: `${position.x + 10}px`,
          top: `${position.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <AppointmentStatusBar
          timeSlot={`${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`}
          select={
            <div onClick={(e) => e.stopPropagation()}>
              <Select 
                className="[&_button]:!bg-transparent [&_button]:!border-none [&_button:hover]:!bg-white/10 [&_span]:!text-white [&_svg]:!text-white [&>div]:!bg-transparent [&>div]:!border-none [&>div>button]:!bg-transparent [&>div>button]:!border-none [&>div>button]:!outline-none"
                label="" 
                placeholder="Status"
                helpText=""
                value={currentStatus}
                onValueChange={handleStatusChange}
                onOpenChange={handleSelectOpenChange}
              >
                <Select.Item value="scheduled">Scheduled</Select.Item>
                <Select.Item value="confirmed">Confirmed</Select.Item>
                <Select.Item value="cancelled">Cancelled</Select.Item>
                <Select.Item value="no-show">No Show</Select.Item>
                <Select.Item value="waiting">Waiting</Select.Item>
                <Select.Item value="in-progress">In Progress</Select.Item>
                <Select.Item value="complete">Complete</Select.Item>
              </Select>
            </div>
          }
          variant={getStatusVariant(currentStatus)}
        />
        
        <div className="flex w-full items-start justify-between px-2 py-2">
          <div className="flex flex-col items-start justify-end gap-1">
            <span className="text-heading-3 font-heading-3 text-default-font">
              {formatPatientNameForDisplay(appointment.patient_name)}
            </span>
            <span className="text-body-medium font-body-medium text-default-font">
              {appointment.appointment_type || 'Consulta'}
            </span>
          </div>
          <div className="relative" ref={menuRef}>
            <IconButton
              disabled={false}
              variant="neutral-secondary"
              icon={<FeatherMoreVertical />}
              loading={false}
              onClick={toggleMenu}
            />
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 flex min-w-[192px] flex-col items-start rounded-lg border border-solid border-new-gray-10 bg-new-white-70 px-2 py-2 shadow-lg backdrop-blur">
                <div 
                  onClick={handleEditClick}
                  className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 hover:bg-gray-100 transition-colors"
                >
                  <FeatherEdit3 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Edit Appointment
                  </span>
                </div>
                
                <div 
                  onClick={handleDeleteClick}
                  className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 hover:bg-red-50 transition-colors"
                >
                  <FeatherTrash2 className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    Delete Appointment
                  </span>
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        <div className="flex w-full flex-col items-start rounded-lg bg-default-background [&>div:last-child]:border-b-0">
          {/* Phone - only show if patient has phone number */}
          {(patientData?.mobile || patientData?.alternative_phone) && (
            <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-2 py-3">
              <FeatherPhone className="text-heading-3 font-heading-3 text-neutral-400" />
              <span className="text-body-medium font-body-medium text-brand-700">
                {patientData?.mobile || patientData?.alternative_phone}
              </span>
            </div>
          )}
          
          {/* Professional */}
          <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-2 py-3">
            <FeatherUser className="text-heading-3 font-heading-3 text-neutral-400" />
            <span className="text-body-medium font-body-medium text-default-font">
              {appointment.professional_name || 'Profissional não informado'}
            </span>
          </div>
          
          {/* Room placeholder - you can add room info if available */}
          <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-2 py-3">
            <FeatherCommand className="text-heading-3 font-heading-3 text-neutral-400" />
            <span className="text-body-medium font-body-medium text-default-font">
              Room 01
            </span>
          </div>
          
          {/* Notes - only show if there are notes */}
          {appointment.notes && (
            <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-2 py-3">
              <FeatherNotebookPen className="text-heading-3 font-heading-3 text-neutral-400" />
              <span className="line-clamp-2 whitespace-pre-wrap text-body-medium font-body-medium text-default-font">
                {appointment.notes}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentPopover;