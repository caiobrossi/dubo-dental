"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherX, FeatherCheck, FeatherChevronDown } from "@subframe/core";
import { useToast } from "@/contexts/ToastContext";
import { supabase, Professional } from "@/lib/supabase";

interface ChairRoom {
  id?: string;
  name: string;
  type: 'chair' | 'room';
  assigned_professionals: string[]; // Array of professional IDs
  created_at?: string;
  updated_at?: string;
}

interface AddChairRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChairRoomAdded?: (chairRoom: ChairRoom) => void;
  editingChairRoom?: ChairRoom | null;
}

function AddChairRoomModal({ open, onOpenChange, onChairRoomAdded, editingChairRoom }: AddChairRoomModalProps) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    roomName: '',
    roomType: 'chair' as 'chair' | 'room'
  });
  const [loading, setLoading] = useState(false);
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<string[]>([]);
  const [professionalSearchTerm, setProfessionalSearchTerm] = useState('');

  // Function to capitalize text
  const capitalizeText = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const clearForm = () => {
    setFormData({
      roomName: '',
      roomType: 'chair'
    });
    setSelectedProfessionalIds([]);
    setProfessionalSearchTerm('');
    setDropdownOpen(false);
  };

  // Load all professionals for selection
  const loadProfessionals = async () => {
    try {
      setLoadingProfessionals(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAllProfessionals(data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
      showError("Error", "Failed to load professionals");
    } finally {
      setLoadingProfessionals(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  // Load professionals when modal opens
  useEffect(() => {
    if (open) {
      loadProfessionals();
      
      // If editing, populate form
      if (editingChairRoom) {
        setFormData({
          roomName: editingChairRoom.name,
          roomType: editingChairRoom.type
        });
        setSelectedProfessionalIds(editingChairRoom.assigned_professionals || []);
      }
    } else {
      // Reset form when modal closes
      if (!editingChairRoom) {
        clearForm();
      }
    }
  }, [open, editingChairRoom]);

  // Filter professionals based on search term
  const filteredProfessionals = allProfessionals.filter(professional =>
    professional.name.toLowerCase().includes(professionalSearchTerm.toLowerCase()) ||
    (professional.specialty && professional.specialty.toLowerCase().includes(professionalSearchTerm.toLowerCase()))
  );

  // Get selected professionals for display
  const selectedProfessionals = allProfessionals.filter(professional => 
    selectedProfessionalIds.includes(professional.id)
  );

  const handleProfessionalToggle = (professionalId: string) => {
    setSelectedProfessionalIds(prev => {
      if (prev.includes(professionalId)) {
        return prev.filter(id => id !== professionalId);
      } else {
        return [...prev, professionalId];
      }
    });
  };

  const handleSave = async () => {
    if (!formData.roomName.trim()) {
      showError("Error", "Room name is required");
      return;
    }

    if (selectedProfessionalIds.length === 0) {
      showError("Error", "Please assign at least one professional");
      return;
    }

    try {
      setLoading(true);

      const chairRoomData = {
        name: capitalizeText(formData.roomName.trim()),
        type: formData.roomType,
        assigned_professionals: selectedProfessionalIds
      };

      let result;
      if (editingChairRoom) {
        // Update existing chair/room
        result = await supabase
          .from('chairs_rooms')
          .update(chairRoomData)
          .eq('id', editingChairRoom.id)
          .select()
          .single();
      } else {
        // Create new chair/room
        result = await supabase
          .from('chairs_rooms')
          .insert([chairRoomData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      onChairRoomAdded?.(result.data);
      showSuccess(
        editingChairRoom ? "Chair/Room Updated" : "Chair/Room Created", 
        `${formData.roomType === 'chair' ? 'Chair' : 'Room'} "${formData.roomName}" ${editingChairRoom ? 'updated' : 'created'} successfully!`
      );
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving chair/room:', error);
      showError("Error", `Failed to ${editingChairRoom ? 'update' : 'create'} chair/room`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full flex-col items-start bg-transparent relative" style={{ width: '580px', maxWidth: '580px', minWidth: '580px' }}>
        {/* Header */}
        <div className="flex w-full shrink-0 items-center justify-between border-b border-solid border-neutral-border bg-white/50 backdrop-blur px-4 py-4 sticky top-0 z-10">
          <span className="text-heading-2 font-heading-2 text-default-font">
            {editingChairRoom ? 'Edit' : 'Add new'} {formData.roomType}
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        {/* Content */}
        <div className="flex w-full grow items-start gap-6 bg-transparent px-6 py-6 pb-24 overflow-visible">
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center gap-4">
                <span className="w-32 flex-none text-body-medium font-body-medium text-subtext-color">
                  Name
                </span>
                <TextField
                  className="grow shrink-0 basis-0"
                  style={{ height: '40px' }}
                  disabled={false}
                  error={false}
                  variant="filled"
                  label=""
                  helpText=""
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input
                    placeholder={`Enter ${formData.roomType} name`}
                    value={formData.roomName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, roomName: event.target.value }))
                    }
                  />
                </TextField>
              </div>

                <div className="flex w-full items-center gap-4">
                  <span className="w-32 flex-none text-body-medium font-body-medium text-subtext-color">
                    Assigned Professionals
                  </span>
                  
                  {/* Custom Multi-Select Dropdown */}
                  <div 
                    className="relative grow shrink-0 basis-0" 
                    ref={triggerRef}
                  >
                    <div
                      className="flex min-h-10 w-full cursor-pointer items-start justify-between bg-neutral-100 px-3 py-2 hover:bg-neutral-200 focus-within:!bg-white transition-colors"
                      style={{ borderRadius: '8px', minHeight: '40px' }}
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <div className="flex flex-wrap gap-1 min-w-0 flex-1">
                        {selectedProfessionals.length === 0 ? (
                          <span className="text-body-medium text-neutral-500">Select professionals...</span>
                        ) : (
                          selectedProfessionals.map(professional => (
                            <div
                              key={professional.id}
                              className="flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-1 flex-shrink-0"
                            >
                              <span className="text-body-small text-white whitespace-nowrap">{professional.name}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProfessionalToggle(professional.id);
                                }}
                                className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-neutral-700 flex-shrink-0"
                              >
                                <FeatherX className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex items-center pt-1">
                        <FeatherChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 z-[9999] mt-1 w-full bg-white shadow-xl" style={{ borderRadius: '8px' }}>
                        {/* Search */}
                        <div className="p-2 border-b border-neutral-200">
                          <TextField
                            className="h-8 w-full"
                            disabled={false}
                            error={false}
                            variant="filled"
                            label=""
                            helpText=""
                            icon={null}
                            iconRight={null}
                          >
                            <TextField.Input
                              placeholder="Search professionals..."
                              value={professionalSearchTerm}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                                setProfessionalSearchTerm(event.target.value)
                              }
                            />
                          </TextField>
                        </div>

                        {/* Professional List */}
                        <div className="max-h-60 overflow-y-auto">
                          {loadingProfessionals ? (
                            <div className="flex items-center justify-center py-4">
                              <span className="text-body-small text-neutral-500">Loading professionals...</span>
                            </div>
                          ) : filteredProfessionals.length === 0 ? (
                            <div className="flex items-center justify-center py-4">
                              <span className="text-body-small text-neutral-500">No professionals found</span>
                            </div>
                          ) : (
                            filteredProfessionals.map(professional => (
                              <div
                                key={professional.id}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 cursor-pointer"
                                onClick={() => handleProfessionalToggle(professional.id)}
                              >
                                <div className="flex h-4 w-4 items-center justify-center">
                                  {selectedProfessionalIds.includes(professional.id) && (
                                    <FeatherCheck className="h-3 w-3 text-neutral-800" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-body-medium text-default-font">{professional.name}</span>
                                  {professional.specialty && (
                                    <span className="text-body-small text-neutral-500">{professional.specialty}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selected Count */}
                    {selectedProfessionals.length > 0 && (
                      <div className="mt-1">
                        <span className="text-body-small text-neutral-600">
                          {selectedProfessionals.length} professional{selectedProfessionals.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              <div className="flex w-full items-center gap-4">
                <span className="w-32 flex-none text-body-medium font-body-medium text-subtext-color">
                  Type
                </span>
                <Select
                  className="h-auto grow shrink-0 basis-0"
                  disabled={false}
                  error={false}
                  variant="filled"
                  label=""
                  placeholder="Select type"
                  helpText=""
                  value={formData.roomType}
                  onValueChange={(value: 'chair' | 'room') => 
                    setFormData(prev => ({ ...prev, roomType: value }))
                  }
                >
                  <Select.Item value="chair">Chair</Select.Item>
                  <Select.Item value="room">Room</Select.Item>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex w-full shrink-0 items-start justify-between border-t border-solid border-neutral-border bg-white/50 backdrop-blur px-4 py-4 sticky bottom-0 z-10">
          <Button
            disabled={false}
            variant="destructive-tertiary"
            size="large"
            icon={null}
            iconRight={null}
            loading={false}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={loading || !formData.roomName.trim() || selectedProfessionalIds.length === 0}
            variant="brand-primary"
            size="large"
            icon={null}
            iconRight={null}
            loading={loading}
            onClick={handleSave}
          >
            {editingChairRoom ? 'Update' : 'Create'} {formData.roomType}
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default AddChairRoomModal;