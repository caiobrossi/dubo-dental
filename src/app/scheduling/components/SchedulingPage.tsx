"use client";

import React, { useState, useCallback } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import NewAppointmentModal from "@/components/custom/NewAppointmentModal";

// Components
import { SchedulingHeader } from "./SchedulingHeader";
import { DateNavigator } from "./DateNavigator";
import { SchedulingGrid } from "./SchedulingGrid";

// Hooks
import { useSchedulingData } from "../hooks/useSchedulingData";
import { useSchedulingModal } from "../hooks/useSchedulingModal";

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
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Custom hooks for data and modal management
  const { 
    appointments, 
    blockedTimes, 
    loading, 
    error, 
    refreshData 
  } = useSchedulingData(selectedDate, viewMode);

  const {
    isOpen: showAppointmentModal,
    modalType,
    preSelectedDateTime,
    closeModal,
    handleSlotClick,
    handleAddClick
  } = useSchedulingModal();

  // Event handlers with useCallback for performance
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleAppointmentCreated = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    // TODO: Implement appointment editing functionality
    console.log('Edit appointment:', appointment);
  }, []);

  const handleBlockedTimeClick = useCallback((blockedTime: BlockedTime) => {
    // TODO: Implement blocked time editing functionality
    console.log('Edit blocked time:', blockedTime);
  }, []);

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
          onSearchChange={handleSearchChange}
          onAddClick={handleAddClick}
        />

        {/* Main scheduling area */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start bg-white overflow-auto">
          {/* Controls row - now consolidated into DateNavigator */}
          <DateNavigator
            selectedDate={selectedDate}
            viewMode={viewMode}
            onDateChange={handleDateChange}
            onViewModeChange={handleViewModeChange}
          />

          {/* Scheduling grid */}
          <SchedulingGrid
            selectedDate={selectedDate}
            viewMode={viewMode}
            appointments={appointments}
            blockedTimes={blockedTimes}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
            onBlockedTimeClick={handleBlockedTimeClick}
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
      />
    </DefaultPageLayout>
  );
};

export default SchedulingPage;