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
import AddPatientModal from "@/components/custom/AddPatientModal";
import AddToGroupModal from "@/components/custom/AddToGroupModal";
import { FeatherChevronDown, FeatherComponent, FeatherEdit2, FeatherMoreHorizontal, FeatherArrowUp, FeatherArrowDown } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { supabase, Patient, Professional } from "@/lib/supabase";
import { useToast } from "../../contexts/ToastContext";
import { useRouter } from "next/navigation";
import { formatPatientNameForDisplay } from "@/app/scheduling/utils/nameUtils";

function PatientListing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [sortBy, setSortBy] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'created_at', direction: 'desc' });
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);
  const [selectedPatientForGroup, setSelectedPatientForGroup] = useState<Patient | null>(null);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadPatients();
    loadProfessionals();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, selectedProfessional, sortBy]);

  const filterPatients = () => {
    let filtered = patients;
    
    // Filter by professional
    if (selectedProfessional !== 'all') {
      filtered = filtered.filter(patient => patient.professional_id === selectedProfessional);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(patient => {
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
    }
    
    // Sort patients
    const sorted = [...filtered].sort((a, b) => {
      const { column, direction } = sortBy;
      let comparison = 0;
      
      switch (column) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'id':
          comparison = (a.id || '').localeCompare(b.id || '');
          break;
        case 'date_of_birth':
          comparison = new Date(a.date_of_birth || 0).getTime() - new Date(b.date_of_birth || 0).getTime();
          break;
        case 'professional_name':
          const aProfessional = professionals.find(p => p.id === a.professional_id);
          const bProfessional = professionals.find(p => p.id === b.professional_id);
          comparison = (aProfessional?.name || '').localeCompare(bProfessional?.name || '');
          break;
        case 'last_visit':
          comparison = new Date(a.last_visit || 0).getTime() - new Date(b.last_visit || 0).getTime();
          break;
        case 'created_at':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredPatients(sorted);
  };

  const handleSort = (column: string) => {
    setSortBy(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, specialty')
        .order('name', { ascending: true });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const handlePatientAdded = () => {
    loadPatients();
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setModalOpen(true);
  };

  const handleAddToGroup = (patient: Patient) => {
    setSelectedPatientForGroup(patient);
    setAddToGroupModalOpen(true);
  };

  const handleDeletePatient = async (patient: Patient) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the patient "${patient.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patient.id);

      if (error) throw error;

      loadPatients();
      showSuccess("Patient deleted", `Patient "${patient.name}" was deleted successfully.`);
    } catch (error) {
      console.error('Error deleting patient:', error);
      showError("Error", "Failed to delete patient");
    }
  };

  const getSortDisplayText = (sortOption: string) => {
    switch (sortOption) {
      case 'a-z': return 'A to Z';
      case 'z-a': return 'Z to A';
      case 'newest': return 'Newest to Oldest';
      case 'oldest': return 'Oldest to Newest';
      default: return 'A to Z';
    }
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
      <div className="flex h-full w-full flex-col items-start gap-4 bg-default-background shadow-md pb-3 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <div className="flex h-auto w-full flex-none items-center justify-between px-8 py-2 mobile:container mobile:max-w-none">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Patients
            </span>
          </div>
          <SegmentControl className="h-10 w-auto flex-none" variant="default">
            <SegmentControl.Item active={true}>
              Patient listing
            </SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/patient-groups')}
            >
              Patient groups
            </SegmentControl.Item>
          </SegmentControl>
          <Button
            disabled={false}
            variant="brand-primary"
            size="large"
            icon={<FeatherPlus />}
            iconRight={null}
            loading={false}
            onClick={() => setModalOpen(true)}
          >
            Create new patient
          </Button>
        </div>
        
        <div className="flex w-full flex-wrap items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-secondary"
                    size="large"
                    iconRight={<FeatherChevronDown />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    {selectedProfessional === 'all' 
                      ? 'All professionals' 
                      : professionals.find(p => p.id === selectedProfessional)?.name || 'All professionals'
                    }
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
                      <DropdownMenu.DropdownItem
                        onClick={() => setSelectedProfessional('all')}
                      >
                        All professionals
                      </DropdownMenu.DropdownItem>
                      {professionals.length === 0 ? (
                        <DropdownMenu.DropdownItem>
                          Carregando profissionais...
                        </DropdownMenu.DropdownItem>
                      ) : (
                        professionals.map((professional) => (
                          <DropdownMenu.DropdownItem
                            key={professional.id}
                            onClick={() => setSelectedProfessional(professional.id)}
                          >
                            {professional.name}
                          </DropdownMenu.DropdownItem>
                        ))
                      )}
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            </div>
            
            <TextField
              className="h-10 w-96 flex-none !rounded-full [&>*]:!rounded-full [&_input]:!rounded-full"
              style={{ 
                borderRadius: '9999px',
              }}
              variant="filled"
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
                className="!rounded-full"
                style={{ borderRadius: '9999px' }}
                placeholder="Search by patient name, ID, dob"
                value={searchTerm}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
              />
            </TextField>
        </div>
        
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <Table
            className="h-auto w-full flex-none overflow-auto"
            header={
              <Table.HeaderRow>
                <Table.HeaderCell className="group relative cursor-pointer hover:bg-neutral-50 transition-colors">
                  <div 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('name')}
                  >
                    <span>Patient</span>
                    {sortBy.column === 'name' && (
                      sortBy.direction === 'asc' ? 
                        <FeatherArrowUp className="w-4 h-4 text-neutral-600" /> : 
                        <FeatherArrowDown className="w-4 h-4 text-neutral-600" />
                    )}
                    {sortBy.column !== 'name' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FeatherArrowUp className="w-4 h-4 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </Table.HeaderCell>
                <Table.HeaderCell className="group relative cursor-pointer hover:bg-neutral-50 transition-colors">
                  <div 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('date_of_birth')}
                  >
                    <span>Date of Birth</span>
                    {sortBy.column === 'date_of_birth' && (
                      sortBy.direction === 'asc' ? 
                        <FeatherArrowUp className="w-4 h-4 text-neutral-600" /> : 
                        <FeatherArrowDown className="w-4 h-4 text-neutral-600" />
                    )}
                    {sortBy.column !== 'date_of_birth' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FeatherArrowUp className="w-4 h-4 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </Table.HeaderCell>
                <Table.HeaderCell className="group relative cursor-pointer hover:bg-neutral-50 transition-colors">
                  <div 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('last_visit')}
                  >
                    <span>Last Visit</span>
                    {sortBy.column === 'last_visit' && (
                      sortBy.direction === 'asc' ? 
                        <FeatherArrowUp className="w-4 h-4 text-neutral-600" /> : 
                        <FeatherArrowDown className="w-4 h-4 text-neutral-600" />
                    )}
                    {sortBy.column !== 'last_visit' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FeatherArrowUp className="w-4 h-4 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </Table.HeaderCell>
                <Table.HeaderCell className="group relative cursor-pointer hover:bg-neutral-50 transition-colors">
                  <div 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('professional_name')}
                  >
                    <span>Professional</span>
                    {sortBy.column === 'professional_name' && (
                      sortBy.direction === 'asc' ? 
                        <FeatherArrowUp className="w-4 h-4 text-neutral-600" /> : 
                        <FeatherArrowDown className="w-4 h-4 text-neutral-600" />
                    )}
                    {sortBy.column !== 'professional_name' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FeatherArrowUp className="w-4 h-4 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </Table.HeaderCell>
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
                          {formatPatientNameForDisplay(patient.name)}
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
                            <DropdownMenu.DropdownItem 
                              icon={<FeatherEdit2 />}
                              onClick={() => handleEditPatient(patient)}
                            >
                              Edit patient
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem 
                              icon={<FeatherPlus />}
                              onClick={() => handleAddToGroup(patient)}
                            >
                              Add to a group
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem 
                              icon={<FeatherTrash />}
                              onClick={() => handleDeletePatient(patient)}
                            >
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
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setEditingPatient(null); // Reset editing state when modal closes
          }
        }}
        editingPatient={editingPatient}
        onPatientAdded={() => {
          handlePatientAdded();
          setEditingPatient(null); // Reset editing state
        }}
      />
      
      <AddToGroupModal
        open={addToGroupModalOpen}
        onOpenChange={(open) => {
          setAddToGroupModalOpen(open);
          if (!open) {
            setSelectedPatientForGroup(null); // Reset patient selection when modal closes
          }
        }}
        patient={selectedPatientForGroup}
        onPatientUpdated={() => {
          loadPatients();
          setSelectedPatientForGroup(null); // Reset patient selection
        }}
      />
    </DefaultPageLayout>
  );
}

export default PatientListing;
