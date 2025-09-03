"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import CurrencyInput from 'react-currency-input-field';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { Switch } from "@/ui/components/Switch";
import { TextField } from "@/ui/components/TextField";
import { Checkbox } from "@/ui/components/Checkbox";
import { 
  FeatherArrowLeft, 
  FeatherDownload, 
  FeatherUpload,
  FeatherPlus,
  FeatherMoreHorizontal,
  FeatherTrash,
  FeatherCopy,
  FeatherArrowUp,
  FeatherArrowDown,
  FeatherChevronDown,
  FeatherSearch,
  FeatherX
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { useProcedures } from '@/hooks/useProcedures';
import { useToast } from '@/contexts/ToastContext';

// Categories for procedures
const PROCEDURE_CATEGORIES = [
  'All',
  'Others',
  'Emergency',
  'Surgery', 
  'Prosthetics',
  'Prevention',
  'Periodontics',
  'Orthodontics',
  'Implantology',
  'Endodontics',
  'Aesthetic dentistry',
  'Lab tests and Exams',
  'Radiology',
  'Pediatric Dentistry',
  'Injectables'
] as const;

// Time options for procedures
const TIME_OPTIONS = [
  '15min', '30min', '45min', '60min', '90min', '120min', '150min', '180min'
];

interface NewProcedure {
  name: string;
  category: string;
  price: number;
  estimated_time: string;
  is_active: boolean;
}

interface ProcedureRow {
  id: string;
  name: string;
  category: string;
  price: number;
  estimated_time: string;
  is_active: boolean;
}

const INITIAL_NEW_PROCEDURE: NewProcedure = {
  name: '',
  category: 'Others',
  price: 0,
  estimated_time: '30min',
  is_active: true
};

const columnHelper = createColumnHelper<ProcedureRow>();

export default function PrivatePlanDetailedPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  
  // Get procedures data
  const {
    procedures,
    loading,
    error,
    createProcedure: addProcedure,
    updateProcedure,
    deleteProcedure,
    duplicateProcedure,
    checkNameExists,
    clearError
  } = useProcedures('0347433a-73cb-4933-83ae-16cfcd989fca'); // Private Plan ID

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [newProcedure, setNewProcedure] = useState<NewProcedure>(INITIAL_NEW_PROCEDURE);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingProcedures, setEditingProcedures] = useState<Record<string, any>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Use ref to avoid re-renders on editingProcedures changes
  const editingProceduresRef = useRef(editingProcedures);
  
  // Keep ref updated
  useEffect(() => {
    editingProceduresRef.current = editingProcedures;
  }, [editingProcedures]);

  // Handle navigation
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    router.push('/settings/insurance');
  }, [router, hasUnsavedChanges]);

  // Filter procedures based on selected category and search
  const filteredProcedures = useMemo(() => {
    let filtered = procedures;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => 
        p.category === selectedCategory || (selectedCategory === 'Others' && !p.category)
      );
    }

    // Filter by search
    if (searchFilter.trim()) {
      const searchTerm = searchFilter.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.category?.toLowerCase().includes(searchTerm) ||
        p.estimated_time?.toLowerCase().includes(searchTerm) ||
        p.price.toString().includes(searchTerm)
      );
    }

    return filtered;
  }, [procedures, selectedCategory, searchFilter]);

  // Display name for selected category
  const categoryDisplayName = useMemo(() => {
    return selectedCategory === 'All' ? 'All categories' : selectedCategory;
  }, [selectedCategory]);

  // Handle search change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  }, []);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchFilter('');
  }, []);

  // Handle adding a new procedure
  
  const handleAddProcedure = useCallback(async () => {
    if (!newProcedure.name.trim()) {
      showError('Please enter a procedure name');
      return;
    }

    if (isCreating) {
      return; // Prevent multiple simultaneous requests
    }

    try {
      setIsCreating(true);
      
      // Check if name already exists first
      const nameExists = await checkNameExists(newProcedure.name, '0347433a-73cb-4933-83ae-16cfcd989fca');
      
      if (nameExists) {
        showError('A procedure with this name already exists for this plan');
        return;
      }
      
      const result = await addProcedure({
        ...newProcedure,
        insurance_plan_id: '0347433a-73cb-4933-83ae-16cfcd989fca'
      });

      if (result) {
        setNewProcedure(INITIAL_NEW_PROCEDURE);
        setHasUnsavedChanges(false);
      } else if (error) {
        // Show the specific error from the hook
        showError(error);
      } else {
        showError('Failed to add procedure. Please try again.');
      }
    } catch (catchError) {
      console.error('Error adding procedure:', catchError);
      showError('Failed to add procedure. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [newProcedure, addProcedure, checkNameExists, error, showError, isCreating]);

  // Handle procedure field changes
  const handleProcedureChange = useCallback((procedureId: string, field: string, value: any) => {
    setEditingProcedures(prev => ({
      ...prev,
      [procedureId]: {
        ...prev[procedureId],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Get procedure value (from editing state or original)
  const getProcedureValue = useCallback((procedureId: string, field: string, defaultValue: any) => {
    // Use a ref to access current editingProcedures without causing re-renders
    const editingProcs = editingProceduresRef.current || editingProcedures;
    if (editingProcs[procedureId] && field in editingProcs[procedureId]) {
      return editingProcs[procedureId][field];
    }
    const procedure = procedures.find(p => p.id === procedureId);
    return procedure ? procedure[field] : defaultValue;
  }, [procedures]);

  // Handle save changes
  const handleSaveChanges = useCallback(async () => {
    try {
      // Save all edited procedures
      for (const [procedureId, changes] of Object.entries(editingProcedures)) {
        await updateProcedure(procedureId, changes);
      }
      
      setEditingProcedures({});
      setHasUnsavedChanges(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  }, [editingProcedures, updateProcedure]);

  // Handle procedure deletion
  const handleDelete = useCallback(async (procedureId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this procedure?');
    if (!confirmed) return;

    try {
      const result = await deleteProcedure(procedureId);
      if (result) {
        // Remove from editing state
        setEditingProcedures(prev => {
          const newEdits = { ...prev };
          delete newEdits[procedureId];
          return newEdits;
        });
      }
    } catch (error) {
      console.error('Error deleting procedure:', error);
      alert('Failed to delete procedure. Please try again.');
    }
  }, [deleteProcedure]);

  // Handle procedure duplication
  const handleDuplicate = useCallback(async (procedureId: string) => {
    try {
      await duplicateProcedure(procedureId);
    } catch (error) {
      console.error('Error duplicating procedure:', error);
      alert('Failed to duplicate procedure. Please try again.');
    }
  }, [duplicateProcedure]);

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // Parse price from input
  const parsePrice = (value: string) => {
    const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Define columns for TanStack Table
  const columns = useMemo(() => [
    columnHelper.accessor('is_active', {
      header: 'Active',
      size: 80,
      cell: ({ row }) => (
        <Switch
          checked={getProcedureValue(row.original.id, 'is_active', true)}
          onCheckedChange={(checked) => handleProcedureChange(row.original.id, 'is_active', checked)}
        />
      ),
    }),
    columnHelper.accessor('name', {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            className="flex items-center gap-1 hover:text-neutral-900"
            onClick={() => column.toggleSorting()}
          >
            Procedure
            {isSorted === 'asc' && <FeatherArrowUp className="w-3 h-3" />}
            {isSorted === 'desc' && <FeatherArrowDown className="w-3 h-3" />}
          </button>
        );
      },
      cell: ({ row }) => (
        <TextField
          variant="filled"
          className="w-full"
        >
          <TextField.Input
            id={`name-${row.original.id}`}
            key={`name-${row.original.id}`}
            value={getProcedureValue(row.original.id, 'name', '')}
            onChange={(e) => handleProcedureChange(row.original.id, 'name', e.target.value)}
          />
        </TextField>
      ),
    }),
    columnHelper.accessor('category', {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            className="flex items-center gap-1 hover:text-neutral-900"
            onClick={() => column.toggleSorting()}
          >
            Category
            {isSorted === 'asc' && <FeatherArrowUp className="w-3 h-3" />}
            {isSorted === 'desc' && <FeatherArrowDown className="w-3 h-3" />}
          </button>
        );
      },
      size: 300,
      minSize: 300,
      cell: ({ row }) => (
        <Select
          variant="filled"
          className="w-full"
          value={getProcedureValue(row.original.id, 'category', 'Others')}
          onValueChange={(value) => handleProcedureChange(row.original.id, 'category', value)}
        >
          {PROCEDURE_CATEGORIES.filter(cat => cat !== 'All').map(category => (
            <Select.Item key={category} value={category}>
              {category}
            </Select.Item>
          ))}
        </Select>
      ),
    }),
    columnHelper.accessor('price', {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            className="flex items-center gap-1 hover:text-neutral-900"
            onClick={() => column.toggleSorting()}
          >
            Price
            {isSorted === 'asc' && <FeatherArrowUp className="w-3 h-3" />}
            {isSorted === 'desc' && <FeatherArrowDown className="w-3 h-3" />}
          </button>
        );
      },
      size: 120,
      cell: ({ row }) => (
        <CurrencyInput
          id={`price-${row.original.id}`}
          key={`price-${row.original.id}`}
          placeholder="$0.00"
          defaultValue={getProcedureValue(row.original.id, 'price', 0)}
          decimalsLimit={2}
          decimalSeparator="."
          groupSeparator=","
          prefix="$"
          allowDecimals={true}
          allowNegativeValue={false}
          disableGroupSeparators={false}
          className="w-full px-3 py-2 border rounded-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onValueChange={(value) => {
            const numericValue = value ? parseFloat(value) : 0;
            handleProcedureChange(row.original.id, 'price', numericValue);
          }}
        />
      ),
    }),
    columnHelper.accessor('estimated_time', {
      header: 'Estimated time',
      size: 150,
      cell: ({ row }) => (
        <Select
          variant="filled"
          className="w-full"
          value={getProcedureValue(row.original.id, 'estimated_time', '30min')}
          onValueChange={(value) => handleProcedureChange(row.original.id, 'estimated_time', value)}
        >
          {TIME_OPTIONS.map(time => (
            <Select.Item key={time} value={time}>
              {time}
            </Select.Item>
          ))}
        </Select>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      size: 80,
      cell: ({ row }) => (
        <SubframeCore.DropdownMenu.Root>
          <SubframeCore.DropdownMenu.Trigger asChild>
            <IconButton
              variant="neutral-tertiary"
              size="small"
              icon={<FeatherMoreHorizontal />}
            />
          </SubframeCore.DropdownMenu.Trigger>
          <SubframeCore.DropdownMenu.Portal>
            <SubframeCore.DropdownMenu.Content
              side="bottom"
              align="end"
              sideOffset={4}
              asChild
            >
              <DropdownMenu>
                <DropdownMenu.DropdownItem
                  icon="FeatherCopy"
                  onClick={() => handleDuplicate(row.original.id)}
                >
                  Duplicate
                </DropdownMenu.DropdownItem>
                <DropdownMenu.DropdownItem
                  icon="FeatherTrash"
                  onClick={() => handleDelete(row.original.id)}
                >
                  Delete
                </DropdownMenu.DropdownItem>
              </DropdownMenu>
            </SubframeCore.DropdownMenu.Content>
          </SubframeCore.DropdownMenu.Portal>
        </SubframeCore.DropdownMenu.Root>
      ),
    }),
  ], [handleProcedureChange, handleDuplicate, handleDelete]);

  // Create table instance
  const table = useReactTable({
    data: filteredProcedures as ProcedureRow[],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-screen w-screen bg-default-background flex flex-col">
      {/* Header Section */}
      <div className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <IconButton
            variant="neutral-tertiary"
            size="medium"
            icon={<FeatherArrowLeft />}
            onClick={handleBack}
          />
          <h1 className="text-xl font-semibold text-neutral-900">Private plan</h1>
        </div>
        
        <Button
          variant="brand-primary"
          size="medium"
          onClick={handleSaveChanges}
          disabled={!hasUnsavedChanges}
        >
          Save changes
        </Button>
      </div>

      {/* Filter Section */}
      <div className="flex w-full flex-wrap items-center justify-between px-6 py-6 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <Button
                variant="neutral-secondary"
                size="large"
                iconRight={<FeatherChevronDown />}
              >
                {categoryDisplayName}
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
                    onClick={() => setSelectedCategory('All')}
                  >
                    All categories
                  </DropdownMenu.DropdownItem>
                  {PROCEDURE_CATEGORIES.filter(cat => cat !== 'All').map((category) => (
                    <DropdownMenu.DropdownItem
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </DropdownMenu.DropdownItem>
                  ))}
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="neutral-secondary"
            size="large"
            icon={<FeatherDownload />}
            onClick={() => alert('Export functionality coming soon')}
          >
            Export as
          </Button>
          <Button
            variant="neutral-secondary"
            size="large"
            icon={<FeatherUpload />}
            onClick={() => alert('Bulk upload functionality coming soon')}
          >
            Bulk upload
          </Button>
          
          {/* Search */}
          <div className="relative">
            <TextField
              className="h-10 w-96 flex-none [&>div]:rounded-full [&>div]:bg-neutral-100 [&>div]:hover:bg-neutral-200 [&>div]:transition-colors [&>div]:border-0 [&>div]:shadow-none [&>div:focus-within]:!bg-white [&>div:focus-within]:ring-0 [&>div:focus-within]:outline-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
              iconRight={searchFilter ? (
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
                placeholder="Search procedure"
                value={searchFilter}
                onChange={handleSearchChange}
              />
            </TextField>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <div className="border border-neutral-200 rounded-lg bg-white h-full flex flex-col">
          {/* Table Header - Fixed */}
          <div className="bg-neutral-50 flex-shrink-0 rounded-t-2xl">
            <div className="flex">
              {/* Active */}
              <div className="px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6" style={{ width: '80px', flex: '0 0 80px' }}>
                Active
              </div>
              {/* Procedure */}
              <div className="px-4 py-3 text-left text-sm font-medium text-neutral-900" style={{ flex: '1' }}>
                <button
                  className="flex items-center gap-1 hover:text-neutral-900"
                  onClick={() => table.getColumn('name')?.toggleSorting()}
                >
                  Procedure
                  {table.getColumn('name')?.getIsSorted() === 'asc' && <FeatherArrowUp className="w-3 h-3" />}
                  {table.getColumn('name')?.getIsSorted() === 'desc' && <FeatherArrowDown className="w-3 h-3" />}
                </button>
              </div>
              {/* Category */}
              <div className="px-4 py-3 text-left text-sm font-medium text-neutral-900" style={{ width: '300px', flex: '0 0 300px' }}>
                <button
                  className="flex items-center gap-1 hover:text-neutral-900"
                  onClick={() => table.getColumn('category')?.toggleSorting()}
                >
                  Category
                  {table.getColumn('category')?.getIsSorted() === 'asc' && <FeatherArrowUp className="w-3 h-3" />}
                  {table.getColumn('category')?.getIsSorted() === 'desc' && <FeatherArrowDown className="w-3 h-3" />}
                </button>
              </div>
              {/* Price */}
              <div className="px-4 py-3 text-left text-sm font-medium text-neutral-900" style={{ width: '120px', flex: '0 0 120px' }}>
                <button
                  className="flex items-center gap-1 hover:text-neutral-900"
                  onClick={() => table.getColumn('price')?.toggleSorting()}
                >
                  Price
                  {table.getColumn('price')?.getIsSorted() === 'asc' && <FeatherArrowUp className="w-3 h-3" />}
                  {table.getColumn('price')?.getIsSorted() === 'desc' && <FeatherArrowDown className="w-3 h-3" />}
                </button>
              </div>
              {/* Estimated time */}
              <div className="px-4 py-3 text-left text-sm font-medium text-neutral-900" style={{ width: '150px', flex: '0 0 150px' }}>
                Estimated time
              </div>
              {/* Actions */}
              <div className="px-4 py-3 text-left text-sm font-medium text-neutral-900 last:pr-6" style={{ width: '80px', flex: '0 0 80px' }}>
              </div>
            </div>
          </div>

          {/* New Procedure Row - Fixed */}
          <div id="new-procedure-row" className="flex items-center bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0">
            <div className="px-4 py-4 first:pl-6" style={{ width: '80px', flex: '0 0 80px' }}>
              <Switch
                checked={newProcedure.is_active}
                onCheckedChange={(checked) => setNewProcedure(prev => ({...prev, is_active: checked}))}
              />
            </div>
            <div className="px-4 py-4" style={{ flex: '1' }}>
              <TextField
                variant="outline"
                className="w-full"
              >
                <TextField.Input
                  placeholder="Enter procedure name"
                  value={newProcedure.name}
                  onChange={(e) => setNewProcedure(prev => ({...prev, name: e.target.value}))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddProcedure();
                  }}
                />
              </TextField>
            </div>
            <div className="px-4 py-4" style={{ width: '300px', flex: '0 0 300px' }}>
              <Select
                variant="outline"
                className="w-full"
                value={newProcedure.category}
                onValueChange={(value) => setNewProcedure(prev => ({...prev, category: value}))}
              >
                {PROCEDURE_CATEGORIES.filter(cat => cat !== 'All').map(category => (
                  <Select.Item key={category} value={category}>
                    {category}
                  </Select.Item>
                ))}
              </Select>
            </div>
            <div className="px-4 py-4" style={{ width: '120px', flex: '0 0 120px' }}>
              <CurrencyInput
                placeholder="$0.00"
                defaultValue={newProcedure.price}
                decimalsLimit={2}
                decimalSeparator="."
                groupSeparator=","
                prefix="$"
                allowDecimals={true}
                allowNegativeValue={false}
                disableGroupSeparators={false}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onValueChange={(value) => {
                  const numericValue = value ? parseFloat(value) : 0;
                  setNewProcedure(prev => ({...prev, price: numericValue}));
                }}
              />
            </div>
            <div className="px-4 py-4" style={{ width: '150px', flex: '0 0 150px' }}>
              <Select
                variant="outline"
                className="w-full"
                value={newProcedure.estimated_time}
                onValueChange={(value) => setNewProcedure(prev => ({...prev, estimated_time: value}))}
              >
                {TIME_OPTIONS.map(time => (
                  <Select.Item key={time} value={time}>
                    {time}
                  </Select.Item>
                ))}
              </Select>
            </div>
            <div className="px-0 py-4 pr-12" style={{ width: '80px', flex: '0 0 80px' }}>
              <Button
                variant="brand-primary"
                size="large"
                onClick={handleAddProcedure}
                disabled={!newProcedure.name.trim() || isCreating}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Table Body - Scrollable */}
          <div className="flex-1 overflow-auto min-h-0">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-lg text-neutral-600">Loading procedures...</div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-lg text-red-600">Error: {error}</div>
                  <button
                    onClick={clearError}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Existing Procedures */}
            {!loading && !error && table.getRowModel().rows.map((row) => (
              <div key={row.id} className="flex items-center hover:bg-neutral-50 transition-colors">
                {/* Active */}
                <div className="px-4 py-4 first:pl-6" style={{ width: '80px', flex: '0 0 80px' }}>
                  {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
                </div>
                {/* Procedure */}
                <div className="px-4 py-4" style={{ flex: '1' }}>
                  {flexRender(row.getVisibleCells()[1].column.columnDef.cell, row.getVisibleCells()[1].getContext())}
                </div>
                {/* Category */}
                <div className="px-4 py-4" style={{ width: '300px', flex: '0 0 300px' }}>
                  {flexRender(row.getVisibleCells()[2].column.columnDef.cell, row.getVisibleCells()[2].getContext())}
                </div>
                {/* Price */}
                <div className="px-4 py-4" style={{ width: '120px', flex: '0 0 120px' }}>
                  {flexRender(row.getVisibleCells()[3].column.columnDef.cell, row.getVisibleCells()[3].getContext())}
                </div>
                {/* Estimated time */}
                <div className="px-4 py-4" style={{ width: '150px', flex: '0 0 150px' }}>
                  {flexRender(row.getVisibleCells()[4].column.columnDef.cell, row.getVisibleCells()[4].getContext())}
                </div>
                {/* Actions */}
                <div className="px-4 py-4 last:pr-6" style={{ width: '80px', flex: '0 0 80px' }}>
                  {flexRender(row.getVisibleCells()[5].column.columnDef.cell, row.getVisibleCells()[5].getContext())}
                </div>
              </div>
            ))}

            {/* No Results */}
            {!loading && !error && filteredProcedures.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-lg text-neutral-600">
                    No procedures found for the selected categories.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}