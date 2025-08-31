import { useState, useCallback } from 'react';
import { AppointmentModalType, PreSelectedDateTime } from '../types';

/**
 * Custom hook for managing scheduling modal state
 */
export const useSchedulingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<AppointmentModalType>('appointment');
  const [preSelectedDateTime, setPreSelectedDateTime] = useState<PreSelectedDateTime | null>(null);

  /**
   * Open modal with specific type and optional pre-selected date/time
   */
  const openModal = useCallback((
    type: AppointmentModalType, 
    dateTime?: PreSelectedDateTime
  ) => {
    setModalType(type);
    setPreSelectedDateTime(dateTime || null);
    setIsOpen(true);
  }, []);

  /**
   * Close modal and reset state
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setPreSelectedDateTime(null);
  }, []);

  /**
   * Handle slot click to create appointment
   */
  const handleSlotClick = useCallback((date: Date, hour: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    openModal('appointment', { date, time: timeString });
  }, [openModal]);

  /**
   * Handle add button click
   */
  const handleAddClick = useCallback((type: AppointmentModalType) => {
    openModal(type);
  }, [openModal]);

  return {
    isOpen,
    modalType,
    preSelectedDateTime,
    openModal,
    closeModal,
    handleSlotClick,
    handleAddClick
  };
};