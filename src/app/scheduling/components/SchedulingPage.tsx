"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import NewAppointmentModal from "@/components/custom/NewAppointmentModal";

// Components
import { SchedulingHeader } from "./SchedulingHeader";
import { DateNavigator } from "./DateNavigator";
import { SchedulingGrid } from "./SchedulingGrid";
import { CalendarPanel } from "./CalendarPanel";

// Hooks
import { useSchedulingData } from "../hooks/useSchedulingData";
import { useSchedulingModal } from "../hooks/useSchedulingModal";
import { useAppointmentNavigation } from "../hooks/useAppointmentNavigation";
import { useAllAppointments } from "../hooks/useAllAppointments";
import { useCalendarPanel } from "../hooks/useCalendarPanel";

// Types
import { ViewMode, Appointment, BlockedTime } from "../types";

/**
 * Main scheduling page component - completely refactored with modern React patterns
 * 
 * Key improvements:
 * - Separation of concerns: Each piece of functionality is in its own component/hook
 * - Custom hooks for data fetching and modal state management
 * - Proper TypeScript typing throughout
 * - Performance optimizations with memo and useMemo
 * - Clean, maintainable code structure
 */
const SchedulingPage: React.FC = () => {
  // State management - ALL hooks MUST be declared first
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');

  // Debug logging
  console.log('SchedulingPage render - viewMode:', viewMode, 'selectedDate:', selectedDate);

  // Custom hooks for data and modal management
  // Reactivating with original parameters
  const { 
    appointments, 
    blockedTimes, 
    loading, 
    error, 
    refreshData 
  } = useSchedulingData(selectedDate, viewMode);

  // Hook for search - reactivating
  const { 
    allAppointments, 
    refreshAllAppointments 
  } = useAllAppointments();

  // Modal hooks - reactivating
  const {
    isOpen: showAppointmentModal,
    modalType,
    preSelectedDateTime,
    closeModal: originalCloseModal,
    handleSlotClick,
    handleAddClick
  } = useSchedulingModal();

  // Enhanced close modal handler to clear editing state
  const closeModal = useCallback(() => {
    originalCloseModal();
    setEditingAppointment(null);
  }, [originalCloseModal]);

  // Navigation hook - reactivating
  const { scrollContainerRef, scrollToAppointment } = useAppointmentNavigation();
  
  // Calendar panel hook - reactivating
  const { isOpen: isPanelOpen, togglePanel, closePanel } = useCalendarPanel();
  
  // Removed useEffect to prevent loops

  // Removed loading and error states to fix hooks issue
  // TODO: Re-implement loading/error states without early returns

  // Event handlers with useCallback for performance
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleAppointmentSelect = useCallback((appointment: Appointment) => {
    // Navigate to the appointment's date
    const appointmentDate = new Date(appointment.appointment_date);
    setSelectedDate(appointmentDate);
    
    // Clear search
    setSearchTerm('');
    
    // Scroll to the specific appointment in the calendar
    setTimeout(() => {
      scrollToAppointment(appointment);
    }, 300); // Small delay to ensure date change is processed
  }, [scrollToAppointment]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleProfessionalChange = useCallback((professionalId: string) => {
    setSelectedProfessional(professionalId);
  }, []);

  const handleAppointmentCreated = useCallback(() => {
    refreshData();
    refreshAllAppointments(); // Also refresh search data
    setEditingAppointment(null); // Clear editing state
  }, [refreshData, refreshAllAppointments]);

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    // TODO: Implement appointment editing functionality
    console.log('Edit appointment:', appointment);
  }, []);

  const handleBlockedTimeClick = useCallback((blockedTime: BlockedTime) => {
    // TODO: Implement blocked time editing functionality
    console.log('Edit blocked time:', blockedTime);
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    setEditingAppointment(appointment);
    handleAddClick('appointment');
  }, [handleAddClick]);

  const handleDeleteAppointment = useCallback(async (appointment: Appointment) => {
    if (window.confirm(`Are you sure you want to delete the appointment for ${appointment.patient_name}?`)) {
      try {
        const { supabase } = await import('@/lib/supabase');
        
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', appointment.id);

        if (error) {
          console.error('Error deleting appointment:', error);
          alert('Error deleting appointment. Please try again.');
          return;
        }

        // Refresh data after deletion
        refreshData();
        refreshAllAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Error deleting appointment. Please try again.');
      }
    }
  }, [refreshData, refreshAllAppointments]);

  // Filter appointments by selected professional
  const filteredAppointments = useMemo(() => {
    if (selectedProfessional === 'all') {
      return appointments;
    }
    return appointments.filter(apt => apt.professional_id === selectedProfessional);
  }, [appointments, selectedProfessional]);

  // Handle loading and error states
  if (loading && appointments.length === 0) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading scheduling data...</div>
          </div>
        </div>
      </DefaultPageLayout>
    );
  }

  if (error) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-red-600">Error loading data: {error}</div>
            <button 
              onClick={refreshData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </DefaultPageLayout>
    );
  }

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start bg-page-bg">
        {/* Header with search and actions */}
        <SchedulingHeader
          searchTerm={searchTerm}
          appointments={allAppointments} // Use all appointments for search
          onSearchChange={handleSearchChange}
          onAddClick={handleAddClick}
          onAppointmentSelect={handleAppointmentSelect}
          onCalendarToggle={togglePanel}
        />

        {/* Main scheduling area */}
        <div className="flex w-full grow shrink-0 basis-0 items-stretch bg-white">
          {/* Main calendar area - takes remaining space */}
          <div className="flex flex-1 min-w-0 flex-col items-start overflow-hidden">
            {/* Date navigation controls */}
            <DateNavigator
              selectedDate={selectedDate}
              viewMode={viewMode}
              selectedProfessional={selectedProfessional}
              onDateChange={handleDateChange}
              onViewModeChange={handleViewModeChange}
              onProfessionalChange={handleProfessionalChange}
            />

            {/* Scheduling grid */}
            <SchedulingGrid
              ref={scrollContainerRef}
              selectedDate={selectedDate}
              viewMode={viewMode}
              appointments={filteredAppointments}
              blockedTimes={blockedTimes}
              onSlotClick={handleSlotClick}
              onAppointmentClick={handleAppointmentClick}
              onBlockedTimeClick={handleBlockedTimeClick}
              onAppointmentStatusUpdate={refreshData}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={handleDeleteAppointment}
            />
          </div>
          
          {/* Calendar Panel - Re-enabled after fixing hooks issue */}
          <CalendarPanel
            isOpen={isPanelOpen}
            onClose={closePanel}
          />
        </div>
      </div>

      {/* Modal for creating/editing appointments and blocked times */}
      <NewAppointmentModal
        open={showAppointmentModal}
        onOpenChange={closeModal}
        onAppointmentCreated={handleAppointmentCreated}
        preSelectedDate={preSelectedDateTime?.date}
        preSelectedTime={preSelectedDateTime?.time}
        initialType={modalType}
        editingAppointment={editingAppointment}
      />
    </DefaultPageLayout>
  );
};

export default SchedulingPage;