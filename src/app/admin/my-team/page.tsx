"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherPlus } from "@subframe/core";
import { useRouter } from "next/navigation";
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { Table } from "@/ui/components/Table";
import { FeatherEdit2, FeatherMoreHorizontal, FeatherStar, FeatherTrash } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import AddProfessionalModal from "@/components/custom/AddProfessionalModal";
import { supabase, Professional } from "@/lib/supabase";

function MyTeam() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched professionals:', data); // Debug log
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleProfessionalAdded = () => {
    fetchProfessionals();
  };

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start bg-default-background">
        {/* Fixed Header */}
        <div className="flex w-full flex-col items-center bg-white/80 backdrop-blur-md px-8 py-3 border-b border-neutral-border/50">
          <div className="flex w-full items-start justify-between px-2 py-2">
            <div className="flex items-center gap-4">
              <Avatar
                size="large"
                image="https://res.cloudinary.com/subframe/image/upload/v1711417549/shared/jtjkdxvy1mm2ozvaymwv.png"
              >
                A
              </Avatar>
              <span className="text-heading-1 font-heading-1 text-default-font">
                Clinic Up
              </span>
            </div>
            <Button
              disabled={false}
              variant="neutral-secondary"
              size="medium"
              icon={<FeatherPlus />}
              iconRight={null}
              loading={false}
              onClick={() => setIsModalOpen(true)}
            >
              Add Team Member
            </Button>
          </div>
          <SegmentControl
            className="h-10 w-auto flex-none"
            variant="default"
            variant2="default"
          >
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin')}
            >
              Clinic Info
            </SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin/chairs-rooms')}
            >
              Chairs and Rooms
            </SegmentControl.Item>
            <SegmentControl.Item active={true}>My team</SegmentControl.Item>
            <SegmentControl.Item active={false}>Schedule shifts</SegmentControl.Item>
            <SegmentControl.Item active={false}>Team payment</SegmentControl.Item>
            <SegmentControl.Item active={false}>Finance</SegmentControl.Item>
          </SegmentControl>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-12 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <div className="flex w-full max-w-[1200px] grow shrink-0 basis-0 items-start gap-8 px-4 pt-6">
            {/* Table Content */}
            <div className="flex w-full flex-col items-start gap-6">
              <Table
                className="h-auto w-full flex-none"
                header={
                  <Table.HeaderRow>
                    <Table.HeaderCell>Professional</Table.HeaderCell>
                    <Table.HeaderCell>Phone</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.HeaderRow>
                }
              >
                {professionals.length === 0 ? (
                  <Table.Row className="h-24 w-auto flex-none">
                    <Table.Cell colSpan={5} className="text-center text-subtext-color">
                      No professionals found. Click "Add Team Member" to get started.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  professionals.map((professional) => (
                    <Table.Row key={professional.id} className="h-24 w-auto flex-none" clickable={true}>
                      <Table.Cell className="h-20 grow shrink-0 basis-0">
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
                      </Table.Cell>
                      <Table.Cell className="h-20 grow shrink-0 basis-0">
                        <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                          {professional.mobile || 'Not provided'}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="h-20 grow shrink-0 basis-0">
                        <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                          {professional.email || 'Not provided'}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="h-20 grow shrink-0 basis-0">
                        <Chips variant="success" icon={null} size="large">
                          Active
                        </Chips>
                      </Table.Cell>
                      <Table.Cell className="h-20 grow shrink-0 basis-0">
                        <div className="flex grow shrink-0 basis-0 items-center justify-end">
                          <SubframeCore.DropdownMenu.Root>
                            <SubframeCore.DropdownMenu.Trigger asChild={true}>
                              <IconButton
                                size="medium"
                                icon={<FeatherMoreHorizontal />}
                                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
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
                                  <DropdownMenu.DropdownItem icon={<FeatherStar />}>
                                    Favorite
                                  </DropdownMenu.DropdownItem>
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
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table>
            </div>
          </div>
        </div>
      </div>
      
      <AddProfessionalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onProfessionalAdded={handleProfessionalAdded}
      />
    </DefaultPageLayout>
  );
}

export default MyTeam;