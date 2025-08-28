"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { Table } from "@/ui/components/Table";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import AddPatientModal from "@/ui/components/AddPatientModal";
import { FeatherChevronDown, FeatherComponent, FeatherEdit2, FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { supabase, Patient } from "@/lib/supabase";
import { useToast } from "../../contexts/ToastContext";

function PatientListing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const filterPatients = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = patients.filter(patient => {
      // Filter by name
      if (patient.name?.toLowerCase().includes(term)) return true;
      
      // Filter by ID
      if (patient.id?.toLowerCase().includes(term)) return true;
      
      // Filter by date of birth
      if (patient.date_of_birth) {
        const dob = new Date(patient.date_of_birth).toLocaleDateString('pt-BR');
        if (dob.includes(term)) return true;
      }
      
      return false;
    });
    
    setFilteredPatients(filtered);
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          professionals:professional_id(name),
          patient_groups:group_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAdded = () => {
    loadPatients();
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) {
      return `${diffInYears} ${diffInYears === 1 ? 'ano' : 'anos'} atrás`;
    } else if (diffInMonths > 0) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'} atrás`;
    } else if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return 'Hoje';
    }
  };

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 pr-3 py-3 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <div className="flex h-10 w-full flex-none items-center justify-between px-4 mobile:container mobile:max-w-none">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Patients
            </span>
          </div>
          <SegmentControl className="h-10 w-auto flex-none" variant="default">
            <SegmentControl.Item active={true}>
              Patient listing
            </SegmentControl.Item>
            <SegmentControl.Item active={false}>
              Patient groups
            </SegmentControl.Item>
          </SegmentControl>
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <Button
                disabled={false}
                variant="brand-primary"
                size="large"
                icon={<FeatherPlus />}
                iconRight={null}
                loading={false}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Add new
              </Button>
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
                    icon={<FeatherUser />}
                    onClick={() => setModalOpen(true)}
                  >
                    Add new patient
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherComponent />}>
                    Add new group
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
        
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <div className="flex w-full flex-wrap items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              <span className="text-body-medium text-neutral-600">
                {filteredPatients.length} de {patients.length} pacientes
              </span>
            </div>
            <div className="flex items-start gap-6">
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-tertiary"
                    iconRight={<FeatherChevronDown />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Sort by: A:Z
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
                      <DropdownMenu.DropdownItem>
                        Favorite
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                        Add
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
              
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-tertiary"
                    iconRight={<FeatherChevronDown />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    All professionals
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
                      <DropdownMenu.DropdownItem>
                        Favorite
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                        Add
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
            
            <TextField
              className="h-10 w-96 flex-none"
              label=""
              helpText=""
              icon={<FeatherSearch />}
              iconRight={searchTerm ? (
                <IconButton
                  variant="neutral-tertiary"
                  size="small"
                  icon={<FeatherX />}
                  onClick={() => setSearchTerm('')}
                />
              ) : null}
            >
              <TextField.Input
                placeholder="Search by patient name, ID, dob"
                value={searchTerm}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
              />
            </TextField>
          </div>
          
          <Table
            className="h-auto w-full flex-none overflow-auto"
            header={
              <Table.HeaderRow>
                <Table.HeaderCell>Patient</Table.HeaderCell>
                <Table.HeaderCell>Date of Birth</Table.HeaderCell>
                <Table.HeaderCell>Last Visit</Table.HeaderCell>
                <Table.HeaderCell>Professional</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.HeaderRow>
            }
          >
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <div className="flex items-center justify-center py-8">
                    <span>Carregando pacientes...</span>
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : filteredPatients.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <div className="flex items-center justify-center py-8">
                    <span>
                      {patients.length === 0 
                        ? 'Nenhum paciente encontrado. Clique em "Add new" para adicionar o primeiro paciente.'
                        : 'Nenhum paciente encontrado com os filtros aplicados.'
                      }
                    </span>
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredPatients.map((patient) => (
                <Table.Row key={patient.id} className="h-24 w-auto flex-none" clickable={true}>
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <div className="flex items-start gap-4">
                      <Avatar
                        size="large"
                        image={patient.avatar_url || undefined}
                        square={false}
                      >
                        {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                      </Avatar>
                      <div className="flex flex-col items-start gap-1">
                        <span className="whitespace-nowrap font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-neutral-700">
                          {patient.name}
                        </span>
                        <span className="whitespace-nowrap text-body-medium font-body-medium text-new-gray-50">
                          ID: {patient.id?.slice(0, 8) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </Table.Cell>
                  
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                      {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                  </Table.Cell>
                  
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <div className="flex flex-col items-start gap-1">
                      <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                      <span className="whitespace-nowrap text-body-small font-body-small text-neutral-500">
                        {patient.created_at ? getTimeAgo(new Date(patient.created_at)) : 'N/A'}
                      </span>
                    </div>
                  </Table.Cell>
                  
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                      {(patient as any).professionals?.name || 'Não atribuído'}
                    </span>
                  </Table.Cell>
                  
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <Chips icon={null} size="large">
                      {(patient as any).patient_groups?.name || 'Novo paciente'}
                    </Chips>
                  </Table.Cell>
                  
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <SubframeCore.DropdownMenu.Root>
                      <SubframeCore.DropdownMenu.Trigger asChild={true}>
                        <div className="flex grow shrink-0 basis-0 items-center justify-end">
                          <IconButton
                            size="medium"
                            icon={<FeatherMoreHorizontal />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          />
                        </div>
                      </SubframeCore.DropdownMenu.Trigger>
                      <SubframeCore.DropdownMenu.Portal>
                        <SubframeCore.DropdownMenu.Content
                          side="bottom"
                          align="end"
                          sideOffset={4}
                          asChild={true}
                        >
                          <DropdownMenu>
                            <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                              Edit patient
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                              Add to a group
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                              Delete patient
                            </DropdownMenu.DropdownItem>
                          </DropdownMenu>
                        </SubframeCore.DropdownMenu.Content>
                      </SubframeCore.DropdownMenu.Portal>
                    </SubframeCore.DropdownMenu.Root>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table>
        </div>
      </div>
      
      <AddPatientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onPatientAdded={handlePatientAdded}
      />
    </DefaultPageLayout>
  );
}

export default PatientListing;
