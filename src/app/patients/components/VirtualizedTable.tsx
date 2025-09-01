import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

interface VirtualizedTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  height?: number;
}

/**
 * Virtualized table component using TanStack Virtual
 * This is a stub implementation showing how to integrate virtualization
 * with TanStack Table for large datasets (1000+ rows)
 * 
 * Usage:
 * - Replace the regular table with this component when data.length > 1000
 * - Adjust the estimateSize based on your row height
 * - Consider implementing dynamic row heights if needed
 */
export function VirtualizedTable<TData>({
  data,
  columns,
  height = 400,
}: VirtualizedTableProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height in pixels
    overscan: 10, // Number of items to render outside of the visible area
  });

  return (
    <div className="w-full border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="flex">
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900"
                style={{ width: header.getSize() }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Virtualized body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${height}px` }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const row = rows[virtualItem.index];
            return (
              <div
                key={row.id}
                className="absolute top-0 left-0 w-full flex items-center border-b border-neutral-200 hover:bg-neutral-50"
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className="flex-1 px-4 py-2 text-sm text-neutral-900"
                    style={{ width: cell.column.getSize() }}
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

/**
 * Hook to determine if virtualization should be enabled
 * This helps with performance by only using virtualization when needed
 */
export function useVirtualizationThreshold(
  dataLength: number,
  threshold = 1000
): boolean {
  return dataLength > threshold;
}

/**
 * Example usage in the main table component:
 * 
 * ```tsx
 * const shouldVirtualize = useVirtualizationThreshold(data.length);
 * 
 * if (shouldVirtualize) {
 *   return (
 *     <VirtualizedTable
 *       data={data}
 *       columns={columns}
 *       height={600}
 *     />
 *   );
 * }
 * 
 * // Regular table for smaller datasets
 * return <RegularTable ... />;
 * ```
 */