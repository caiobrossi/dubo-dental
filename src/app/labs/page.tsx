"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase, LabOrder, Professional } from "@/lib/supabase";
import NewLabOrderModal from "@/components/custom/NewLabOrderModal";
import OrderDetailsDrawer from "@/components/custom/OrderDetailsDrawer";
import SupplierDetailsDrawer from "@/components/custom/SupplierDetailsDrawer";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherChevronDown, FeatherPlus, FeatherSearch, FeatherX } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import * as SubframeCore from "@subframe/core";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// New TanStack Table imports
import { InfiniteScrollTable } from "./components/InfiniteScrollTable";
import { useLabOrdersTableState } from "./hooks/useLabOrdersTableState";

function LabsOrder() {
  // Modal states
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [editingOrder, setEditingOrder] = useState<LabOrder | null>(null);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);

  // Data states
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');

  // Table state from custom hook
  const {
    globalFilter,
    onGlobalFilterChange,
    resetFilters,
  } = useLabOrdersTableState();

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

  // Lab order actions
  const handleEditOrder = useCallback((order: LabOrder) => {
    setEditingOrder(order);
    setShowNewOrderModal(true);
  }, []);

  const handleDeleteOrder = useCallback(async (order: LabOrder) => {
    if (!window.confirm(`Are you sure you want to delete ${order.order_name}?`)) return;

    try {
      const { error } = await supabase
        .from('lab_orders')
        .delete()
        .eq('id', order.id);

      if (error) throw error;
      
      // Refresh data is handled by the infinite scroll hook
      console.log('Lab order deleted successfully');
    } catch (error) {
      console.error('Error deleting lab order:', error);
    }
  }, []);

  const handleViewDetails = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  }, []);

  const handleOrderCreated = useCallback(() => {
    setEditingOrder(null);
    // Force refresh by reloading the page or triggering a re-fetch
    window.location.reload();
  }, []);

  const handleNewOrderModalClose = useCallback((open: boolean) => {
    setShowNewOrderModal(open);
    if (!open) {
      setEditingOrder(null);
    }
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
              Lab Orders
            </span>
          </div>
          
          <Button
            disabled={false}
            variant="brand-primary"
            size="large"
            icon={<FeatherPlus />}
            iconRight={null}
            loading={false}
            onClick={() => setShowNewOrderModal(true)}
          >
            Create new order
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
                placeholder="Search lab orders by name, patient, or lab..."
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
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onViewDetails={handleViewDetails}
              professionalFilter={selectedProfessional}
              searchFilter={globalFilter}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Modals and Drawers */}
      <NewLabOrderModal
        open={showNewOrderModal}
        onOpenChange={handleNewOrderModalClose}
        onLabOrderCreated={handleOrderCreated}
        editingOrder={editingOrder}
      />

      <OrderDetailsDrawer
        open={showOrderDetails}
        onOpenChange={setShowOrderDetails}
        orderId={selectedOrderId}
      />

      <SupplierDetailsDrawer
        open={showSupplierDetails}
        onOpenChange={setShowSupplierDetails}
        supplierId={selectedSupplierId}
      />
    </DefaultPageLayout>
  );
}

export default LabsOrder;