import React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { 
  FeatherChevronLeft, 
  FeatherChevronRight, 
  FeatherChevronsLeft, 
  FeatherChevronsRight,
  FeatherChevronDown
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";

interface PaginationControlsProps<TData> {
  table: Table<TData>;
  totalCount?: number;
  loading?: boolean;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export function PaginationControls<TData>({ 
  table, 
  totalCount = 0, 
  loading = false 
}: PaginationControlsProps<TData>) {
  const pagination = table.getState().pagination;
  const pageCount = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;
  const pageSize = pagination.pageSize;
  
  const startItem = pagination.pageIndex * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalCount);

  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-white">
      {/* Results info */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-neutral-600">
          {loading ? (
            'Loading...'
          ) : totalCount === 0 ? (
            'No results'
          ) : (
            `Showing ${startItem.toLocaleString()} to ${endItem.toLocaleString()} of ${totalCount.toLocaleString()} results`
          )}
        </div>
        
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Rows per page:</span>
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild>
              <Button
                variant="neutral-tertiary"
                size="medium"
                iconRight={<FeatherChevronDown />}
                disabled={loading}
              >
                {pageSize}
              </Button>
            </SubframeCore.DropdownMenu.Trigger>
            
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content
                side="top"
                align="center"
                sideOffset={4}
              >
                <DropdownMenu>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <DropdownMenu.DropdownItem
                      key={size}
                      onClick={() => table.setPageSize(size)}
                    >
                      {size} rows
                    </DropdownMenu.DropdownItem>
                  ))}
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        {/* Page info */}
        <div className="text-sm text-neutral-600 mr-4">
          Page {currentPage} of {pageCount || 1}
        </div>
        
        {/* First page */}
        <Button
          variant="neutral-tertiary"
          size="medium"
          icon={<FeatherChevronsLeft />}
          onClick={() => table.setPageIndex(0)}
          disabled={!canPreviousPage || loading}
          aria-label="Go to first page"
        />
        
        {/* Previous page */}
        <Button
          variant="neutral-tertiary"
          size="medium"
          icon={<FeatherChevronLeft />}
          onClick={() => table.previousPage()}
          disabled={!canPreviousPage || loading}
          aria-label="Go to previous page"
        />
        
        {/* Page input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={pageCount || 1}
            value={currentPage}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              if (page >= 0 && page < pageCount) {
                table.setPageIndex(page);
              }
            }}
            className="w-16 px-2 py-1 text-sm border border-neutral-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            disabled={loading}
            aria-label="Current page number"
          />
        </div>
        
        {/* Next page */}
        <Button
          variant="neutral-tertiary"
          size="medium"
          icon={<FeatherChevronRight />}
          onClick={() => table.nextPage()}
          disabled={!canNextPage || loading}
          aria-label="Go to next page"
        />
        
        {/* Last page */}
        <Button
          variant="neutral-tertiary"
          size="medium"
          icon={<FeatherChevronsRight />}
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNextPage || loading}
          aria-label="Go to last page"
        />
      </div>
    </div>
  );
}