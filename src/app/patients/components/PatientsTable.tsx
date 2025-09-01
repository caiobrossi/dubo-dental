import React, { useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Patient, Professional } from "@/lib/supabase";
import { usePatientColumns, PatientRowData } from './columns';
import { usePatientsTableState } from '../hooks/usePatientsTableState';
import { PaginationControls } from './PaginationControls';
import { VirtualizedTable, useVirtualizationThreshold } from './VirtualizedTable';
import { filterPatientsClientSide } from '../utils/fetchPatients';

interface PatientsTableProps {
  patients: Patient[];
  professionals: Professional[];
  loading?: boolean;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  professionalFilter?: string;
}

export function PatientsTable({
  patients,
  professionals,
  loading = false,
  onEditPatient,
  onDeletePatient,
  professionalFilter = 'all',
}: PatientsTableProps) {
  // Memoized table state hook
  const {
    sorting,
    pagination,
    columnVisibility,
    globalFilter,
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    onGlobalFilterChange,
  } = usePatientsTableState();

  // Memoized columns to prevent re-creation
  const columns = usePatientColumns({
    professionals,
    onEditPatient: useCallback(onEditPatient, [onEditPatient]),
    onDeletePatient: useCallback(onDeletePatient, [onDeletePatient]),
  });

  // Memoized filtered data
  const filteredData = useMemo(() => {
    return filterPatientsClientSide(patients, globalFilter, professionalFilter);
  }, [patients, globalFilter, professionalFilter]);

  // Memoized table data with professional names
  const tableData = useMemo<PatientRowData[]>(() => {
    return filteredData.map(patient => ({
      ...patient,
      professionalName: professionals.find(p => p.id === patient.professional_id)?.name,
    }));
  }, [filteredData, professionals]);

  // TanStack Table instance
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      globalFilter,
    },
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Enable multi-sort with shift key
    enableMultiSort: true,
    // Manual pagination for server-side mode (when needed)
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
    // Accessibility
    debugTable: process.env.NODE_ENV === 'development',
  });

  // Check if virtualization should be used
  const shouldVirtualize = useVirtualizationThreshold(tableData.length, 1000);

  // Loading state
  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg text-neutral-600">Loading patients...</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && tableData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg text-neutral-600">
            {patients.length === 0 
              ? 'No patients found. Click "Create new patient" to add the first patient.'
              : 'No patients match the current filters.'
            }
          </div>
        </div>
      </div>
    );
  }

  // Virtualized table for large datasets
  if (shouldVirtualize) {
    return (
      <div className="w-full">
        <VirtualizedTable
          data={tableData}
          columns={columns}
          height={600}
        />
      </div>
    );
  }

  // Regular table for normal datasets
  return (
    <div className="w-full">
      {/* Table */}
      <div className="w-full border border-neutral-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full min-w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody className="divide-y divide-neutral-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-neutral-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-4 text-sm text-neutral-900 first:pl-6 last:pr-6"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationControls
        table={table}
        totalCount={tableData.length}
        loading={loading}
      />
    </div>
  );
}