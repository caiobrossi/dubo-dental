"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { RadioGroup } from "@/ui/components/RadioGroup";
import { Select } from "@/ui/components/Select";
import { Switch } from "@/ui/components/Switch";
import { Tabs } from "@/ui/components/Tabs";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherCalendar } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherMail } from "@subframe/core";
import { FeatherPhone } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherUpload } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { useToast } from "@/contexts/ToastContext";
import { supabase, Professional } from "@/lib/supabase";
import * as SubframeCore from "@subframe/core";

interface WorkingHours {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface AddProfessionalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfessionalAdded: () => void;
  editingProfessional?: Professional | null;
}

function AddProfessionalModal({ open, onOpenChange, onProfessionalAdded, editingProfessional }: AddProfessionalModalProps) {
  const { showSuccess, showError } = useToast();
  
  // Basic Information
  const [professionalName, setProfessionalName] = useState("");
  const [croId, setCroId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [clinicBranch, setClinicBranch] = useState("");
  
  // Contact Information
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [alternativePhone, setAlternativePhone] = useState("");
  const [address, setAddress] = useState("");
  const [postCode, setPostCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  
  // Role and Permissions
  const [role, setRole] = useState("");
  
  // Working Hours
  const [scheduleType, setScheduleType] = useState("fixed");
  const [startDate, setStartDate] = useState("");
  const [activeWeek, setActiveWeek] = useState(0);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: false, start: "09:00", end: "18:00" },
    sunday: { enabled: false, start: "09:00", end: "18:00" }
  });

  // Fill form when editing a professional
  useEffect(() => {
    if (editingProfessional) {
      setProfessionalName(editingProfessional.name || "");
      setCroId(editingProfessional.cro_id || "");
      setAvatarUrl(editingProfessional.image || "");
      setDateOfBirth(editingProfessional.date_of_birth || "");
      setGender(editingProfessional.gender || "");
      setClinicBranch(editingProfessional.clinic_branch || "");
      setEmail(editingProfessional.email || "");
      setMobile(editingProfessional.mobile || "");
      setAlternativePhone(editingProfessional.alternative_phone || "");
      setAddress(editingProfessional.address || "");
      setPostCode(editingProfessional.post_code || "");
      setCity(editingProfessional.city || "");
      setState(editingProfessional.state || "");
      setRole(editingProfessional.role || "");
      setScheduleType(editingProfessional.schedule_type || "fixed");
      setStartDate(editingProfessional.start_date || "");

      // Set working hours from professional data
      const daysMap = {
        monday: { start: editingProfessional.monday_start, end: editingProfessional.monday_end },
        tuesday: { start: editingProfessional.tuesday_start, end: editingProfessional.tuesday_end },
        wednesday: { start: editingProfessional.wednesday_start, end: editingProfessional.wednesday_end },
        thursday: { start: editingProfessional.thursday_start, end: editingProfessional.thursday_end },
        friday: { start: editingProfessional.friday_start, end: editingProfessional.friday_end },
        saturday: { start: editingProfessional.saturday_start, end: editingProfessional.saturday_end },
        sunday: { start: editingProfessional.sunday_start, end: editingProfessional.sunday_end }
      };

      const newWorkingHours: WorkingHours = {};

      // Initialize all days first with default values
      const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      allDays.forEach(day => {
        newWorkingHours[day] = { enabled: false, start: "09:00", end: "18:00" };
      });

      // Then update with actual data from professional
      Object.entries(daysMap).forEach(([day, times]) => {
        if (newWorkingHours[day]) {
          newWorkingHours[day] = {
            enabled: !!(times.start && times.end),
            start: times.start || "09:00",
            end: times.end || "18:00"
          };
        }
      });
      setWorkingHours(newWorkingHours);
    } else {
      // Reset form for add mode
      setProfessionalName("");
      setCroId("");
      setAvatarUrl("");
      setDateOfBirth("");
      setGender("");
      setClinicBranch("");
      setEmail("");
      setMobile("");
      setAlternativePhone("");
      setAddress("");
      setPostCode("");
      setCity("");
      setState("");
      setRole("");
      setScheduleType("fixed");
      setStartDate("");
      setWorkingHours({
        monday: { enabled: true, start: "09:00", end: "18:00" },
        tuesday: { enabled: true, start: "09:00", end: "18:00" },
        wednesday: { enabled: true, start: "09:00", end: "18:00" },
        thursday: { enabled: true, start: "09:00", end: "18:00" },
        friday: { enabled: true, start: "09:00", end: "18:00" },
        saturday: { enabled: false, start: "09:00", end: "18:00" },
        sunday: { enabled: false, start: "09:00", end: "18:00" }
      });
    }
  }, [editingProfessional, open]);

  const handleWorkingHoursChange = (day: string, field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setWorkingHours(prev => {
      const currentDay = prev[day] || { enabled: false, start: "09:00", end: "18:00" };
      return {
        ...prev,
        [day]: {
          ...currentDay,
          [field]: value
        }
      };
    });
  };

  const calculateHours = (day: string) => {
    const dayHours = workingHours[day];
    if (!dayHours || !dayHours.enabled || !dayHours.start || !dayHours.end) return "0 h";
    
    try {
      const start = dayHours.start.split(':');
      const end = dayHours.end.split(':');
      
      if (start.length !== 2 || end.length !== 2) return "0 h";
      
      const startHour = parseInt(start[0]) + parseInt(start[1]) / 60;
      const endHour = parseInt(end[0]) + parseInt(end[1]) / 60;
      
      if (isNaN(startHour) || isNaN(endHour)) return "0 h";
      
      const hours = endHour - startHour;
      
      return hours > 0 ? `${hours.toFixed(1)} h` : "0 h";
    } catch (error) {
      console.error('Error calculating hours for', day, ':', error);
      return "0 h";
    }
  };

  const handleSave = async () => {
    try {
      if (!professionalName || !email) {
        showError("Error", "Please fill in all required fields");
        return;
      }

      console.log('Working Hours before save:', workingHours);

      const professionalData = {
        name: professionalName,
        cro_id: croId || null,
        image: avatarUrl || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        clinic_branch: clinicBranch || null,
        email: email,
        mobile: mobile || null,
        alternative_phone: alternativePhone || null,
        address: address || null,
        post_code: postCode || null,
        city: city || null,
        state: state || null,
        role: role || 'General Dentist',
        schedule_type: scheduleType || 'fixed',
        start_date: startDate || null,
        specialty: role || 'General Dentist',
        // Working hours individual fields
        monday_start: workingHours.monday?.enabled ? workingHours.monday.start : null,
        monday_end: workingHours.monday?.enabled ? workingHours.monday.end : null,
        tuesday_start: workingHours.tuesday?.enabled ? workingHours.tuesday.start : null,
        tuesday_end: workingHours.tuesday?.enabled ? workingHours.tuesday.end : null,
        wednesday_start: workingHours.wednesday?.enabled ? workingHours.wednesday.start : null,
        wednesday_end: workingHours.wednesday?.enabled ? workingHours.wednesday.end : null,
        thursday_start: workingHours.thursday?.enabled ? workingHours.thursday.start : null,
        thursday_end: workingHours.thursday?.enabled ? workingHours.thursday.end : null,
        friday_start: workingHours.friday?.enabled ? workingHours.friday.start : null,
        friday_end: workingHours.friday?.enabled ? workingHours.friday.end : null,
        saturday_start: workingHours.saturday?.enabled ? workingHours.saturday.start : null,
        saturday_end: workingHours.saturday?.enabled ? workingHours.saturday.end : null,
        sunday_start: workingHours.sunday?.enabled ? workingHours.sunday.start : null,
        sunday_end: workingHours.sunday?.enabled ? workingHours.sunday.end : null,
      };

      console.log('Professional data to save:', professionalData);

      let data, error;

      if (editingProfessional) {
        // Update existing professional
        ({ data, error } = await supabase
          .from('professionals')
          .update(professionalData)
          .eq('id', editingProfessional.id)
          .select());
      } else {
        // Create new professional
        ({ data, error } = await supabase
          .from('professionals')
          .insert([professionalData])
          .select());
      }

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error hint:', error.hint);
        throw error;
      }

      console.log('Professional saved successfully:', data);
      showSuccess(
        editingProfessional ? "Professional Updated" : "Professional Added", 
        editingProfessional ? "Professional has been updated successfully!" : "New professional has been added successfully!"
      );
      onProfessionalAdded();
      onOpenChange(false);
      handleClearAll();
    } catch (error) {
      console.error('Error saving professional:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError("Error", `Failed to save professional: ${errorMessage}`);
    }
  };

  const handleDelete = async () => {
    if (!editingProfessional) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${editingProfessional.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', editingProfessional.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      showSuccess("Professional Deleted", "Professional has been deleted successfully!");
      onProfessionalAdded(); // Refresh the list
      onOpenChange(false);
      handleClearAll();
    } catch (error) {
      console.error('Error deleting professional:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError("Error", `Failed to delete professional: ${errorMessage}`);
    }
  };

  const handleClearAll = () => {
    setProfessionalName("");
    setCroId("");
    setAvatarUrl("");
    setDateOfBirth("");
    setGender("");
    setClinicBranch("");
    setEmail("");
    setMobile("");
    setAlternativePhone("");
    setAddress("");
    setPostCode("");
    setCity("");
    setState("");
    setRole("");
    setScheduleType("fixed");
    setStartDate("");
    setWorkingHours({
      monday: { enabled: true, start: "09:00", end: "18:00" },
      tuesday: { enabled: true, start: "09:00", end: "18:00" },
      wednesday: { enabled: true, start: "09:00", end: "18:00" },
      thursday: { enabled: true, start: "09:00", end: "18:00" },
      friday: { enabled: true, start: "09:00", end: "18:00" },
      saturday: { enabled: false, start: "09:00", end: "18:00" },
      sunday: { enabled: false, start: "09:00", end: "18:00" }
    });
  };

  const dayNames = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full max-w-7xl flex-col items-start bg-transparent relative">
        {/* Header Fixo */}
        <div className="flex w-full shrink-0 items-center justify-between border-b border-solid border-neutral-border bg-white/50 backdrop-blur px-4 py-4 sticky top-0 z-10">
          <span className="text-heading-2 font-heading-2 text-default-font">
            {editingProfessional ? 'Edit professional' : 'Add professional'}
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        
        {/* Conteúdo com Overflow */}
        <div className="flex w-full grow items-start gap-6 bg-transparent px-4 sm:px-6 py-6 pb-24 overflow-y-auto flex-col xl:flex-row">
          <div className="flex w-full xl:w-[60%] flex-col items-start gap-12 self-stretch">
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center gap-2">
                <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                  Basic Information
                </span>
              </div>
              <div className="flex w-full flex-col items-start justify-between">
                <div className="flex h-auto min-h-14 w-full flex-none items-center justify-between py-2 flex-col sm:flex-row gap-2 sm:gap-0">
                  <span className="w-full sm:w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Professional name *
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    helpText=""
                    icon={null}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="Enter professional name"
                      value={professionalName}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setProfessionalName(event.target.value)}
                    />
                  </TextField>
                </div>
                <div className="flex h-auto min-h-14 w-full flex-none items-center justify-between py-2 flex-col sm:flex-row gap-2 sm:gap-0">
                  <span className="w-full sm:w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    CRO ID
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    helpText=""
                    icon={null}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="Enter CRO ID"
                      value={croId}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCroId(event.target.value)}
                    />
                  </TextField>
                </div>
                <div className="flex h-auto min-h-14 w-full flex-none items-center border-b border-solid border-neutral-border py-2 flex-col sm:flex-row gap-2 sm:gap-0">
                  <span className="w-full sm:w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Professional avatar
                  </span>
                  <Button
                    disabled={false}
                    variant="brand-tertiary"
                    size="large"
                    icon={null}
                    iconRight={<FeatherUpload />}
                    loading={false}
                    onClick={() => {}}
                  >
                    Upload avatar
                  </Button>
                </div>
                <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Date of Birth
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    helpText=""
                    icon={<FeatherCalendar />}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="DD/MM/YYYY"
                      value={dateOfBirth}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDateOfBirth(event.target.value)}
                    />
                  </TextField>
                </div>
                <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Gender
                  </span>
                  <RadioGroup
                    className="h-auto grow shrink-0 basis-0"
                    label=""
                    helpText=""
                    error={false}
                    horizontal={true}
                    value={gender}
                    onValueChange={(value: string) => setGender(value)}
                  >
                    <RadioGroup.Option label="Male" value="male" />
                    <RadioGroup.Option label="Female" value="female" />
                    <RadioGroup.Option label="Rather not say" value="rather_not_say" />
                  </RadioGroup>
                </div>
                <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Clinic branch
                  </span>
                  <Select
                    className="h-10 grow shrink-0 basis-0"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    placeholder="Select clinic branch"
                    helpText=""
                    value={clinicBranch}
                    onValueChange={(value: string) => setClinicBranch(value)}
                  >
                    <Select.Item value="Main Branch">Main Branch</Select.Item>
                    <Select.Item value="Downtown">Downtown</Select.Item>
                    <Select.Item value="North Side">North Side</Select.Item>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center gap-2">
                <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                  Contact Information
                </span>
              </div>
              <div className="flex w-full flex-col items-start">
                <div className="flex w-full items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Email *
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    helpText=""
                    icon={<FeatherMail />}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="Add email"
                      value={email}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                    />
                  </TextField>
                </div>
                <div className="flex w-full grow shrink-0 basis-0 items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Mobile
                  </span>
                  <div className="flex grow shrink-0 basis-0 items-center gap-2">
                    <TextField
                      className="h-10 grow shrink-0 basis-0"
                      disabled={false}
                      error={false}
                      variant="filled"
                      label=""
                      helpText=""
                      icon={<FeatherPhone />}
                      iconRight={null}
                    >
                      <TextField.Input
                        placeholder="Add mobile"
                        value={mobile}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMobile(event.target.value)}
                      />
                    </TextField>
                    <IconButton
                      disabled={false}
                      variant="neutral-secondary"
                      size="large"
                      icon={<FeatherPlus />}
                      loading={false}
                      onClick={() => {}}
                    />
                  </div>
                </div>
                <div className="flex w-full items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Alternative phone
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    helpText=""
                    icon={<FeatherPhone />}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="Add alternative phone"
                      value={alternativePhone}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAlternativePhone(event.target.value)}
                    />
                  </TextField>
                </div>
                <div className="flex w-full items-start py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Address
                  </span>
                  <div className="flex grow shrink-0 basis-0 flex-col items-center gap-2">
                    <TextField
                      className="h-10 w-full flex-none"
                      disabled={false}
                      error={false}
                      variant="filled"
                      label=""
                      helpText=""
                      icon={null}
                      iconRight={null}
                    >
                      <TextField.Input
                        placeholder="Street address"
                        value={address}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAddress(event.target.value)}
                      />
                    </TextField>
                    <div className="flex w-full items-center gap-2">
                      <TextField
                        className="h-10 grow shrink-0 basis-0"
                        disabled={false}
                        error={false}
                        variant="filled"
                        label=""
                        helpText=""
                        icon={null}
                        iconRight={null}
                      >
                        <TextField.Input
                          placeholder="Post Code"
                          value={postCode}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPostCode(event.target.value)}
                        />
                      </TextField>
                      <TextField
                        className="h-10 grow shrink-0 basis-0"
                        disabled={false}
                        error={false}
                        variant="filled"
                        label=""
                        helpText=""
                        icon={null}
                        iconRight={null}
                      >
                        <TextField.Input
                          placeholder="City"
                          value={city}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCity(event.target.value)}
                        />
                      </TextField>
                      <TextField
                        className="h-10 grow shrink-0 basis-0"
                        disabled={false}
                        error={false}
                        variant="filled"
                        label=""
                        helpText=""
                        icon={null}
                        iconRight={null}
                      >
                        <TextField.Input
                          placeholder="State"
                          value={state}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setState(event.target.value)}
                        />
                      </TextField>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start">
              <div className="flex w-full items-start justify-end gap-2">
                <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                  Role and Permissions
                </span>
              </div>
              <div className="flex h-14 w-full flex-none items-center py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Role
                </span>
                <Select
                  className="h-10 grow shrink-0 basis-0"
                  disabled={false}
                  error={false}
                  variant="filled"
                  label=""
                  placeholder="Select role"
                  helpText=""
                  value={role}
                  onValueChange={(value: string) => setRole(value)}
                >
                  <Select.Item value="General Dentist">General Dentist</Select.Item>
                  <Select.Item value="Orthodontist">Orthodontist</Select.Item>
                  <Select.Item value="Periodontist">Periodontist</Select.Item>
                  <Select.Item value="Endodontist">Endodontist</Select.Item>
                  <Select.Item value="Oral Surgeon">Oral Surgeon</Select.Item>
                  <Select.Item value="Dental Hygienist">Dental Hygienist</Select.Item>
                  <Select.Item value="Dental Assistant">Dental Assistant</Select.Item>
                  <Select.Item value="Receptionist">Receptionist</Select.Item>
                  <Select.Item value="Office Manager">Office Manager</Select.Item>
                </Select>
              </div>
            </div>
          </div>
          <div className="hidden xl:flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />
          <div className="flex w-full xl:w-[38%] flex-none flex-col items-start gap-8">
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center">
                <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                  Working hours
                </span>
              </div>
              <div className="flex w-full flex-col items-start">
                <div className="flex h-14 w-full flex-none flex-col items-start">
                  <div className="flex w-full items-center gap-2 py-2 flex-col sm:flex-row">
                    <span className="w-full sm:w-28 flex-none text-body-medium font-body-medium text-subtext-color">
                      Schedule type
                    </span>
                    <Select
                      className="h-10 grow shrink-0 basis-0"
                      disabled={false}
                      error={false}
                      variant="filled"
                      label=""
                      placeholder="Select"
                      helpText=""
                      value={scheduleType}
                      onValueChange={(value: string) => setScheduleType(value)}
                    >
                      <Select.Item value="fixed">Fixed</Select.Item>
                      <Select.Item value="rotating">Rotating</Select.Item>
                      <Select.Item value="flexible">Flexible</Select.Item>
                    </Select>
                  </div>
                </div>
                <div className="flex w-full items-center gap-2 py-2 flex-col sm:flex-row">
                  <span className="w-full sm:w-28 flex-none text-body-medium font-body-medium text-subtext-color">
                    Start date
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    helpText=""
                    icon={<FeatherCalendar />}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="DD/MM/YYYY"
                      value={startDate}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStartDate(event.target.value)}
                    />
                  </TextField>
                </div>
              </div>
            </div>
            {scheduleType === 'rotating' && (
              <Tabs>
                <Tabs.Item active={activeWeek === 0} onClick={() => setActiveWeek(0)}>Week 1</Tabs.Item>
                <Tabs.Item active={activeWeek === 1} onClick={() => setActiveWeek(1)}>Week 2</Tabs.Item>
                <Tabs.Item active={activeWeek === 2} onClick={() => setActiveWeek(2)}>Week 3</Tabs.Item>
                <Tabs.Item active={activeWeek === 3} onClick={() => setActiveWeek(3)}>Week 4</Tabs.Item>
              </Tabs>
            )}
            <div className="flex w-full flex-col items-start gap-2">
              {dayNames.map(({ key, label }) => (
                <div key={key} className="flex w-full flex-col items-start gap-4">
                  <div className="flex w-full items-center gap-4 xl:gap-16 flex-col sm:flex-row xl:flex-row">
                    <div className="flex w-full sm:w-24 flex-none items-start gap-3">
                      <Switch
                        checked={workingHours[key]?.enabled || false}
                        onCheckedChange={(checked: boolean) => handleWorkingHoursChange(key, 'enabled', checked)}
                      />
                      <div className="flex flex-col items-start gap-2">
                        <span className="font-body-medium-/-bold text-default-font">
                          {label}
                        </span>
                        <span className="text-body-small font-body-small text-subtext-color">
                          {calculateHours(key)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TextField
                        disabled={!workingHours[key]?.enabled}
                        error={false}
                        variant="filled"
                        label=""
                        helpText=""
                        icon={<FeatherClock />}
                        iconRight={null}
                      >
                        <TextField.Input
                          placeholder="09:00"
                          value={workingHours[key]?.start || ""}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                            handleWorkingHoursChange(key, 'start', event.target.value)
                          }
                        />
                      </TextField>
                      <TextField
                        disabled={!workingHours[key]?.enabled}
                        error={false}
                        variant="filled"
                        label=""
                        helpText=""
                        icon={<FeatherClock />}
                        iconRight={null}
                      >
                        <TextField.Input
                          placeholder="18:00"
                          value={workingHours[key]?.end || ""}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                            handleWorkingHoursChange(key, 'end', event.target.value)
                          }
                        />
                      </TextField>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer Fixo */}
        <div className="flex w-full shrink-0 items-start justify-between border-t border-solid border-neutral-border bg-white/50 backdrop-blur px-4 py-4 sticky bottom-0 z-10 flex-col sm:flex-row gap-3 sm:gap-0">
          {editingProfessional ? (
            // Edit mode: Delete and Update buttons
            <>
              <Button
                disabled={false}
                variant="destructive-secondary"
                size="large"
                icon={null}
                iconRight={null}
                loading={false}
                onClick={handleDelete}
              >
                Delete Professional
              </Button>
              <Button
                disabled={false}
                variant="brand-primary"
                size="large"
                icon={null}
                iconRight={null}
                loading={false}
                onClick={handleSave}
              >
                Update Professional
              </Button>
            </>
          ) : (
            // Add mode: Clear and Save buttons
            <>
              <Button
                disabled={false}
                variant="destructive-tertiary"
                size="large"
                icon={null}
                iconRight={null}
                loading={false}
                onClick={handleClearAll}
              >
                Clear all
              </Button>
              <Button
                disabled={false}
                variant="brand-primary"
                size="large"
                icon={null}
                iconRight={null}
                loading={false}
                onClick={handleSave}
              >
                Save Professional
              </Button>
            </>
          )}
        </div>
      </div>
    </DialogLayout>
  );
}

export default AddProfessionalModal;