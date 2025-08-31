"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { Switch } from "@/ui/components/Switch";
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

interface ClinicInfoData {
  clinicName: string;
  registeredNumber: string;
  clinicResponsible: string;
  responsibleRegNumber: string;
  teamLanguage: string;
  businessType: string;
  email: string;
  mobile: string;
  alternativePhone: string;
  address: string;
  postCode: string;
  city: string;
  country: string;
  workingHours: {
    [key: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

interface EditClinicInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicData: ClinicInfoData;
  onClinicInfoUpdated: (updatedData: ClinicInfoData) => void;
}

function EditClinicInfoModal({ open, onOpenChange, clinicData, onClinicInfoUpdated }: EditClinicInfoModalProps) {
  const { showSuccess, showError } = useToast();
  
  // Form state - Initialize with clinicData
  const [clinicName, setClinicName] = useState(clinicData.clinicName);
  const [registeredNumber, setRegisteredNumber] = useState(clinicData.registeredNumber);
  const [clinicResponsible, setClinicResponsible] = useState(clinicData.clinicResponsible);
  const [responsibleRegNumber, setResponsibleRegNumber] = useState(clinicData.responsibleRegNumber);
  const [teamLanguage, setTeamLanguage] = useState(clinicData.teamLanguage);
  const [businessType, setBusinessType] = useState(clinicData.businessType);
  
  // Contact Information
  const [email, setEmail] = useState(clinicData.email);
  const [mobile, setMobile] = useState(clinicData.mobile);
  const [alternativePhone, setAlternativePhone] = useState(clinicData.alternativePhone);
  const [contactStartTime, setContactStartTime] = useState("9:00 AM");
  const [contactEndTime, setContactEndTime] = useState("6:00 PM");
  const [address, setAddress] = useState(clinicData.address);
  const [postCode, setPostCode] = useState(clinicData.postCode);
  const [city, setCity] = useState(clinicData.city);
  const [country, setCountry] = useState(clinicData.country);
  
  // Working Hours
  const [workingHours, setWorkingHours] = useState(clinicData.workingHours);
  
  // Closing days
  const [closingDays, setClosingDays] = useState("");

  // Sync form state when clinicData changes
  useEffect(() => {
    setClinicName(clinicData.clinicName);
    setRegisteredNumber(clinicData.registeredNumber);
    setClinicResponsible(clinicData.clinicResponsible);
    setResponsibleRegNumber(clinicData.responsibleRegNumber);
    setTeamLanguage(clinicData.teamLanguage);
    setBusinessType(clinicData.businessType);
    setEmail(clinicData.email);
    setMobile(clinicData.mobile);
    setAlternativePhone(clinicData.alternativePhone);
    setAddress(clinicData.address);
    setPostCode(clinicData.postCode);
    setCity(clinicData.city);
    setCountry(clinicData.country);
    setWorkingHours(clinicData.workingHours);
  }, [clinicData]);

  const handleWorkingHoursChange = (day: string, field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Create updated data object
      const updatedData: ClinicInfoData = {
        clinicName,
        registeredNumber,
        clinicResponsible,
        responsibleRegNumber,
        teamLanguage,
        businessType,
        email,
        mobile,
        alternativePhone,
        address,
        postCode,
        city,
        country,
        workingHours
      };

      // Pass updated data back to parent
      onClinicInfoUpdated(updatedData);
      
      showSuccess("Clinic Info Updated", "Clinic information has been updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving clinic info:', error);
      showError("Error", "Failed to update clinic information");
    }
  };

  const handleClearAll = () => {
    // Reset form to default values
    setClinicName("");
    setRegisteredNumber("");
    setClinicResponsible("");
    setResponsibleRegNumber("");
    setTeamLanguage("");
    setBusinessType("");
    setEmail("");
    setMobile("");
    setAlternativePhone("");
    setContactStartTime("");
    setContactEndTime("");
    setAddress("");
    setPostCode("");
    setCity("");
    setCountry("");
    setClosingDays("");
    
    // Reset working hours
    const resetHours = Object.keys(workingHours).reduce((acc, day) => ({
      ...acc,
      [day]: { enabled: false, start: "09:00", end: "18:00" }
    }), {});
    setWorkingHours(resetHours);
  };

  const dayNames = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full max-w-7xl flex-col items-start bg-transparent relative">
        {/* Header */}
        <div className="flex w-full shrink-0 items-center justify-between border-b border-solid border-neutral-border bg-white/50 backdrop-blur px-3 sm:px-4 py-3 sm:py-4 sticky top-0 z-10">
          <span className="text-heading-2 font-heading-2 text-default-font">
            Edit clinic info
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        {/* Content */}
        <div className="flex w-full grow items-start gap-6 bg-transparent px-4 lg:px-6 py-6 pb-24 overflow-y-auto flex-col lg:flex-row">
          {/* Left Column */}
          <div className="flex w-full lg:flex-1 flex-col items-start gap-6 self-stretch">
            {/* Business Information */}
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center gap-2">
                <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                  Business information
                </span>
              </div>
              <div className="flex w-full flex-col items-start justify-between">
                {/* Clinic name */}
                <div className="flex w-full items-center justify-between py-2 flex-col sm:flex-row gap-2 sm:gap-0">
                  <span className="w-full sm:w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Clinic name
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
                      placeholder="Enter clinic name"
                      value={clinicName}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setClinicName(event.target.value)}
                    />
                  </TextField>
                </div>

                {/* Clinic logo */}
                <div className="flex h-16 w-full flex-none items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Clinic logo
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
                    Upload logo
                  </Button>
                </div>

                {/* Registered number */}
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Registered number
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
                      placeholder="Enter registration number"
                      value={registeredNumber}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRegisteredNumber(event.target.value)}
                    />
                  </TextField>
                </div>

                {/* Clinic responsible */}
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Clinic responsible
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
                      placeholder="Enter responsible name"
                      value={clinicResponsible}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setClinicResponsible(event.target.value)}
                    />
                  </TextField>
                </div>

                {/* Responsible reg number */}
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Responsible reg. number
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
                      placeholder="Enter responsible registration"
                      value={responsibleRegNumber}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setResponsibleRegNumber(event.target.value)}
                    />
                  </TextField>
                </div>

                {/* Team language */}
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Team language
                  </span>
                  <Select
                    className="h-auto grow shrink-0 basis-0 self-stretch"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    placeholder="Select language"
                    helpText=""
                    value={teamLanguage}
                    onValueChange={(value: string) => setTeamLanguage(value)}
                  >
                    <Select.Item value="English">English</Select.Item>
                    <Select.Item value="Portuguese">Portuguese</Select.Item>
                    <Select.Item value="Spanish">Spanish</Select.Item>
                  </Select>
                </div>

                {/* Business type */}
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Business type
                  </span>
                  <Select
                    className="h-auto grow shrink-0 basis-0 self-stretch"
                    disabled={false}
                    error={false}
                    variant="filled"
                    label=""
                    placeholder="Select business type"
                    helpText=""
                    value={businessType}
                    onValueChange={(value: string) => setBusinessType(value)}
                  >
                    <Select.Item value="Dental and Aesthetics">Dental and Aesthetics</Select.Item>
                    <Select.Item value="General Dentistry">General Dentistry</Select.Item>
                    <Select.Item value="Orthodontics">Orthodontics</Select.Item>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center gap-2">
                <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                  Contact Information
                </span>
              </div>
              <div className="flex w-full flex-col items-start">
                {/* Email */}
                <div className="flex w-full items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Email
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

                {/* Mobile */}
                <div className="flex w-full grow shrink-0 basis-0 items-center gap-1 py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Mobile
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

                {/* Alternative phone */}
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

                {/* Contact available from */}
                <div className="flex h-16 w-full flex-none items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Contact available from
                  </span>
                  <div className="flex grow shrink-0 basis-0 items-center gap-4">
                    <TextField
                      className="h-10 grow shrink-0 basis-0"
                      disabled={false}
                      error={false}
                      variant="filled"
                      label=""
                      helpText=""
                      icon={<FeatherClock />}
                    >
                      <TextField.Input
                        placeholder="9:00 am"
                        value={contactStartTime}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setContactStartTime(event.target.value)}
                      />
                    </TextField>
                    <TextField
                      className="h-10 grow shrink-0 basis-0"
                      disabled={false}
                      error={false}
                      variant="filled"
                      label=""
                      helpText=""
                      icon={<FeatherClock />}
                    >
                      <TextField.Input
                        placeholder="6:00 pm"
                        value={contactEndTime}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setContactEndTime(event.target.value)}
                      />
                    </TextField>
                  </div>
                </div>

                {/* Address */}
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
                          placeholder="Country"
                          value={country}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCountry(event.target.value)}
                        />
                      </TextField>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />

          {/* Right Column */}
          <div className="flex w-full lg:w-96 flex-none flex-col items-start gap-6 self-stretch">
            {/* Working hours */}
            <div className="flex w-full flex-col items-start gap-4">
              <span className="w-full text-heading-3 font-heading-3 text-default-font">
                Working hours
              </span>
              <div className="flex w-full flex-col items-start">
                {dayNames.map(({ key, label }) => (
                  <div key={key} className="flex w-full items-center gap-2 py-2">
                    <Switch
                      checked={workingHours[key]?.enabled || false}
                      onCheckedChange={(checked: boolean) => handleWorkingHoursChange(key, 'enabled', checked)}
                    />
                    <span className="w-28 flex-none text-body-medium font-body-medium text-subtext-color">
                      {label}
                    </span>
                    <TextField
                      className="h-10 grow shrink-0 basis-0"
                      disabled={!workingHours[key]?.enabled}
                      error={false}
                      variant="filled"
                      label=""
                      helpText=""
                      icon={<FeatherClock />}
                    >
                      <TextField.Input
                        placeholder="9:00 am"
                        value={workingHours[key]?.start || ""}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                          handleWorkingHoursChange(key, 'start', event.target.value)
                        }
                      />
                    </TextField>
                    <TextField
                      className="h-10 grow shrink-0 basis-0"
                      disabled={!workingHours[key]?.enabled}
                      error={false}
                      variant="filled"
                      label=""
                      helpText=""
                      icon={<FeatherClock />}
                    >
                      <TextField.Input
                        placeholder="6:00 pm"
                        value={workingHours[key]?.end || ""}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                          handleWorkingHoursChange(key, 'end', event.target.value)
                        }
                      />
                    </TextField>
                  </div>
                ))}
              </div>
            </div>

            {/* Closing days */}
            <div className="flex w-full flex-col items-start gap-4">
              <span className="w-full text-heading-3 font-heading-3 text-default-font">
                Closing days
              </span>
              <div className="flex w-full items-center gap-2 py-2">
                <span className="w-28 flex-none text-body-medium font-body-medium text-subtext-color">
                  Select days
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
                    placeholder="Select days"
                    value={closingDays}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setClosingDays(event.target.value)}
                  />
                </TextField>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex w-full shrink-0 items-start justify-between border-t border-solid border-neutral-border bg-white/50 backdrop-blur px-3 sm:px-4 py-3 sm:py-4 sticky bottom-0 z-10 flex-col sm:flex-row gap-3 sm:gap-0">
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
            Save Changes
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default EditClinicInfoModal;