"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { PatientGroupCard } from "@/ui/components/PatientGroupCard";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import AddNewGroupModal from "@/components/custom/AddNewGroupModal";
import { useToast } from "../../contexts/ToastContext";
import { supabase, PatientGroup } from "@/lib/supabase";
import { FeatherComponent } from "@subframe/core";
import { FeatherCopy } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import * as SubframeCore from "@subframe/core";
import { FeatherUser } from "@subframe/core";

function PatientGroups() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState<PatientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<PatientGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Load groups from database with real patient counts
  const loadGroups = async () => {
    try {
      setLoading(true);
      
      // First, get all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('patient_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) {
        throw groupsError;
      }

      // Then, get patient counts for each group
      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count, error: countError } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          if (countError) {
            console.error(`Error counting patients for group ${group.name}:`, countError);
            return { ...group, patient_count: 0 };
          }

          return { ...group, patient_count: count || 0 };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading groups:', error);
      showError("Error", "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort groups
  const filteredGroups = (() => {
    // First filter by search term
    const filtered = groups.filter(group =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  useEffect(() => {
    loadGroups();
  }, []);

  const handleGroupClick = (groupName: string) => {
    // Converter o nome do grupo para formato URL (minuscula com hífens)
    const groupUrl = groupName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/patient-groups/${groupUrl}`);
  };

  const handleEditGroup = (group: PatientGroup) => {
    setEditingGroup(group);
    setGroupModalOpen(true);
  };

  const handleDuplicateGroup = async (group: PatientGroup) => {
    try {
      // Get all patients from the original group
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id')
        .eq('group_id', group.id);

      if (patientsError) throw patientsError;

      // Create the duplicate group
      const duplicateGroup = {
        name: `${group.name} (Copy)`,
        description: group.description,
        group_color: group.group_color,
        group_icon: group.group_icon,
        participants: group.participants,
        patient_count: group.patient_count
      };

      const { data: newGroup, error: groupError } = await supabase
        .from('patient_groups')
        .insert([duplicateGroup])
        .select()
        .single();

      if (groupError) throw groupError;

      // Update all patients to belong to the new group
      if (patients && patients.length > 0) {
        const { error: updateError } = await supabase
          .from('patients')
          .update({ group_id: newGroup.id })
          .in('id', patients.map(p => p.id));

        if (updateError) throw updateError;
      }

      loadGroups();
      showSuccess("Group duplicated", `Group "${duplicateGroup.name}" was created successfully!`);
    } catch (error) {
      console.error('Error duplicating group:', error);
      showError("Error", "Failed to duplicate group");
    }
  };

  const handleDeleteGroup = async (group: PatientGroup) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the group "${group.name}"?\n\nThis action cannot be undone. All patients in this group will be unassigned.`
    );

    if (!confirmDelete) return;

    try {
      // First, unassign all patients from this group
      const { error: unassignError } = await supabase
        .from('patients')
        .update({ group_id: null })
        .eq('group_id', group.id);

      if (unassignError) throw unassignError;

      // Then delete the group
      const { error: deleteError } = await supabase
        .from('patient_groups')
        .delete()
        .eq('id', group.id);

      if (deleteError) throw deleteError;

      loadGroups();
      showSuccess("Group deleted", `Group "${group.name}" was deleted successfully.`);
    } catch (error) {
      console.error('Error deleting group:', error);
      showError("Error", "Failed to delete group");
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
            <SegmentControl.Item
              active={false}
              onClick={() => router.push('/patients')}
            >
              Patient listing
            </SegmentControl.Item>
            <SegmentControl.Item active={true}>
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
            onClick={() => setGroupModalOpen(true)}
          >
            Create new group
          </Button>
        </div>
        
        {/* Filters Section */}
        <div className="flex w-full flex-wrap items-center justify-between px-8 pb-4">
            <div className="flex items-center gap-2">
              {/* Sort by dropdown */}
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-secondary"
                    size="large"
                    iconRight={<FeatherChevronDown />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
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
              className="h-10 w-96 flex-none !rounded-full [&>*]:!rounded-full [&_input]:!rounded-full"
              style={{ 
                borderRadius: '9999px',
              }}
              disabled={false}
              error={false}
              variant="filled"
              label=""
              helpText=""
              icon={null}
              iconRight={null}
            >
              <TextField.Input
                className="!rounded-full"
                style={{ borderRadius: '9999px' }}
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
              />
            </TextField>
        </div>
        
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 rounded-lg bg-default-background px-8 py-4 overflow-auto">
          <div className="w-full items-start gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              // Loading state
              <div className="col-span-4 flex items-center justify-center py-8">
                <span>Loading groups...</span>
              </div>
            ) : filteredGroups.length === 0 ? (
              // Empty state
              <div className="col-span-4 flex items-center justify-center py-8">
                <span>{groups.length === 0 ? 'No groups found. Click "Create new group" to create your first group.' : 'No groups match your search.'}</span>
              </div>
            ) : (
              // Dynamic groups
              filteredGroups.map((group) => (
                <PatientGroupCard
                  key={group.id}
                  title={group.name}
                  patientCount={`${group.patient_count || 0} ${(group.patient_count || 0) === 1 ? 'patient' : 'patients'}`}
                  onClick={() => handleGroupClick(group.name)}
                  groupColor={group.group_color as any}
                  groupIcon={group.group_icon as any}
                  menuActions={
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem 
                        icon={<FeatherEdit2 />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(group);
                        }}
                      >
                        Edit group
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem 
                        icon={<FeatherCopy />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateGroup(group);
                        }}
                      >
                        Duplicate group
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem 
                        icon={<FeatherTrash />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group);
                        }}
                      >
                        Delete
                      </DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      <AddNewGroupModal
        open={groupModalOpen}
        onOpenChange={(open) => {
          setGroupModalOpen(open);
          if (!open) {
            setEditingGroup(null); // Reset editing state when modal closes
          }
        }}
        editingGroup={editingGroup}
        onGroupAdded={(createdGroup) => {
          loadGroups(); // Reload groups to show the new one
          setEditingGroup(null); // Reset editing state
          showSuccess(
            editingGroup ? "Group updated" : "Group created", 
            `Group "${createdGroup.name}" ${editingGroup ? "updated" : "created"} successfully!`
          );
        }}
      />
    </DefaultPageLayout>
  );
}

export default PatientGroups;
