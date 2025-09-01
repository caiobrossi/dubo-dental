"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { Table } from "@/ui/components/Table";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherComponent } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherArrowLeft } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherSyringe } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherShield } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { useRouter } from "next/navigation";
import AddPatientModal from "@/components/custom/AddPatientModal";
import AddNewGroupModal from "@/components/custom/AddNewGroupModal";
import AddToGroupModal from "@/components/custom/AddToGroupModal";
import { useToast } from "@/contexts/ToastContext";
import { supabase, PatientGroup, Patient } from "@/lib/supabase";

interface GroupPageClientProps {
  groupName: string;
}

function GroupPageClient({ groupName }: GroupPageClientProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [group, setGroup] = useState<PatientGroup | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('a-z');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);
  const [selectedPatientForGroup, setSelectedPatientForGroup] = useState<Patient | null>(null);

  // Formatar o nome do grupo para exibição (remover hífens e capitalizar)
  const displayGroupName = groupName ? groupName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Group';

  // Load group data and associated patients
  const loadGroupData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading group with name:', displayGroupName);
      console.log('Original groupName from URL:', groupName);

      // First, find the group by name - try exact match first, then fuzzy match
      let groupData = null;
      let groupError = null;

      // Try exact match first (case-insensitive)
      const { data: exactMatch, error: exactError } = await supabase
        .from('patient_groups')
        .select('*')
        .ilike('name', displayGroupName)
        .single();

      if (exactMatch && !exactError) {
        groupData = exactMatch;
      } else {
        // Try fuzzy match if exact match fails
        const { data: fuzzyMatch, error: fuzzyError } = await supabase
          .from('patient_groups')
          .select('*')
          .ilike('name', `%${displayGroupName}%`);

        if (fuzzyMatch && fuzzyMatch.length > 0 && !fuzzyError) {
          groupData = fuzzyMatch[0]; // Take the first match
        } else {
          groupError = fuzzyError || new Error('Group not found');
        }
      }

      if (groupError || !groupData) {
        console.error('Error loading group:', groupError);
        console.log('Available groups:');
        // Let's see what groups are available
        const { data: allGroups } = await supabase
          .from('patient_groups')
          .select('id, name');
        console.log(allGroups);
        showError("Error", `Group "${displayGroupName}" not found`);
        return;
      }

      console.log('Found group:', groupData);
      setGroup(groupData);

      // Then, load patients associated with this group
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          *,
          professionals:professional_id(name)
        `)
        .eq('group_id', groupData.id);

      if (patientsError) {
        console.error('Error loading patients:', patientsError);
        showError("Error", "Failed to load patients");
        return;
      }

      console.log(`Found ${patientsData?.length || 0} patients for group ${groupData.id}`);
      console.log('Patients data:', patientsData);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error loading group data:', error);
      showError("Error", "Failed to load group data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupData();
  }, [groupName]);

  // Filter and sort patients
  const filteredPatients = (() => {
    // First filter by search term
    const filtered = patients.filter(patient =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.date_of_birth?.includes(searchTerm)
    );
    
    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'a-z':
          return (a.name || '').localeCompare(b.name || '');
        case 'z-a':
          return (b.name || '').localeCompare(a.name || '');
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        default:
          return 0;
      }
    });
    
    return sorted;
  })();

  // Handler functions for patient actions
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

      showSuccess("Patient deleted", `${patient.name} has been deleted successfully.`);
      loadGroupData(); // Reload the patient list
    } catch (error) {
      console.error('Error deleting patient:', error);
      showError("Error", "Failed to delete patient");
    }
  };

  // Get sort display text
  const getSortDisplayText = (sortOption: string) => {
    switch (sortOption) {
      case 'a-z': return 'A to Z';
      case 'z-a': return 'Z to A';
      case 'newest': return 'Newest to Oldest';
      case 'oldest': return 'Oldest to Newest';
      default: return 'A to Z';
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'users': return <FeatherUsers />;
      case 'user': return <FeatherUser />;
      case 'component': return <FeatherComponent />;
      case 'syringe': return <FeatherSyringe />;
      case 'star': return <FeatherStar />;
      case 'heart': return <FeatherHeart />;
      case 'shield': return <FeatherShield />;
      case 'settings': return <FeatherSettings />;
      default: return <FeatherUsers />;
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) {
      return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
    } else if (diffInMonths > 0) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    } else if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return 'Today';
    }
  };

  if (loading) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center">
          <span>Loading group data...</span>
        </div>
      </DefaultPageLayout>
    );
  }

  if (!group) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center">
          <span>Group not found</span>
        </div>
      </DefaultPageLayout>
    );
  }

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
            <SegmentControl.Item
              active={false}
              onClick={() => router.push('/patients')}
            >
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
            Add patient to group
          </Button>
        </div>
        
        {/* Group Header with Icon and Color */}
        <div className="flex w-full items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
          {/* Back button */}
          <IconButton
            size="large"
            variant="neutral-tertiary"
            icon={<FeatherArrowLeft />}
            onClick={() => router.push('/patient-groups')}
          />
          <div
            className="h-16 w-16 flex-none rounded-full flex items-center justify-center"
            style={{
              backgroundColor: (
                {
                  blue: "#3b82f6",
                  green: "#10b981",
                  red: "#ef4444",
                  yellow: "#f59e0b",
                  purple: "#8b5cf6",
                  orange: "#f97316",
                  pink: "#ec4899",
                  gray: "#6b7280",
                  indigo: "#6366f1",
                  teal: "#14b8a6",
                  cyan: "#06b6d4",
                  emerald: "#10b981",
                } as Record<string, string>
              )[group.group_color || "blue"] || "#3b82f6",
            }}
          >
            <div className="w-8 h-8 text-white">
              {getIconComponent(group.group_icon || 'users')}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600">{group.description || 'No description available'}</p>
            <p className="text-sm text-gray-500">{patients.length} patients in this group</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="large"
              variant="neutral-secondary"
              onClick={() => {
                console.log('Opening edit modal for group:', group);
                setGroupModalOpen(true);
              }}
            >
              Edit group
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-4">
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-tertiary"
                    size="large"
                    iconRight={<FeatherChevronDown />}
                    onClick={() => {}}
                  >
                    Sort by: {getSortDisplayText(sortBy)}
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
                        onClick={() => setSortBy('a-z')}
                      >
                        A to Z
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        onClick={() => setSortBy('z-a')}
                      >
                        Z to A
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        onClick={() => setSortBy('newest')}
                      >
                        Newest to Oldest
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        onClick={() => setSortBy('oldest')}
                      >
                        Oldest to Newest
                      </DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            </div>
            
            {/* Search field */}
            <TextField
              className="h-10 w-96 flex-none"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
              />
            </TextField>
        </div>
        
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          {filteredPatients.length === 0 ? (
            <div className="flex w-full items-center justify-center py-8">
              <span className="text-gray-500">
                {searchTerm ? 'No patients found matching your search' : 'No patients in this group yet'}
              </span>
            </div>
          ) : (
            <Table
              className="h-auto w-full flex-none overflow-auto"
              header={
                <Table.HeaderRow>
                  <Table.HeaderCell>Patient</Table.HeaderCell>
                  <Table.HeaderCell>Date of Birth</Table.HeaderCell>
                  <Table.HeaderCell>Last Visit</Table.HeaderCell>
                  <Table.HeaderCell>Professional</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.HeaderRow>
              }
            >
              {filteredPatients.map((patient) => (
                <Table.Row key={patient.id} className="h-24 w-auto flex-none" clickable={true}>
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <div className="flex items-center gap-3">
                                             <Avatar
                         className="h-12 w-12 flex-none"
                         size="large"
                       >
                         {patient.avatar_url ? (
                           <img src={patient.avatar_url} alt={patient.name || 'Patient'} className="w-full h-full object-cover rounded-full" />
                         ) : (
                           <FeatherUser />
                         )}
                       </Avatar>
                      <div className="flex flex-col items-start gap-1">
                        <span className="whitespace-nowrap font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-neutral-700">
                          {patient.name}
                        </span>
                        <span className="whitespace-nowrap text-body-medium font-body-medium text-new-gray-50">
                          ID: {patient.id?.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                      {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <div className="flex flex-col items-start gap-1">
                      <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="whitespace-nowrap text-body-small font-body-small text-neutral-500">
                        {patient.created_at ? getTimeAgo(new Date(patient.created_at)) : 'N/A'}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                      {patient.professional_id || 'Not assigned'}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-20 grow shrink-0 basis-0">
                    <Chips icon={null} size="large">
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
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table>
          )}
        </div>
      </div>

      <AddPatientModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingPatient(null);
        }}
        editingPatient={editingPatient}
        onPatientAdded={() => {
          loadGroupData(); // Reload group data to show updated patient
        }}
      />

      <AddNewGroupModal
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
        editingGroup={group}
        onGroupAdded={(updatedGroup) => {
          showSuccess("Group updated", `Group "${updatedGroup.name}" updated successfully!`);
          loadGroupData(); // Reload group data
        }}
      />

      <AddToGroupModal
        open={addToGroupModalOpen}
        onOpenChange={(open) => {
          setAddToGroupModalOpen(open);
          if (!open) setSelectedPatientForGroup(null);
        }}
        patient={selectedPatientForGroup}
        onPatientUpdated={() => {
          loadGroupData(); // Reload group data to show updated patient
        }}
      />
    </DefaultPageLayout>
  );
}

export default GroupPageClient;
