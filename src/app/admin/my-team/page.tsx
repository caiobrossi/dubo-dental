"use client";

import React, { useState, useCallback } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherPlus, FeatherSearch, FeatherX } from "@subframe/core";
import { useRouter } from "next/navigation";
import { IconButton } from "@/ui/components/IconButton";
import AddProfessionalModal from "@/components/custom/AddProfessionalModal";
import { Professional } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// New TanStack Table imports
import { InfiniteScrollTable } from "./components/InfiniteScrollTable";
import { useProfessionalsTableState } from "./hooks/useProfessionalsTableState";
import { supabase } from "@/lib/supabase";

function MyTeam() {
  const router = useRouter();
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  // Table state from custom hook
  const {
    globalFilter,
    onGlobalFilterChange,
    resetFilters,
  } = useProfessionalsTableState();

  // Toast
  const { showSuccess, showError } = useToast();

  // Professional actions
  const handleEditProfessional = useCallback((professional: Professional) => {
    setEditingProfessional(professional);
    setModalOpen(true);
  }, []);

  const handleDeleteProfessional = useCallback(async (professional: Professional) => {
    if (!window.confirm(`Are you sure you want to delete ${professional.name}?`)) return;

    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', professional.id);

      if (error) throw error;
      
      showSuccess('Professional deleted successfully');
    } catch (error) {
      console.error('Error deleting professional:', error);
      showError('Failed to delete professional');
    }
  }, [showSuccess, showError]);

  const handleProfessionalCreated = useCallback(() => {
    setEditingProfessional(null);
  }, []);

  const handleModalClose = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingProfessional(null);
    }
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onGlobalFilterChange(event.target.value);
  }, [onGlobalFilterChange]);

  const handleClearSearch = useCallback(() => {
    onGlobalFilterChange('');
  }, [onGlobalFilterChange]);

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 bg-default-background shadow-md pb-3">
        {/* Fixed Header */}
        <div className="flex w-full flex-col items-center bg-white/80 backdrop-blur-md px-8 py-3 border-b border-neutral-border/50">
          <div className="flex w-full items-start justify-between px-2 py-2">
            <div className="flex items-center gap-4">
              <Avatar
                size="large"
                image="https://res.cloudinary.com/subframe/image/upload/v1711417549/shared/jtjkdxvy1mm2ozvaymwv.png"
              >
                A
              </Avatar>
              <span className="text-heading-1 font-heading-1 text-default-font">
                Clinic Up
              </span>
            </div>
            <Button
              disabled={false}
              variant="brand-primary"
              size="large"
              icon={<FeatherPlus />}
              iconRight={null}
              loading={false}
              onClick={() => setModalOpen(true)}
            >
              Add Team Member
            </Button>
          </div>
          <SegmentControl
            className="h-10 w-auto flex-none"
            variant="default"
            variant2="default"
          >
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin')}
            >
              Clinic Info
            </SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin/chairs-rooms')}
            >
              Chairs and Rooms
            </SegmentControl.Item>
            <SegmentControl.Item active={true}>My team</SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin/schedule-shifts')}
            >
              Schedule shifts
            </SegmentControl.Item>
            <SegmentControl.Item active={false}>Team payment</SegmentControl.Item>
            <SegmentControl.Item active={false}>Finance</SegmentControl.Item>
          </SegmentControl>
        </div>
        
        {/* Search */}
        <div className="flex w-full items-center justify-end px-8">
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
                placeholder="Search professionals by name, email, phone, or specialty..."
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
              onEditProfessional={handleEditProfessional}
              onDeleteProfessional={handleDeleteProfessional}
              searchFilter={globalFilter}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Modal */}
      <AddProfessionalModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onProfessionalAdded={handleProfessionalCreated}
        editingProfessional={editingProfessional}
      />
    </DefaultPageLayout>
  );
}

export default MyTeam;