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
import { FeatherUser } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function PatientGroups() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState<PatientGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Load groups from database
  const loadGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      showError("Error", "Failed to load groups");
    } finally {
      setLoading(false);
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

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 bg-page-bg pr-3 py-3 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <div className="flex h-10 w-full flex-none items-center justify-between px-4 mobile:container mobile:max-w-none">
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
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <div className="w-full items-start gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              // Loading state
              <div className="col-span-4 flex items-center justify-center py-8">
                <span>Loading groups...</span>
              </div>
            ) : groups.length === 0 ? (
              // Empty state
              <div className="col-span-4 flex items-center justify-center py-8">
                <span>No groups found. Click &quot;Create new group&quot; to create your first group.</span>
              </div>
            ) : (
              // Dynamic groups
              groups.map((group) => (
                <PatientGroupCard
                  key={group.id}
                  title={group.name}
                  patientCount={`${group.patient_count || 0} patients`}
                  onClick={() => handleGroupClick(group.name)}
                  groupColor={group.group_color as any}
                  groupIcon={group.group_icon as any}
                  menuActions={
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                        Edit group
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                        Duplicate group
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
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
        onOpenChange={setGroupModalOpen}
        onGroupAdded={(createdGroup) => {
          loadGroups(); // Reload groups to show the new one
          showSuccess("Group created", `Group "${createdGroup.name}" created successfully!`);
        }}
      />
    </DefaultPageLayout>
  );
}

export default PatientGroups;
