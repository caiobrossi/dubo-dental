import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SortableHeader } from "@/ui/components/SortableHeader";
import { FeatherMoreHorizontal, FeatherEdit2, FeatherTrash, FeatherDownload, FeatherPrinter } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { LabOrder, Professional } from "@/lib/supabase";

export interface LabOrderRowData extends LabOrder {
  professionalName?: string;
}

interface ColumnProps {
  professionals: Professional[];
  onEditOrder: (order: LabOrder) => void;
  onDeleteOrder: (order: LabOrder) => void;
  onViewDetails: (orderId: string) => void;
}

export function useLabOrderColumns({ professionals, onEditOrder, onDeleteOrder, onViewDetails }: ColumnProps) {
  return useMemo<ColumnDef<LabOrderRowData>[]>(() => [
    {
      accessorKey: 'order_name',
      id: 'orderName',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Order Name
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <button
            className="whitespace-nowrap font-['Urbanist'] text-[16px] font-[600] leading-[20px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
            onClick={() => onViewDetails(order.id!)}
          >
            {order.order_name}
          </button>
        );
      },
      enableSorting: true,
      sortingFn: 'alphanumeric',
      minSize: 200,
    },
    {
      accessorKey: 'patient_name',
      id: 'patientName',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Patient
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            {order.patient_name || 'N/A'}
          </span>
        );
      },
      enableSorting: true,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'professional_id',
      id: 'professional',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Professional
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original;
        const professional = professionals.find(p => p.id === order.professional_id);
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            {professional?.name || order.professional_name || 'Unassigned'}
          </span>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const professionalA = professionals.find(p => p.id === rowA.getValue(columnId))?.name || '';
        const professionalB = professionals.find(p => p.id === rowB.getValue(columnId))?.name || '';
        return professionalA.localeCompare(professionalB);
      },
    },
    {
      accessorKey: 'lab_name',
      id: 'labName',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Lab
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            {order.lab_name}
          </span>
        );
      },
      enableSorting: true,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'services',
      id: 'services',
      header: () => <span>Services</span>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            {order.services}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'due_date',
      id: 'dueDate',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Due Date
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            {order.due_date ? new Date(order.due_date).toLocaleDateString('pt-BR') : 'N/A'}
          </span>
        );
      },
      enableSorting: true,
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'total_price',
      id: 'totalPrice',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Total Price
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            ${order.total_price?.toFixed(2) || '0.00'}
          </span>
        );
      },
      enableSorting: true,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'created_at',
      id: 'createdAt',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Created At
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A'}
          </span>
        );
      },
      enableSorting: true,
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: () => <span>Status</span>,
      cell: ({ row }) => {
        const order = row.original;
        const getStatusVariant = (status: string) => {
          switch (status) {
            case 'order_created':
              return 'neutral' as const;
            case 'order_confirmed':
              return 'warning' as const;
            case 'in_progress':
              return 'brand' as const;
            case 'completed':
              return 'success' as const;
            case 'overdue':
              return 'error' as const;
            default:
              return 'neutral' as const;
          }
        };

        const getStatusLabel = (status: string) => {
          switch (status) {
            case 'order_created':
              return 'Created';
            case 'order_confirmed':
              return 'Confirmed';
            case 'in_progress':
              return 'In Progress';
            case 'completed':
              return 'Completed';
            case 'overdue':
              return 'Overdue';
            default:
              return status;
          }
        };

        return (
          <div className="flex justify-start" style={{ width: '120px' }}>
            <Chips
              variant={getStatusVariant(order.status)}
              size="large"
            >
              {getStatusLabel(order.status)}
            </Chips>
          </div>
        );
      },
      enableSorting: false,
      size: 120,
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex justify-end w-full">
          <span>Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const order = row.original;
        
        return (
          <div className="flex justify-end items-center w-full">
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton
                  size="medium"
                  variant="neutral-tertiary"
                  icon={<FeatherMoreHorizontal />}
                />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherEdit2 />}
                      onClick={() => onViewDetails(order.id!)}
                    >
                      View details
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherEdit2 />}
                      onClick={() => onEditOrder(order)}
                    >
                      Edit order
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherDownload />}
                    >
                      Download
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherPrinter />}
                    >
                      Print
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherTrash />}
                      onClick={() => onDeleteOrder(order)}
                    >
                      Delete
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        );
      },
      enableSorting: false,
      size: 60,
    },
  ], [professionals, onEditOrder, onDeleteOrder, onViewDetails]);
}