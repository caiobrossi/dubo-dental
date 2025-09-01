import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Avatar } from "@/ui/components/Avatar";
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SortableHeader } from "@/ui/components/SortableHeader";
import { FeatherMoreHorizontal, FeatherEdit2, FeatherTrash, FeatherEye } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { Patient, Professional } from "@/lib/supabase";
import { formatPatientNameForDisplay } from "@/app/scheduling/utils/nameUtils";

export interface PatientRowData extends Patient {
  professionalName?: string;
}

interface ColumnProps {
  professionals: Professional[];
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
}

export function usePatientColumns({ professionals, onEditPatient, onDeletePatient }: ColumnProps) {
  const router = useRouter();
  
  return useMemo<ColumnDef<PatientRowData>[]>(() => [
    {
      accessorKey: 'name',
      id: 'patient',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Patient
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Avatar
                size="large"
                image={patient.avatar_url || undefined}
                square={false}
              >
                {patient.name?.charAt(0)?.toUpperCase() || 'P'}
              </Avatar>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span 
                className="whitespace-nowrap font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-neutral-700 cursor-pointer hover:text-brand-600 transition-colors"
                onClick={() => router.push(`/patients/${patient.id}`)}
              >
                {formatPatientNameForDisplay(patient.name)}
              </span>
              <span className="whitespace-nowrap text-body-medium font-body-medium text-subtext-color">
                ID: {patient.id?.substring(0, 8) || 'N/A'}
              </span>
            </div>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: 'alphanumeric',
      minSize: 250, // Minimum width to prevent avatar/name from breaking
    },
    {
      accessorKey: 'date_of_birth',
      id: 'dateOfBirth',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Date of Birth
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const dateOfBirth = row.original.date_of_birth;
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('pt-BR') : 'N/A'}
          </span>
        );
      },
      enableSorting: true,
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'last_visit',
      id: 'lastVisit',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Last Visit
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const lastVisit = row.original.last_visit;
        
        const getTimeAgo = (dateString: string) => {
          const now = new Date();
          const visitDate = new Date(dateString);
          const diffInMs = now.getTime() - visitDate.getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          
          if (diffInDays < 1) {
            return 'Today';
          } else if (diffInDays === 1) {
            return '1 day ago';
          } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
          } else if (diffInDays < 14) {
            return '1 week ago';
          } else if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `${weeks} weeks ago`;
          } else if (diffInDays < 60) {
            return '1 month ago';
          } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `${months} months ago`;
          } else {
            const years = Math.floor(diffInDays / 365);
            return years === 1 ? '1 year ago' : `${years} years ago`;
          }
        };
        
        return (
          <div className="flex flex-col">
            <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
              {lastVisit ? new Date(lastVisit).toLocaleDateString('pt-BR') : 'Never'}
            </span>
            {lastVisit && (
              <span className="text-xs text-neutral-500 mt-1">
                {getTimeAgo(lastVisit)}
              </span>
            )}
          </div>
        );
      },
      enableSorting: true,
      sortingFn: 'datetime',
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
        const professionalId = row.original.professional_id;
        const professional = professionals.find(p => p.id === professionalId);
        return (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
            {professional?.name || 'Unassigned'}
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
      accessorKey: 'created_at',
      id: 'createdAt',
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table}>
          Created At
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex flex-col">
            <span className="whitespace-nowrap text-body-medium font-body-medium text-default-font">
              {patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : 'N/A'}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: 'datetime',
    },
    {
      id: 'status',
      header: () => <span>Status</span>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-start">
            <Chips
              variant="success"
              size="large"
            >
              Active
            </Chips>
          </div>
        );
      },
      enableSorting: false,
      size: 120, // Set a fixed width for the status column
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex justify-end w-full">
          <span>Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const patient = row.original;
        
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
                  sideOffset={8}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem 
                      icon={<FeatherEye />}
                      onClick={() => router.push(`/patients/${patient.id}`)}
                    >
                      View Details
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem 
                      icon={<FeatherEdit2 />}
                      onClick={() => onEditPatient(patient)}
                    >
                      Edit
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem 
                      icon={<FeatherTrash />}
                      onClick={() => onDeletePatient(patient)}
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
      size: 60, // Minimum width for actions dropdown button
    },
  ], [professionals, onEditPatient, onDeletePatient, router]);
}