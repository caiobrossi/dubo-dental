"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherX, FeatherUsers, FeatherUser, FeatherComponent, FeatherSyringe, FeatherStar, FeatherHeart, FeatherShield, FeatherSettings, FeatherCheck, FeatherTrash } from "@subframe/core";
import { useToast } from "@/contexts/ToastContext";
import { supabase, PatientGroup, Patient } from "@/lib/supabase";

interface AddNewGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupAdded?: (group: PatientGroup) => void;
  editingGroup?: PatientGroup | null; // Group to edit (null for create mode)
}

function AddNewGroupModal({ open, onOpenChange, onGroupAdded, editingGroup }: AddNewGroupModalProps) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    groupName: '',
    groupColor: '',
    groupIcon: '',
    participants: ''
  });
  const [loading, setLoading] = useState(false);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const clearForm = () => {
    setFormData({
      groupName: '',
      groupColor: '',
      groupIcon: '',
      participants: ''
    });
    setSelectedPatientIds([]);
    setPatientSearchTerm('');
    setDropdownOpen(false);
  };

  // Load all patients for selection
  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAllPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Filter patients based on search term
  const filteredPatients = allPatients.filter(patient =>
    patient.name?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.id?.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  // Toggle patient selection
  const togglePatientSelection = (patientId: string) => {
    setSelectedPatientIds(prev => {
      const isSelected = prev.includes(patientId);
      if (isSelected) {
        return prev.filter(id => id !== patientId);
      } else {
        return [...prev, patientId];
      }
    });
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
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

  // Load patients when modal opens
  React.useEffect(() => {
    if (open) {
      loadPatients();
    }
  }, [open]);

  // Load group data when editing
  React.useEffect(() => {
    if (open && editingGroup) {
      // Populate form with existing group data
      setFormData({
        groupName: editingGroup.name || '',
        groupColor: editingGroup.group_color || '',
        groupIcon: editingGroup.group_icon || '',
        participants: ''
      });

      // Load patients associated with this group
      const loadGroupPatients = async () => {
        try {
          const { data: groupPatients, error } = await supabase
            .from('patients')
            .select('id')
            .eq('group_id', editingGroup.id);

          if (error) throw error;
          
          const patientIds = groupPatients?.map(p => p.id).filter(Boolean) || [];
          setSelectedPatientIds(patientIds);
        } catch (error) {
          console.error('Error loading group patients:', error);
        }
      };

      loadGroupPatients();
    } else if (open && !editingGroup) {
      // Clear form for create mode
      clearForm();
    }
  }, [open, editingGroup]);

  const handleDeleteGroup = async () => {
    if (!editingGroup) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the group "${editingGroup.name}"? This action cannot be undone. All patients will be removed from this group but will remain in the system.`
    );

    if (!confirmDelete) return;

    setLoading(true);

    try {
      // First, remove all patient associations with this group
      await supabase
        .from('patients')
        .update({ group_id: null })
        .eq('group_id', editingGroup.id);

      // Then delete the group
      const { error } = await supabase
        .from('patient_groups')
        .delete()
        .eq('id', editingGroup.id);

      if (error) throw error;

      console.log('Group deleted successfully');

      // Close modal and reset form
      onOpenChange(false);
      clearForm();

      // Show success message
      showSuccess("Group deleted", `Group "${editingGroup.name}" has been deleted successfully.`);

      // Navigate back to groups list
      if (onGroupAdded) {
        // We use the same callback but pass a dummy object to trigger parent refresh
        onGroupAdded(editingGroup);
      }

      // Navigate to groups page
      window.location.href = '/patient-groups';
    } catch (error) {
      console.error('Error deleting group:', error);
      showError("Error", "Failed to delete group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.groupName.trim()) {
      showError("Error", "Group name is required");
      return;
    }

    if (selectedPatientIds.length === 0) {
      showError("Error", "Please select at least one patient for the group");
      return;
    }

    setLoading(true);

    try {
      const isEditing = !!editingGroup;
      let resultData: PatientGroup;

      if (isEditing) {
        // Update existing group
        const groupData = {
          name: formData.groupName.trim(),
          group_color: formData.groupColor || 'blue',
          group_icon: formData.groupIcon || 'users',
          patient_count: selectedPatientIds.length,
          description: editingGroup?.description || `Group updated on ${new Date().toLocaleDateString()}`,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('patient_groups')
          .update(groupData)
          .eq('id', editingGroup!.id)
          .select()
          .single();

        if (error) throw error;
        resultData = data;

        console.log('Group updated successfully:', data);

        // First, remove all existing associations for this group
        await supabase
          .from('patients')
          .update({ group_id: null })
          .eq('group_id', editingGroup!.id);

        // Then add the new associations
        if (selectedPatientIds.length > 0) {
          const { error: updateError } = await supabase
            .from('patients')
            .update({ group_id: editingGroup!.id })
            .in('id', selectedPatientIds);

          if (updateError) {
            console.error('Error updating patient associations:', updateError);
          }
        }
      } else {
        // Create new group
        const groupData: PatientGroup = {
          name: formData.groupName.trim(),
          group_color: formData.groupColor || 'blue',
          group_icon: formData.groupIcon || 'users',
          patient_count: selectedPatientIds.length,
          description: `Group created on ${new Date().toLocaleDateString()} with ${selectedPatientIds.length} patients`
        };

        const { data, error } = await supabase
          .from('patient_groups')
          .insert([groupData])
          .select()
          .single();

        if (error) throw error;
        resultData = data;

        console.log('Group created successfully:', data);

        // Associate selected patients with the new group
        if (selectedPatientIds.length > 0 && data?.id) {
          const { error: updateError } = await supabase
            .from('patients')
            .update({ group_id: data.id })
            .in('id', selectedPatientIds);

          if (updateError) {
            console.error('Error associating patients with group:', updateError);
          }
        }
      }

      // Close modal and reset form
      onOpenChange(false);
      clearForm();

      // Notify parent component
      if (onGroupAdded) {
        onGroupAdded(resultData);
      }
    } catch (error) {
      console.error(`Error ${editingGroup ? 'updating' : 'creating'} group:`, error);
      showError("Error", `Failed to ${editingGroup ? 'update' : 'create'} group. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const groupColors = [
    { value: 'blue', label: 'Blue', hex: '#3b82f6' },
    { value: 'green', label: 'Green', hex: '#10b981' },
    { value: 'red', label: 'Red', hex: '#ef4444' },
    { value: 'yellow', label: 'Yellow', hex: '#f59e0b' },
    { value: 'purple', label: 'Purple', hex: '#8b5cf6' },
    { value: 'orange', label: 'Orange', hex: '#f97316' },
    { value: 'pink', label: 'Pink', hex: '#ec4899' },
    { value: 'gray', label: 'Gray', hex: '#6b7280' },
    { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
    { value: 'teal', label: 'Teal', hex: '#14b8a6' },
    { value: 'cyan', label: 'Cyan', hex: '#06b6d4' },
    { value: 'emerald', label: 'Emerald', hex: '#10b981' }
  ];

  const groupIcons = [
    { value: 'users', label: 'Users', icon: 'users' },
    { value: 'user', label: 'User', icon: 'user' },
    { value: 'component', label: 'Component', icon: 'component' },
    { value: 'syringe', label: 'Medical', icon: 'syringe' },
    { value: 'star', label: 'Star', icon: 'star' },
    { value: 'heart', label: 'Heart', icon: 'heart' },
    { value: 'shield', label: 'Shield', icon: 'shield' },
    { value: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex w-144 flex-col items-start bg-page-bg mobile:h-auto mobile:w-96 max-h-[95vh] overflow-y-auto">
        <div className="flex w-full grow shrink-0 basis-0 items-center justify-between border-b border-solid border-neutral-border bg-default-background px-4 py-4">
          <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
            {editingGroup ? 'Edit Group Information' : 'Create group'}
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-8 px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Group name *
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={loading}
                error={false}
                label=""
                helpText=""
                icon={null}
              >
                <TextField.Input
                  placeholder="Enter group name"
                  value={formData.groupName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData(prev => ({ ...prev, groupName: event.target.value }));
                  }}
                />
              </TextField>
            </div>
            <div className="flex w-full grow shrink-0 basis-0 items-start justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Participants
              </span>
              <div className="grow shrink-0 basis-0">
                <div className="relative">
                  {/* Dropdown trigger */}
                  <div
                    ref={triggerRef}
                    onClick={handleDropdownToggle}
                    className={`w-full h-10 px-3 py-2 border border-gray-300 rounded-sm cursor-pointer flex items-center justify-between bg-white hover:border-gray-400 ${
                      dropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FeatherUsers className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {selectedPatientIds.length === 0 
                          ? 'Select patients...' 
                          : `${selectedPatientIds.length} patient${selectedPatientIds.length !== 1 ? 's' : ''} selected`
                        }
                      </span>
                    </div>
                    <div className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Dropdown content - now inside modal */}
                  {dropdownOpen && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 flex flex-col"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      {/* Search input inside dropdown */}
                      <div className="p-3 border-b border-gray-100">
                        <TextField
                          className="h-8 w-full"
                          disabled={loadingPatients}
                          error={false}
                          label=""
                          helpText=""
                          icon={null}
                        >
                          <TextField.Input
                            placeholder="Search patients..."
                            value={patientSearchTerm}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              setPatientSearchTerm(event.target.value);
                            }}
                          />
                        </TextField>
                      </div>

                      {/* Patients list */}
                      <div className="flex-1 overflow-y-auto">
                        {loadingPatients ? (
                          <div className="p-4 text-center text-subtext-color">
                            Loading patients...
                          </div>
                        ) : filteredPatients.length === 0 ? (
                          <div className="p-4 text-center text-subtext-color">
                            {patientSearchTerm ? 'No patients found' : 'No patients available'}
                          </div>
                        ) : (
                          filteredPatients.map((patient) => {
                            const isSelected = selectedPatientIds.includes(patient.id || '');
                            return (
                              <div
                                key={patient.id}
                                onClick={() => togglePatientSelection(patient.id || '')}
                                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 last:border-b-0 hover:bg-gray-50 ${
                                  isSelected ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && <FeatherCheck className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{patient.name}</div>
                                  <div className="text-sm text-gray-500 truncate">ID: {patient.id?.slice(0, 8)}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer with count only - removed Select all and Clear buttons */}
                      {filteredPatients.length > 0 && (
                        <div className="p-3 border-t border-gray-100 flex justify-center items-center bg-gray-50">
                          <div className="text-sm text-gray-600">
                            {selectedPatientIds.length} of {allPatients.length} selected
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Click outside to close dropdown */}
                {dropdownOpen && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                )}
              </div>
            </div>
            <div className="flex w-full grow shrink-0 basis-0 items-start justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Group color
              </span>
              <div className="grow shrink-0 basis-0">
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {groupColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, groupColor: color.value }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        formData.groupColor === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
                {formData.groupColor && (
                  <div className="text-sm text-subtext-color">
                    Selected: {groupColors.find(c => c.value === formData.groupColor)?.label}
                  </div>
                )}
              </div>
            </div>
            <div className="flex w-full grow shrink-0 basis-0 items-start justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Group icon
              </span>
              <div className="grow shrink-0 basis-0">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {groupIcons.map(icon => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, groupIcon: icon.value }))}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 hover:bg-gray-50 ${
                        formData.groupIcon === icon.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                      title={icon.label}
                    >
                      <div className="text-gray-700 mb-1">
                        {getIconComponent(icon.icon)}
                      </div>
                      <div className="text-xs text-gray-600">{icon.label}</div>
                    </button>
                  ))}
                </div>
                {formData.groupIcon && (
                  <div className="text-sm text-subtext-color">
                    Selected: {groupIcons.find(i => i.value === formData.groupIcon)?.label}
                  </div>
                )}
              </div>
            </div>

          </div>
          
          {/* Buttons section - same row */}
          <div className="flex w-full gap-4">
            {editingGroup && (
              <Button
                className="h-10 flex-1"
                disabled={loading}
                variant="destructive-secondary"
                size="large"
                icon={<FeatherTrash />}
                iconRight={null}
                loading={false}
                type="button"
                onClick={handleDeleteGroup}
              >
                Delete group
              </Button>
            )}
            
            <Button
              className={`h-10 ${editingGroup ? 'flex-1' : 'w-full'}`}
              disabled={loading}
              variant="brand-primary"
              size="large"
              icon={null}
              iconRight={null}
              loading={loading}
              type="submit"
            >
              {loading ? (editingGroup ? "Updating..." : "Creating...") : (editingGroup ? "Update group" : "Create new group")}
            </Button>
          </div>
        </form>
      </div>

    </DialogLayout>
  );
}

export default AddNewGroupModal;
