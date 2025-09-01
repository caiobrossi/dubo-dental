import React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { FeatherSettings, FeatherChevronDown } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

interface ColumnVisibilityMenuProps<TData> {
  table: Table<TData>;
}

const COLUMN_LABELS: Record<string, string> = {
  patient: 'Patient',
  dateOfBirth: 'Date of Birth',
  lastVisit: 'Last Visit',
  professional: 'Professional',
  status: 'Status',
  actions: 'Actions',
};

export function ColumnVisibilityMenu<TData>({ table }: ColumnVisibilityMenuProps<TData>) {
  const toggleableColumns = table.getAllColumns().filter((column) => 
    column.getCanHide() && column.id !== 'actions' // Always show actions column
  );

  const visibleCount = toggleableColumns.filter(column => column.getIsVisible()).length;
  const totalCount = toggleableColumns.length;

  return (
    <SubframeCore.DropdownMenu.Root>
      <SubframeCore.DropdownMenu.Trigger asChild>
        <Button
          variant="neutral-secondary"
          size="large"
          icon={<FeatherSettings />}
          iconRight={<FeatherChevronDown />}
        >
          Columns ({visibleCount}/{totalCount})
        </Button>
      </SubframeCore.DropdownMenu.Trigger>
      
      <SubframeCore.DropdownMenu.Portal>
        <SubframeCore.DropdownMenu.Content
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-56"
        >
          <div className="p-2">
            <div className="px-2 py-1.5 text-sm font-medium text-neutral-900 border-b border-neutral-200 mb-2">
              Toggle Columns
            </div>
            
            <div className="space-y-1">
              {toggleableColumns.map((column) => {
                const isVisible = column.getIsVisible();
                const label = COLUMN_LABELS[column.id] || column.id;
                
                return (
                  <div
                    key={column.id}
                    className="flex items-center space-x-2 px-2 py-2 hover:bg-neutral-50 rounded cursor-pointer"
                    onClick={() => column.toggleVisibility()}
                  >
                    <div className="flex items-center justify-center w-4 h-4">
                      {isVisible && (
                        <div className="w-3 h-3 bg-brand-600 rounded-sm flex items-center justify-center">
                          <svg
                            className="w-2 h-2 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      {!isVisible && (
                        <div className="w-3 h-3 border-2 border-neutral-300 rounded-sm" />
                      )}
                    </div>
                    <span className="text-sm text-neutral-900 flex-1">{label}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-neutral-200 mt-2 pt-2">
              <button
                onClick={() => {
                  // Show all columns
                  toggleableColumns.forEach(column => {
                    if (!column.getIsVisible()) {
                      column.toggleVisibility();
                    }
                  });
                }}
                className="w-full text-left px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded"
                disabled={visibleCount === totalCount}
              >
                Show All
              </button>
              
              <button
                onClick={() => {
                  // Hide all except patient (keep at least one visible)
                  toggleableColumns.forEach(column => {
                    if (column.getIsVisible() && column.id !== 'patient') {
                      column.toggleVisibility();
                    }
                  });
                }}
                className="w-full text-left px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded"
                disabled={visibleCount === 1}
              >
                Hide All (Keep Patient)
              </button>
            </div>
          </div>
        </SubframeCore.DropdownMenu.Content>
      </SubframeCore.DropdownMenu.Portal>
    </SubframeCore.DropdownMenu.Root>
  );
}