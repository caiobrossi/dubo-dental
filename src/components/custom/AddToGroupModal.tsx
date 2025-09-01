"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";

import { FeatherX } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { useToast } from "@/contexts/ToastContext";
import { supabase, Patient, PatientGroup } from "@/lib/supabase";

interface AddToGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onPatientUpdated?: () => void;
  showToast?: boolean;
}

function AddToGroupModal({ open, onOpenChange, patient, onPatientUpdated, showToast = true }: AddToGroupModalProps) {
  const [groups, setGroups] = useState<PatientGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const { showSuccess, showError } = useToast();

  // Load groups from database
  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_groups')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  useEffect(() => {
    if (open) {
      loadGroups();
      loadPatientGroups();
    }
  }, [open, patient]);

  // Load patient's current group memberships
  const loadPatientGroups = async () => {
    if (!patient?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_group_memberships')
        .select('group_id')
        .eq('patient_id', patient.id);

      if (error) throw error;
      
      const groupIds = data?.map(membership => membership.group_id) || [];
      setSelectedGroups(groupIds);
    } catch (error) {
      console.error('Error loading patient groups:', error);
      // Fallback to old single group system
      if (patient?.group_id) {
        setSelectedGroups([patient.group_id]);
      } else {
        setSelectedGroups([]);
      }
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSave = async () => {
    if (!patient) return;

    setLoading(true);
    
    try {
      // First, remove all existing memberships for this patient
      const { error: deleteError } = await supabase
        .from('patient_group_memberships')
        .delete()
        .eq('patient_id', patient.id);

      if (deleteError) throw deleteError;

      // Then, add new memberships for selected groups
      if (selectedGroups.length > 0) {
        const memberships = selectedGroups.map(groupId => ({
          patient_id: patient.id,
          group_id: groupId
        }));

        const { error: insertError } = await supabase
          .from('patient_group_memberships')
          .insert(memberships);

        if (insertError) throw insertError;
      }

      // Also update the legacy group_id for backwards compatibility (use first selected group)
      const legacyGroupId = selectedGroups.length > 0 ? selectedGroups[0] : null;
      const { error: legacyError } = await supabase
        .from('patients')
        .update({ group_id: legacyGroupId })
        .eq('id', patient.id);

      if (legacyError) throw legacyError;

      // Show success message (only if showToast is true)
      if (showToast) {
        if (selectedGroups.length > 0) {
          const groupNames = selectedGroups
            .map(groupId => groups.find(g => g.id === groupId)?.name)
            .filter(Boolean)
            .join(', ');
          showSuccess(
            "Joined groups successfully", 
            `${patient.name} has joined: ${groupNames}`
          );
        } else {
          showSuccess(
            "Removed from all groups", 
            `${patient.name} has been removed from all groups.`
          );
        }
      }
      
      onPatientUpdated?.();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error updating patient groups:', error);
      if (showToast) {
        showError("Error", "Failed to update patient groups");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={() => onOpenChange(false)}
      >
        {/* Modal */}
        <div
          className="flex h-[70vh] w-[500px] max-w-[90vw] flex-col bg-white rounded-lg overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="flex w-full flex-none items-center justify-between border-b border-solid border-neutral-border px-6 py-4 bg-white/30 backdrop-blur-md">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Add to a Group
            </span>
            <IconButton
              size="small"
              icon={<FeatherX />}
              onClick={() => onOpenChange(false)}
            />
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {groups.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-6">
                <p className="text-body-medium text-neutral-600">
                  No groups available. Create a group first.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="flex flex-col gap-3">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedGroups.includes(group.id || '')
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                      onClick={() => handleGroupToggle(group.id || '')}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{
                            backgroundColor: ({
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
                            } as Record<string, string>)[group.group_color || "blue"] || "#3b82f6"
                          }}
                        />
                        <span className="text-body-medium font-medium text-default-font">
                          {group.name}
                        </span>
                      </div>
                      
                      <div className={`h-5 w-5 rounded border-2 transition-colors ${
                        selectedGroups.includes(group.id || '')
                          ? 'border-brand-600 bg-brand-600'
                          : 'border-neutral-300'
                      }`}>
                        {selectedGroups.includes(group.id || '') && (
                          <svg className="h-full w-full text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="flex w-full flex-none items-center justify-end gap-3 border-t border-solid border-neutral-border px-6 py-4 bg-white/30 backdrop-blur-md">
            <Button
              variant="neutral-tertiary"
              size="large"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="brand-primary"
              size="large"
              loading={loading}
              onClick={handleSave}
            >
              {loading ? "Saving..." : "Save Groups"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddToGroupModal;
