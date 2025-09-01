import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Professional } from "@/lib/supabase";
import { Avatar } from "@/ui/components/Avatar";
import { Chips } from "@/ui/components/Chips";
import { IconButton } from "@/ui/components/IconButton";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { FeatherEdit2, FeatherMoreHorizontal, FeatherStar, FeatherTrash } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { SortableHeader } from "@/ui/components/SortableHeader";

export interface ProfessionalRowData extends Professional {}

interface UseProfessionalColumnsProps {
  onEditProfessional: (professional: Professional) => void;
  onDeleteProfessional: (professional: Professional) => void;
}

export function useProfessionalColumns({
  onEditProfessional,
  onDeleteProfessional,
}: UseProfessionalColumnsProps): ColumnDef<ProfessionalRowData>[] {
  
  return useMemo<ColumnDef<ProfessionalRowData>[]>(
    () => [
      {
        id: 'professional',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Professional
          </SortableHeader>
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => {
          const professional = row.original;
          return (
            <div className="flex items-start gap-4">
              <Avatar
                size="large"
                image={professional.avatar_url || undefined}
                square={false}
              >
                {professional.name.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex flex-col items-start gap-1">
                <span className="whitespace-nowrap font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-neutral-700">
                  {professional.name}
                </span>
                <span className="whitespace-nowrap text-body-medium font-body-medium text-new-gray-50">
                  {professional.role || professional.specialty || 'General Dentist'}
                </span>
              </div>
            </div>
          );
        },
        size: 350,
        minSize: 300,
      },
      {
        id: 'phone',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Phone
          </SortableHeader>
        ),
        accessorFn: (row) => row.mobile,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
            {row.original.mobile || 'Not provided'}
          </span>
        ),
        size: 180,
      },
      {
        id: 'email',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Email
          </SortableHeader>
        ),
        accessorFn: (row) => row.email,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
            {row.original.email || 'Not provided'}
          </span>
        ),
        size: 280,
      },
      {
        id: 'specialty',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Specialty
          </SortableHeader>
        ),
        accessorFn: (row) => row.specialty,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
            {row.original.specialty || 'General Dentist'}
          </span>
        ),
        size: 200,
      },
      {
        id: 'status',
        header: 'Status',
        cell: () => (
          <Chips variant="success" icon={null} size="large">
            Active
          </Chips>
        ),
        size: 100,
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const professional = row.original;
          return (
            <div className="flex items-center justify-end w-full">
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <IconButton
                    size="medium"
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
                        icon={<FeatherStar />}
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement favorite functionality
                        }}
                      >
                        Favorite
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem 
                        icon={<FeatherEdit2 />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProfessional(professional);
                        }}
                      >
                        Edit
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem 
                        icon={<FeatherTrash />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProfessional(professional);
                        }}
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
        size: 60,
        minSize: 60,
        maxSize: 60,
        enableSorting: false,
      },
    ],
    [onEditProfessional, onDeleteProfessional]
  );
}