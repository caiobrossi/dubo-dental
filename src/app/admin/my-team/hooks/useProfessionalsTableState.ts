import { useState, useCallback } from 'react';
import { SortingState, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';

export interface ProfessionalsTableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  globalFilter: string;
  onSortingChange: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => void;
  onColumnFiltersChange: (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
  onColumnVisibilityChange: (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void;
  onGlobalFilterChange: (value: string) => void;
  resetFilters: () => void;
}

export function useProfessionalsTableState(): ProfessionalsTableState {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const resetFilters = useCallback(() => {
    setSorting([]);
    setColumnFilters([]);
    setGlobalFilter('');
  }, []);

  return {
    sorting,
    columnFilters,
    columnVisibility,
    globalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    resetFilters,
  };
}