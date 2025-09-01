import React, { useRef, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { LabOrder, Professional } from "@/lib/supabase";
import { useLabOrderColumns, LabOrderRowData } from './columns';
import { useInfiniteLabOrders } from '../hooks/useInfiniteLabOrders';
import { useLabOrdersTableState } from '../hooks/useLabOrdersTableState';

interface InfiniteScrollTableProps {
  professionals: Professional[];
  onEditOrder: (order: LabOrder) => void;
  onDeleteOrder: (order: LabOrder) => void;
  onViewDetails: (orderId: string) => void;
  professionalFilter?: string;
  searchFilter?: string;
}

const OVERSCAN = 5;
const ITEM_HEIGHT = 80;

export function InfiniteScrollTable({
  professionals,
  onEditOrder,
  onDeleteOrder,
  onViewDetails,
  professionalFilter = 'all',
  searchFilter = '',
}: InfiniteScrollTableProps) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  // Table state
  const {
    sorting,
    columnVisibility,
    onSortingChange,
    onColumnVisibilityChange,
  } = useLabOrdersTableState();

  // Infinite scroll data
  const {
    data: labOrders,
    loading,
    initialLoading,
    hasMore,
    error,
    loadMore,
    totalLoaded,
  } = useInfiniteLabOrders({
    pageSize: 50,
    sorting,
    globalFilter: searchFilter,
    professionalFilter,
  });

  // Table columns
  const columns = useLabOrderColumns({
    professionals,
    onEditOrder: useCallback(onEditOrder, [onEditOrder]),
    onDeleteOrder: useCallback(onDeleteOrder, [onDeleteOrder]),
    onViewDetails: useCallback(onViewDetails, [onViewDetails]),
  });

  // Table data with professional names
  const tableData: LabOrderRowData[] = React.useMemo(() => {
    return labOrders.map(order => ({
      ...order,
      professionalName: professionals.find(p => p.id === order.professional_id)?.name,
    }));
  }, [labOrders, professionals]);

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
    manualSorting: true,
  });

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: tableData.length + (hasMore ? 1 : 0),
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

  // Trigger load more when scrolling near the end
  useEffect(() => {
    const items = virtualizer.getVirtualItems();
    if (!items.length) return;

    const lastItem = items[items.length - 1];
    const shouldLoadMore = lastItem.index >= tableData.length - 3 && hasMore && !loading;

    if (shouldLoadMore) {
      loadMoreTrigger();
    }
  }, [virtualizer.getVirtualItems(), tableData.length, hasMore, loading, loadMoreTrigger]);

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg text-neutral-600">Loading lab orders...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg text-red-600">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg text-neutral-600">
            No lab orders found matching your filters.
          </div>
        </div>
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Table container */}
      <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-[5]">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="flex">
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6"
                  style={{ minWidth: header.getSize() || 150 }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : ''
                      }
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Virtualized body */}
        <div
          ref={scrollElementRef}
          className="overflow-auto flex-1"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const isLoadingMore = virtualItem.index >= tableData.length;
              
              if (isLoadingMore) {
                return (
                  <div
                    key={`loading-${virtualItem.index}`}
                    className="absolute top-0 left-0 w-full flex items-center justify-center border-b border-neutral-200"
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="text-sm text-neutral-600 py-4">
                      {loading ? 'Loading more lab orders...' : 'Scroll to load more'}
                    </div>
                  </div>
                );
              }

              const row = rows[virtualItem.index];
              if (!row) return null;

              return (
                <div
                  key={row.id}
                  className="absolute top-0 left-0 w-full flex items-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="flex-1 px-4 py-2 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden"
                      style={{ minWidth: cell.column.getSize() || 150 }}
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
    </div>
  );
}