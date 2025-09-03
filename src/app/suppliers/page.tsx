"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/ui/components/Button";
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { FeatherPhone } from "@subframe/core";
import { FeatherMail } from "@subframe/core";
import { FeatherGlobe } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { supabase, Supplier } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import SupplierDetailsDrawer from "@/components/custom/SupplierDetailsDrawer";
import NewSupplierModal from "@/components/custom/NewSupplierModal";
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

const columnHelper = createColumnHelper<Supplier>();

function SuppliersPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  // Function to load suppliers data from Supabase
  const loadSuppliersData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: suppliersData, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading suppliers:', error);
        return;
      }

      setData(suppliersData || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when component mounts
  useEffect(() => {
    loadSuppliersData();
  }, [loadSuppliersData]);

  const handleSupplierCreated = () => {
    console.log('Supplier created successfully');
    // Reload the data to show the new supplier
    loadSuppliersData();
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Supplier Name",
        cell: (info) => (
          <button
            className="text-body-medium font-body-medium text-blue-600 hover:text-blue-700 hover:underline text-left"
            onClick={() => {
              setSelectedSupplierId(info.row.original.id);
              setShowSupplierDetails(true);
            }}
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor("contact_person", {
        header: "Contact Person",
        cell: (info) => (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.display({
        id: "phones",
        header: "Phone",
        cell: (info) => {
          const supplier = info.row.original;
          const alternativePhones = supplier.alternative_phone 
            ? supplier.alternative_phone.split(',').map(phone => phone.trim()).filter(phone => phone)
            : [];
          
          return (
            <div className="flex flex-col gap-1">
              {supplier.phone && (
                <a href={`tel:${supplier.phone}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  <FeatherPhone className="w-4 h-4" />
                  <span className="text-sm">{supplier.phone}</span>
                </a>
              )}
              {alternativePhones.map((altPhone, index) => (
                <a key={index} href={`tel:${altPhone}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  <FeatherPhone className="w-4 h-4" />
                  <span className="text-sm">{altPhone}</span>
                </a>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => {
          const email = info.getValue();
          return email ? (
            <a href={`mailto:${email}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
              <FeatherMail className="w-4 h-4" />
              <span className="text-sm">{email}</span>
            </a>
          ) : (
            <span className="text-body-medium font-body-medium text-neutral-500">-</span>
          );
        },
      }),
      columnHelper.accessor("website", {
        header: "Website",
        cell: (info) => {
          const website = info.getValue();
          return website ? (
            <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
              <FeatherGlobe className="w-4 h-4" />
              <span className="text-sm">Visit</span>
            </a>
          ) : (
            <span className="text-body-medium font-body-medium text-neutral-500">-</span>
          );
        },
      }),
      columnHelper.accessor("products", {
        header: "Products",
        cell: (info) => (
          <span className="text-body-medium font-body-medium text-neutral-500 line-clamp-2">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex items-center justify-end gap-2">
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton
                  size="medium"
                  icon={<FeatherMoreHorizontal />}
                  onClick={() => {}}
                />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                      Edit
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                      Delete
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        ),
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
      const supplierName = row.original.name?.toLowerCase() || '';
      const contactPerson = row.original.contact_person?.toLowerCase() || '';
      
      return supplierName.includes(searchTerm) || contactPerson.includes(searchTerm);
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
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/inventory/movements')}
            >
              Movements
            </SegmentControl.Item>
            <SegmentControl.Item active={true}>
              Suppliers
            </SegmentControl.Item>
          </SegmentControl>
          
          <Button
            variant="brand-primary"
            size="large"
            icon={<FeatherPlus />}
            onClick={() => {
              console.log('Add Supplier button clicked');
              setShowNewSupplierModal(true);
            }}
          >
            Add Supplier
          </Button>
        </div>


        {/* Search Section */}
        <div className="flex w-full flex-wrap items-center justify-end px-8 pb-4">
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
                placeholder="Search by supplier name or contact person"
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
                        <div className="text-lg text-neutral-600">Loading suppliers...</div>
                      </div>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="text-lg text-neutral-600">No suppliers found.</div>
                        <div className="text-sm text-neutral-500 mt-2">Add your first supplier using the button above.</div>
                      </div>
                    </div>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                        style={{ minHeight: 80 }}
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

      {/* New Supplier Modal */}
      <NewSupplierModal
        open={showNewSupplierModal}
        onOpenChange={setShowNewSupplierModal}
        onSupplierCreated={handleSupplierCreated}
      />

      {/* Supplier Details Drawer */}
      <SupplierDetailsDrawer
        open={showSupplierDetails}
        onOpenChange={setShowSupplierDetails}
        supplierId={selectedSupplierId}
      />
    </DefaultPageLayout>
  );
}

export default SuppliersPage;