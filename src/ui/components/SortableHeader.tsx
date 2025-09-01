"use client";

import React from "react";
import { FeatherArrowUp, FeatherArrowDown } from "@subframe/core";
import type { Column } from "@tanstack/react-table";

interface SortableHeaderProps {
  column: Column<any, unknown>;
  children: React.ReactNode;
  table?: any; // Add table reference to check if there's any sorting active
}

export function SortableHeader({ column, children, table }: SortableHeaderProps) {
  const isSorted = column.getIsSorted();
  
  // Check if table has any sorting active at all
  const hasAnySorting = table?.getState()?.sorting?.length > 0;
  
  const handleClick = () => {
    // Use TanStack's default sorting behavior
    // This handles: unsorted -> asc -> desc -> unsorted cycle
    column.toggleSorting();
  };

  return (
    <div 
      className="flex items-center gap-1 cursor-pointer hover:bg-neutral-50 transition-colors group p-2 -m-2 rounded"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-sort={
        isSorted === 'asc' ? 'ascending' : 
        isSorted === 'desc' ? 'descending' : 'none'
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span>{children}</span>
      {isSorted === 'asc' && <FeatherArrowUp className="w-4 h-4 text-neutral-600" />}
      {isSorted === 'desc' && <FeatherArrowDown className="w-4 h-4 text-neutral-600" />}
      {!isSorted && hasAnySorting && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <FeatherArrowUp className="w-4 h-4 text-neutral-400" />
        </div>
      )}
    </div>
  );
}