"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/ui/components/Button";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import AddPatientModal from "@/components/custom/AddPatientModal";
import AddToGroupModal from "@/components/custom/AddToGroupModal";
import { FeatherChevronDown, FeatherPlus, FeatherSearch, FeatherX } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import * as SubframeCore from "@subframe/core";
import { supabase, Patient, Professional } from "@/lib/supabase";
import { useToast } from "../../contexts/ToastContext";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// New TanStack Table imports
import { InfiniteScrollTable } from "./components/InfiniteScrollTable";
import { usePatientsTableState } from "./hooks/usePatientsTableState";
import { DropdownMenu } from "@/ui/components/DropdownMenu";

function PatientListing() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatientForGroup, setSelectedPatientForGroup] = useState<Patient | null>(null);

  // Data states
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');

  // Table state from custom hook
  const {
    globalFilter,
    onGlobalFilterChange,
    resetFilters,
  } = usePatientsTableState();


  // Toast and router
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  // Load data functions

  const loadProfessionals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, specialty')
        .order('name', { ascending: true });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
    }
  }, []);

  // Effects
  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  // Patient actions
  const handleEditPatient = useCallback((patient: Patient) => {
    setEditingPatient(patient);
    setModalOpen(true);
  }, []);

  const handleDeletePatient = useCallback(async (patient: Patient) => {
    if (!window.confirm(`Are you sure you want to delete ${patient.name}?`)) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patient.id);

      if (error) throw error;
      
      showSuccess('Patient deleted successfully');
    } catch (error) {
      console.error('Error deleting patient:', error);
      showError('Failed to delete patient');
    }
  }, [showSuccess, showError]);

  const handlePatientCreated = useCallback(() => {
    setEditingPatient(null);
  }, []);

  const handleModalClose = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingPatient(null);
    }
  }, []);

  const handleAddToGroup = useCallback((patient: Patient) => {
    setSelectedPatientForGroup(patient);
    setAddToGroupModalOpen(true);
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onGlobalFilterChange(event.target.value);
  }, [onGlobalFilterChange]);

  const handleClearSearch = useCallback(() => {
    onGlobalFilterChange('');
  }, [onGlobalFilterChange]);

  // Memoized professional display name
  const professionalDisplayName = useMemo(() => {
    if (selectedProfessional === 'all') return 'All professionals';
    return professionals.find(p => p.id === selectedProfessional)?.name || 'All professionals';
  }, [selectedProfessional, professionals]);

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 bg-default-background shadow-md pb-3">
        {/* Header */}
        <div className="flex h-auto w-full flex-none items-center justify-between px-8 py-2 mobile:container mobile:max-w-none">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Patients
            </span>
          </div>
          
          <SegmentControl className="h-10 w-auto flex-none" variant="default">
            <SegmentControl.Item active={true}>
              Patient listing
            </SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/patient-groups')}
            >
              Patient groups
            </SegmentControl.Item>
          </SegmentControl>
          
          <Button
            disabled={false}
            variant="brand-primary"
            size="large"
            icon={<FeatherPlus />}
            iconRight={null}
            loading={false}
            onClick={() => setModalOpen(true)}
          >
            Create new patient
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex w-full flex-wrap items-center justify-between px-8 pb-4">
          <div className="flex items-center gap-4">
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  variant="neutral-secondary"
                  size="large"
                  iconRight={<FeatherChevronDown />}
                >
                  {professionalDisplayName}
                </Button>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem
                      onClick={() => setSelectedProfessional('all')}
                    >
                      All professionals
                    </DropdownMenu.DropdownItem>
                    {professionals.map((professional) => (
                      <DropdownMenu.DropdownItem
                        key={professional.id}
                        onClick={() => setSelectedProfessional(professional.id)}
                      >
                        {professional.name}
                      </DropdownMenu.DropdownItem>
                    ))}
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
            
          </div>
          
          {/* Search */}
          <div className="relative">
            <TextField
              className="h-10 w-96 flex-none [&>div]:rounded-full [&>div]:bg-neutral-100 [&>div]:hover:bg-neutral-200 [&>div]:transition-colors [&>div]:border-0 [&>div]:shadow-none [&>div:focus-within]:!bg-white [&>div:focus-within]:ring-0 [&>div:focus-within]:outline-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
              iconRight={globalFilter ? (
                <IconButton
                  variant="neutral-tertiary"
                  size="small"
                  icon={<FeatherX />}
                  onClick={handleClearSearch}
                />
              ) : null}
            >
              <TextField.Input
                className="rounded-full bg-transparent border-0 focus:outline-none focus:ring-0"
                placeholder="Search patients by name, email, phone, or ID..."
                value={globalFilter}
                onChange={handleSearchChange}
              />
            </TextField>
          </div>
        </div>
        
        {/* Table */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-stretch gap-2 rounded-lg bg-default-background px-8 pb-6 overflow-auto">
          <ErrorBoundary>
            <InfiniteScrollTable
              professionals={professionals}
              onEditPatient={handleEditPatient}
              onDeletePatient={handleDeletePatient}
              professionalFilter={selectedProfessional}
              searchFilter={globalFilter}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Modals */}
      <AddPatientModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onPatientAdded={handlePatientCreated}
        editingPatient={editingPatient}
      />

      <AddToGroupModal
        open={addToGroupModalOpen}
        onOpenChange={setAddToGroupModalOpen}
        patient={selectedPatientForGroup}
      />
    </DefaultPageLayout>
  );
}

export default PatientListing;