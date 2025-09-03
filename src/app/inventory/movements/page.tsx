"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/ui/components/Button";
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { 
  FeatherArrowDown,
  FeatherArrowUp,
  FeatherChevronDown,
  FeatherDownload,
  FeatherFileText,
  FeatherMinus,
  FeatherPlus,
  FeatherSearch,
  FeatherX 
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";

// Import export libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface InventoryMovement {
  id: string;
  inventory_id: string;
  product_name: string;
  professional_id: string;
  professional_name?: string;
  movement_type: 'withdraw' | 'add' | 'adjust';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes?: string;
  created_at: string;
  unit_price?: number;
  category?: string;
}

const columnHelper = createColumnHelper<InventoryMovement>();

function MovementsPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovementType, setSelectedMovementType] = useState<string>("all");
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Load movements data from Supabase
  const loadMovementsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // First, check if the table exists by attempting a query
      const { data: movementsData, error } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          professionals (name),
          inventory (category, unit_price)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading movements:', error);
        console.log('Error details:', error.message, error.details);
        // If table doesn't exist, show empty state
        setData([]);
      } else {
        console.log('Raw movements data:', movementsData);
        // Map the data to include professional name and inventory details
        const formattedData = (movementsData || []).map(movement => ({
          ...movement,
          professional_name: movement.professionals?.name || 'Unknown',
          category: movement.inventory?.category || 'Unknown',
          unit_price: movement.inventory?.unit_price || 0
        }));
        console.log('Formatted movements data:', formattedData);
        setData(formattedData);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when component mounts
  useEffect(() => {
    loadMovementsData();
  }, [loadMovementsData]);

  // Update column filters when movement type changes
  useEffect(() => {
    if (selectedMovementType === "all") {
      setColumnFilters([]);
    } else {
      setColumnFilters([
        {
          id: "movement_type",
          value: selectedMovementType,
        },
      ]);
    }
  }, [selectedMovementType]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Inventory Movements Report', 20, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Prepare data for table
    const tableData = data.map(movement => [
      formatDate(movement.created_at),
      movement.product_name,
      movement.category || 'Unknown',
      movement.professional_name || 'System',
      movement.movement_type === 'withdraw' ? `-${movement.quantity}` : `+${movement.quantity}`,
      `€${(movement.quantity * (movement.unit_price || 0)).toFixed(2)}`
    ]);
    
    // Add table
    autoTable(doc, {
      head: [['Date', 'Product', 'Category', 'Withdrawn by', 'Quantity', 'Total Price']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [64, 64, 64] },
    });
    
    // Save PDF
    doc.save(`inventory-movements-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = data.map(movement => ({
      Date: formatDate(movement.created_at),
      Product: movement.product_name,
      Category: movement.category || 'Unknown',
      'Withdrawn by': movement.professional_name || 'System',
      'Movement Type': movement.movement_type,
      Quantity: movement.quantity,
      'Previous Stock': movement.previous_stock,
      'New Stock': movement.new_stock,
      'Unit Price': movement.unit_price || 0,
      'Total Price': (movement.quantity * (movement.unit_price || 0)).toFixed(2),
      Notes: movement.notes || ''
    }));
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Movements');
    
    // Save Excel file
    XLSX.writeFile(wb, `inventory-movements-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Get movement icon and variant based on type
  const getMovementChipProps = (type: string, quantity: number) => {
    switch (type) {
      case 'withdraw':
        return {
          variant: 'error' as const,
          icon: <FeatherMinus />,
          iconRight: <FeatherArrowDown />,
          text: `-${quantity}`
        };
      case 'add':
        return {
          variant: 'success' as const,
          icon: <FeatherPlus />,
          iconRight: <FeatherArrowUp />,
          text: `+${quantity}`
        };
      case 'adjust':
        return {
          variant: 'neutral' as const,
          icon: null,
          iconRight: null,
          text: `${quantity}`
        };
      default:
        return {
          variant: 'neutral' as const,
          icon: null,
          iconRight: null,
          text: `${quantity}`
        };
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("created_at", {
        header: "Date",
        cell: (info) => (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("product_name", {
        header: "Product",
        cell: (info) => (
          <span className="text-body-medium font-body-medium text-default-font">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
            {info.getValue() || 'Unknown'}
          </span>
        ),
      }),
      columnHelper.accessor("professional_name", {
        header: "Withdrawn by",
        cell: (info) => (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
            {info.getValue() || 'System'}
          </span>
        ),
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: (info) => {
          const movement = info.row.original;
          const quantity = info.getValue();
          
          // Display quantity with appropriate sign and color, but no background
          const getQuantityDisplay = () => {
            if (movement.movement_type === 'withdraw') {
              return (
                <div className="flex items-center gap-1 text-red-600 font-medium">
                  <FeatherMinus className="w-4 h-4" />
                  <span>{quantity}</span>
                  <FeatherArrowDown className="w-4 h-4" />
                </div>
              );
            } else if (movement.movement_type === 'add') {
              return (
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <FeatherPlus className="w-4 h-4" />
                  <span>{quantity}</span>
                  <FeatherArrowUp className="w-4 h-4" />
                </div>
              );
            } else {
              return (
                <span className="text-neutral-600 font-medium">{quantity}</span>
              );
            }
          };
          
          return getQuantityDisplay();
        },
      }),
      columnHelper.display({
        id: "total_price",
        header: "Total Price",
        cell: (info) => {
          const movement = info.row.original;
          const totalPrice = movement.quantity * (movement.unit_price || 0);
          return (
            <span className="text-body-medium font-body-medium text-default-font">
              €{totalPrice.toFixed(2)}
            </span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchValue,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearchValue,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      
      const searchTerm = filterValue.toLowerCase();
      const movement = row.original;
      
      // Search in date (formatted)
      const movementDate = new Date(movement.created_at).toLocaleDateString();
      const dateMatch = movementDate.toLowerCase().includes(searchTerm);
      
      // Search in product name
      const productMatch = movement.product_name?.toLowerCase().includes(searchTerm) || false;
      
      // Search in category
      const categoryMatch = movement.category?.toLowerCase().includes(searchTerm) || false;
      
      // Search in withdrawn by (professional name)
      const withdrawnByMatch = movement.professional_name?.toLowerCase().includes(searchTerm) || false;
      
      return dateMatch || productMatch || categoryMatch || withdrawnByMatch;
    },
  });

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 bg-default-background shadow-md pb-3">
        {/* Header */}
        <div className="flex h-auto w-full flex-none items-center justify-between px-8 py-2 mobile:container mobile:max-w-none">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Inventory
            </span>
          </div>
          
          <SegmentControl className="h-10 w-auto flex-none" variant="default">
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/inventory')}
            >
              Inventory
            </SegmentControl.Item>
            <SegmentControl.Item active={true}>
              Movements
            </SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/suppliers')}
            >
              Suppliers
            </SegmentControl.Item>
          </SegmentControl>
          
          <div className="relative">
            <Button
              variant="brand-primary"
              size="large"
              icon={<FeatherDownload />}
              iconRight={<FeatherChevronDown />}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              Export
            </Button>
            
            {/* Custom dropdown menu */}
            {showExportDropdown && (
              <div className="absolute right-0 top-12 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-10" style={{ minWidth: '160px' }}>
                <button
                  onClick={() => {
                    exportToPDF();
                    setShowExportDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm"
                >
                  <FeatherFileText className="w-4 h-4" />
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    exportToExcel();
                    setShowExportDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm"
                >
                  <FeatherDownload className="w-4 h-4" />
                  Export as Excel
                </button>
              </div>
            )}
            
            {/* Backdrop to close dropdown when clicking outside */}
            {showExportDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowExportDropdown(false)}
              />
            )}
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="flex w-full flex-wrap items-center justify-between px-8 pb-4">
          <div className="flex items-center gap-4">
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  variant="neutral-secondary"
                  size="large"
                  iconRight={<FeatherChevronDown />}
                >
                  {selectedMovementType === "all" ? "All movements" :
                   selectedMovementType === "withdraw" ? "Withdrawals" :
                   selectedMovementType === "add" ? "Additions" :
                   selectedMovementType === "adjust" ? "Adjustments" : "All movements"}
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
                    <DropdownMenu.DropdownItem onClick={() => setSelectedMovementType("all")}>
                      All movements
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem onClick={() => setSelectedMovementType("withdraw")}>
                      Withdrawals
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem onClick={() => setSelectedMovementType("add")}>
                      Additions
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem onClick={() => setSelectedMovementType("adjust")}>
                      Adjustments
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
          
          {/* Search */}
          <div className="relative">
            <TextField
              className="h-10 w-96 flex-none [&>div]:rounded-full [&>div]:bg-neutral-100 [&>div]:hover:bg-neutral-200 [&>div]:transition-colors [&>div]:border-0 [&>div]:shadow-none [&>div:focus-within]:!bg-white [&>div:focus-within]:ring-0 [&>div:focus-within]:outline-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
              iconRight={searchValue ? (
                <IconButton
                  variant="neutral-tertiary"
                  size="small"
                  icon={<FeatherX />}
                  onClick={() => setSearchValue("")}
                />
              ) : null}
            >
              <TextField.Input
                className="rounded-full bg-transparent border-0 focus:outline-none focus:ring-0"
                placeholder="Search movements..."
                value={searchValue}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value)}
              />
            </TextField>
          </div>
        </div>

        {/* Table Container with Overflow */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-stretch gap-2 rounded-lg bg-default-background px-8 pb-6 overflow-auto">
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
                        className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6 cursor-pointer select-none hover:bg-neutral-100"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ minWidth: 150 }}
                      >
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" && " ↑"}
                            {header.column.getIsSorted() === "desc" && " ↓"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Body */}
              <div className="overflow-auto flex-1">
                <div className="w-full">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="text-lg text-neutral-600">Loading movements...</div>
                      </div>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="text-lg text-neutral-600">No movements found.</div>
                        <div className="text-sm text-neutral-500 mt-2">
                          {selectedMovementType !== "all" 
                            ? "Try changing the filter or search criteria." 
                            : "Movement history will appear here after inventory transactions."}
                        </div>
                      </div>
                    </div>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                        style={{ minHeight: 64 }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <div
                            key={cell.id}
                            className="flex-1 px-4 py-2 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden"
                            style={{ minWidth: 150 }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default MovementsPage;