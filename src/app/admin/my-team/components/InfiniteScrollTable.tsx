import React, { useRef, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Professional } from "@/lib/supabase";
import { useProfessionalColumns, ProfessionalRowData } from './columns';
import { useInfiniteProfessionals } from '../hooks/useInfiniteProfessionals';
import { useProfessionalsTableState } from '../hooks/useProfessionalsTableState';

interface InfiniteScrollTableProps {
  onEditProfessional: (professional: Professional) => void;
  onDeleteProfessional: (professional: Professional) => void;
  searchFilter?: string;
}

const OVERSCAN = 5;
const ITEM_HEIGHT = 80; // Height of each row in pixels

export function InfiniteScrollTable({
  onEditProfessional,
  onDeleteProfessional,
  searchFilter = '',
}: InfiniteScrollTableProps) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  // Table state
  const {
    sorting,
    columnVisibility,
    onSortingChange,
    onColumnVisibilityChange,
  } = useProfessionalsTableState();

  // Infinite scroll data
  const {
    data: professionals,
    loading,
    initialLoading,
    hasMore,
    error,
    loadMore,
    totalLoaded,
  } = useInfiniteProfessionals({
    pageSize: 50, // Load 50 items per page
    sorting,
    globalFilter: searchFilter,
  });

  // Table columns
  const columns = useProfessionalColumns({
    onEditProfessional: useCallback(onEditProfessional, [onEditProfessional]),
    onDeleteProfessional: useCallback(onDeleteProfessional, [onDeleteProfessional]),
  });

  // Table data
  const tableData: ProfessionalRowData[] = React.useMemo(() => {
    return professionals;
  }, [professionals]);

  // TanStack Table instance
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: false, // Disable multi-sort for simpler behavior
    enableSortingRemoval: true, // Allow removing sort (third click)
    manualSorting: true, // We handle sorting server-side
    columnResizeMode: 'onChange',
  });

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: tableData.length + (hasMore ? 1 : 0), // +1 for loading row
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: OVERSCAN,
  });

  // Infinite scroll trigger
  const loadMoreTrigger = useCallback(() => {
    if (!loading && hasMore) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  // Check if we need to load more items when scrolling
  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();
    
    if (!lastItem) return;

    if (
      lastItem.index >= tableData.length - 1 &&
      hasMore &&
      !loading
    ) {
      loadMoreTrigger();
    }
  }, [
    hasMore,
    loadMoreTrigger,
    tableData.length,
    loading,
    virtualizer.getVirtualItems(),
  ]);

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
          <span className="text-sm text-neutral-600">Loading professionals...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-lg font-medium text-red-600">Error: {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!initialLoading && tableData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-lg font-medium text-neutral-600">
            {searchFilter ? 'No professionals found matching your filters' : 'No professionals found'}
          </span>
          <span className="text-sm text-neutral-500">
            {searchFilter 
              ? 'Try adjusting your search criteria'
              : 'Click "Add Team Member" to get started'
            }
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Stats */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-neutral-600">
          {totalLoaded} professional{totalLoaded !== 1 ? 's' : ''} loaded
          {hasMore && <span className="text-neutral-400"> (scroll for more)</span>}
        </span>
      </div>

      {/* Table Container */}
      <div 
        ref={scrollElementRef}
        className="flex-1 overflow-auto rounded-lg border border-neutral-200 bg-white"
        style={{
          height: '600px', // Fixed height for virtualization
        }}
      >
        {/* Table Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          {table.getHeaderGroups().map(headerGroup => (
            <div 
              key={headerGroup.id} 
              className="flex border-b border-neutral-200"
            >
              {headerGroup.headers.map(header => (
                <div
                  key={header.id}
                  className="flex items-center px-4 py-3 text-left text-sm font-medium text-neutral-700 bg-neutral-50"
                  style={{ 
                    width: header.getSize(),
                    minWidth: header.column.columnDef.minSize,
                    flex: header.id === 'actions' ? 'none' : '1 1 auto',
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Virtual Rows */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => {
            const isLoadingRow = virtualRow.index >= tableData.length;
            
            if (isLoadingRow) {
              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex items-center justify-center border-b border-neutral-200 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-600" />
                    <span className="text-sm text-neutral-500">Loading more...</span>
                  </div>
                </div>
              );
            }

            const row = table.getRowModel().rows[virtualRow.index];
            if (!row) return null;

            return (
              <div
                key={row.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex border-b border-neutral-200 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                {row.getVisibleCells().map(cell => (
                  <div
                    key={cell.id}
                    className="flex items-center px-4 py-3"
                    style={{ 
                      width: cell.column.getSize(),
                      minWidth: cell.column.columnDef.minSize,
                      flex: cell.column.id === 'actions' ? 'none' : '1 1 auto',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}