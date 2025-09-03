import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Avatar } from "@/ui/components/Avatar";
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { SortableHeader } from "@/ui/components/SortableHeader";
import { 
  FeatherMoreHorizontal, 
  FeatherEdit2, 
  FeatherTrash, 
  FeatherPlus,
  FeatherPill,
  FeatherHistory,
  FeatherProportions
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";

export interface AnamneseData {
  id: string;
  name: string;
  type: 'medical' | 'dental' | 'orthodontic';
  lastDate: string;
  alerts: string;
  reviewed: boolean;
  status: 'completed' | 'pending' | 'in-progress';
  professionalName: string;
  professionalAvatar?: string;
}

interface ColumnProps {
  onEdit: (anamnese: AnamneseData) => void;
  onDelete: (anamnese: AnamneseData) => void;
  onView: (anamnese: AnamneseData) => void;
}

export function useAnamneseColumns({ onEdit, onDelete, onView }: ColumnProps) {
  return useMemo<ColumnDef<AnamneseData>[]>(() => [
    {
      accessorKey: 'name',
      id: 'formName',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Form Name
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const anamnese = row.original;
        const icon = anamnese.type === 'medical' ? <FeatherPill /> 
                    : anamnese.type === 'dental' ? <FeatherHistory />
                    : <FeatherProportions />;
        const variant = anamnese.type === 'medical' ? 'brand' 
                      : anamnese.type === 'dental' ? 'error'
                      : 'success';
        
        return (
          <div className="flex items-center gap-4">
            <IconWithBackground
              variant={variant as any}
              size="medium"
              icon={icon}
            />
            <LinkButton
              variant="brand"
              onClick={() => onView(anamnese)}
            >
              {anamnese.name}
            </LinkButton>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: 'alphanumeric',
      minSize: 250,
    },
    {
      accessorKey: 'lastDate',
      id: 'lastDate',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Last Date
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
          {row.original.lastDate}
        </span>
      ),
      enableSorting: true,
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'alerts',
      id: 'alerts',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Generated Alerts
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
          {row.original.alerts}
        </span>
      ),
      enableSorting: true,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'reviewed',
      id: 'reviewed',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Reviewed
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
          {row.original.reviewed ? 'Yes' : 'No'}
        </span>
      ),
      enableSorting: true,
      sortingFn: 'basic',
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Status
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === 'completed' ? 'success' 
                      : status === 'pending' ? 'warning'
                      : 'neutral';
        
        return (
          <Chips variant={variant as any} size="large">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Chips>
        );
      },
      enableSorting: true,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'professionalName',
      id: 'professional',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Assigned To
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const anamnese = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar 
              size="small"
              image={anamnese.professionalAvatar} 
            />
            <span className="text-body-medium font-body-medium text-neutral-500">
              {anamnese.professionalName}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: 'alphanumeric',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const anamnese = row.original;
        return (
          <div className="flex grow shrink-0 basis-0 items-center justify-end">
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton
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
                    <DropdownMenu.DropdownItem>
                      Favorite
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                      Add
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem 
                      icon={<FeatherEdit2 />}
                      onClick={() => onEdit(anamnese)}
                    >
                      Edit
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem 
                      icon={<FeatherTrash />}
                      onClick={() => onDelete(anamnese)}
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
      size: 80,
    },
  ], [onEdit, onDelete, onView]);
}