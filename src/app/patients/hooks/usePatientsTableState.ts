import { useState, useCallback } from 'react';
import {
  SortingState,
  PaginationState,
  VisibilityState,
} from '@tanstack/react-table';

export interface PatientsTableParams {
  sorting: SortingState;
  pagination: PaginationState;
  columnVisibility: VisibilityState;
  globalFilter: string;
}

const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 25,
};

const DEFAULT_SORTING: SortingState = [
  { id: 'createdAt', desc: true }, // Sort by created date descending by default (newest first)
];

const DEFAULT_COLUMN_VISIBILITY: VisibilityState = {
  patient: true,
  dateOfBirth: true,
  lastVisit: true,
  professional: true,
  createdAt: false, // Hide created_at column by default
  status: true,
  actions: true,
};

export function usePatientsTableState() {
  // State - no URL persistence, always starts with defaults
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_COLUMN_VISIBILITY);
  const [globalFilter, setGlobalFilter] = useState('');

  // Handlers without URL persistence
  const onSortingChange = useCallback((updater: any) => {
    setSorting(prev => {
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }, []);

  const onPaginationChange = useCallback((updater: any) => {
    setPagination(prev => {
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }, []);

  const onColumnVisibilityChange = useCallback((updater: any) => {
    setColumnVisibility(prev => {
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }, []);

  const onGlobalFilterChange = useCallback((updater: any) => {
    setGlobalFilter(prev => {
      const newFilter = typeof updater === 'function' ? updater(prev) : updater;
      return newFilter;
    });
    
    // Reset pagination when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSorting(DEFAULT_SORTING);
    setPagination(DEFAULT_PAGINATION);
    setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
    setGlobalFilter('');
  }, []);

  return {
    // State
    sorting,
    pagination,
    columnVisibility,
    globalFilter,
    
    // Handlers
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    onGlobalFilterChange,
    
    // Utils
    resetFilters,
  };
}