 "use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
import { CheckboxGroup } from "@/ui/components/CheckboxGroup";
import { IconButton } from "@/ui/components/IconButton";
import { RadioGroup } from "@/ui/components/RadioGroup";
import { Select } from "@/ui/components/Select";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherCalendar } from "@subframe/core";
import { FeatherMail } from "@subframe/core";
import { FeatherPhone } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherUpload } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { useToast } from "@/contexts/ToastContext";
import { supabase, Patient, Professional, PatientGroup } from "@/lib/supabase";
import { preparePatientNameForStorage } from "@/app/scheduling/utils/nameUtils";

interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientAdded?: () => void;
  editingPatient?: Patient | null;
}

function AddPatientModal({ open, onOpenChange, onPatientAdded, editingPatient }: AddPatientModalProps) {
  // Using centralized name capitalization utility

  // Form state
  const [patientName, setPatientName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [clinicBranch, setClinicBranch] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [alternativePhones, setAlternativePhones] = useState<string[]>([""]);
  const [contactTime, setContactTime] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [postCode, setPostCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [insurancePlan, setInsurancePlan] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [professional, setProfessional] = useState("");
  const [patientGroups, setPatientGroups] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Lists from database
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [groups, setGroups] = useState<PatientGroup[]>([]);
  
  const { showSuccess, showError } = useToast();

  // Load professionals from database
  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, specialty')
        .order('name', { ascending: true });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
    }
  };

  // Load groups from database
  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_groups')
        .select('id, name, group_color')
        .order('name', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadProfessionals();
      loadGroups();
    }
  }, [open]);

  // Effect to populate form when editing
  useEffect(() => {
    if (editingPatient) {
      setPatientName(editingPatient.name || "");
      setDateOfBirth(editingPatient.date_of_birth || "");
      setGender(editingPatient.gender || "");
      setPreferredLanguage(editingPatient.preferred_language || "");
      setClinicBranch(editingPatient.clinic_branch || "");
      setReferralSource(editingPatient.referral_source || "");
      setEmail(editingPatient.email || "");
      setMobile(editingPatient.mobile || "");
      setContactTime(editingPatient.preferred_contact_time || []);
      setAddress(editingPatient.address || "");
      setPostCode(editingPatient.post_code || "");
      setCity(editingPatient.city || "");
      setState(editingPatient.state || "");
      setInsuranceName(editingPatient.insurance_name || "");
      setInsurancePlan(editingPatient.insurance_plan || "");
      setInsuranceId(editingPatient.insurance_id || "");
      setValidUntil(editingPatient.insurance_valid_until || "");
      setProfessional(editingPatient.professional_id || "");
      setPatientGroups(editingPatient.group_id || "");
      
      if (editingPatient.avatar_url) {
        setAvatarPreview(editingPatient.avatar_url);
      }
      
      // Parse additional phones if they exist
      if (editingPatient.additional_phones) {
        try {
          const phones = JSON.parse(editingPatient.additional_phones);
          setAlternativePhones(Array.isArray(phones) ? phones : [""]);
        } catch (e) {
          setAlternativePhones([""]);
        }
      } else {
        setAlternativePhones([""]);
      }
    }
  }, [editingPatient]);

  const handleContactTimeChange = (time: string, checked: boolean) => {
    if (checked) {
      setContactTime([...contactTime, time]);
    } else {
      setContactTime(contactTime.filter(t => t !== time));
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        showError("Arquivo inválido", "Por favor, selecione apenas arquivos de imagem");
        return;
      }

      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("Arquivo muito grande", "Por favor, selecione uma imagem menor que 5MB");
        return;
      }

      setAvatarFile(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const openDatePicker = (inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input && input.showPicker) {
      input.showPicker();
    } else if (input) {
      input.focus();
    }
  };

  const addAlternativePhone = () => {
    setAlternativePhones([...alternativePhones, ""]);
  };

  const removeAlternativePhone = (index: number) => {
    const newPhones = alternativePhones.filter((_, i) => i !== index);
    setAlternativePhones(newPhones);
  };

  const updateAlternativePhone = (index: number, value: string) => {
    const newPhones = [...alternativePhones];
    newPhones[index] = value;
    setAlternativePhones(newPhones);
  };

  const clearAll = () => {
    setPatientName("");
    setDateOfBirth("");
    setGender("");
    setPreferredLanguage("");
    setClinicBranch("");
    setReferralSource("");
    setEmail("");
    setMobile("");
    setAlternativePhones([""]);
    setContactTime([]);
    setAddress("");
    setPostCode("");
    setCity("");
    setState("");
    setInsuranceName("");
    setInsurancePlan("");
    setInsuranceId("");
    setValidUntil("");
    setProfessional("");
    setPatientGroups("");
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const savePatient = async () => {
    console.log("savePatient called, patientName:", patientName);
    
    // Validação: apenas o nome é obrigatório
    if (!patientName.trim()) {
      showError("Nome obrigatório", "Por favor, digite o nome do paciente");
      return;
    }

    setIsLoading(true);

    try {
      // Preparar dados para inserção - apenas campos preenchidos
      const patientData: any = {
        name: preparePatientNameForStorage(patientName.trim()),
        created_at: new Date().toISOString(),
      };

      // Adicionar campos opcionais apenas se preenchidos
      if (email.trim()) patientData.email = email.trim();
      if (mobile.trim()) patientData.mobile = mobile.trim();
      // Filtrar telefones alternativos vazios e adicionar ao patientData
      const validAlternativePhones = alternativePhones.filter(phone => phone.trim() !== "");
      if (validAlternativePhones.length > 0) {
        patientData.alternative_phones = validAlternativePhones;
      }
      if (address.trim()) patientData.address = address.trim();
      if (postCode.trim()) patientData.post_code = postCode.trim();
      if (city.trim()) patientData.city = city.trim();
      if (state.trim()) patientData.state = state.trim();
      if (dateOfBirth) patientData.date_of_birth = dateOfBirth;
      if (gender) patientData.gender = gender;
      if (preferredLanguage) patientData.preferred_language = preferredLanguage;
      if (clinicBranch) patientData.clinic_branch = clinicBranch;
      if (referralSource) patientData.referral_source = referralSource;
      if (insuranceName) patientData.insurance_name = insuranceName;
      if (insurancePlan) patientData.insurance_plan = insurancePlan;
      if (insuranceId.trim()) patientData.insurance_id = insuranceId.trim();
      if (validUntil) patientData.insurance_valid_until = validUntil;
      if (professional) patientData.professional_id = professional;
      if (patientGroups) patientData.group_id = patientGroups;
      if (avatarPreview) patientData.avatar_url = avatarPreview;
      
      // Adicionar preferred contact time se selecionado
      if (contactTime.length > 0) {
        patientData.preferred_contact_time = contactTime;
      }

      // Inserir ou atualizar no Supabase
      console.log("Attempting to save patient data:", patientData);
      let result;
      if (editingPatient) {
        // Update existing patient
        result = await supabase
          .from("patients")
          .update(patientData)
          .eq('id', editingPatient.id)
          .select();
      } else {
        // Create new patient
        result = await supabase
          .from("patients")
          .insert([patientData])
          .select();
      }
      const { data, error } = result;

      if (error) {
        console.error(`Error ${editingPatient ? 'updating' : 'creating'} patient:`, error);
        showError(
          editingPatient ? "Erro ao atualizar paciente" : "Erro ao criar paciente", 
          error.message
        );
        return;
      }
      
      console.log(`Patient ${editingPatient ? 'updated' : 'created'} successfully:`, data);

      // Sucesso!
      showSuccess(
        editingPatient ? "Paciente atualizado" : "Paciente adicionado", 
        `${patientName} foi ${editingPatient ? 'atualizado' : 'adicionado'} com sucesso`
      );
      
      // Limpar formulário
      clearAll();
      
      // Fechar modal
      onOpenChange(false);
      
      // Callback para recarregar lista
      if (onPatientAdded) {
        onPatientAdded();
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      showError("Erro", "Ocorreu um erro ao criar o paciente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-320 flex-col items-start bg-transparent relative">
        {/* Header Fixo */}
        <div className="flex w-full shrink-0 items-center justify-between border-b border-solid border-neutral-border bg-white/50 backdrop-blur px-4 py-4 sticky top-0 z-10">
          <span className="text-heading-2 font-heading-2 text-default-font">
            {editingPatient ? "Edit Patient Information" : "Create new patient"}
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => onOpenChange(false)}
          />
        </div>
        
        {/* Conteúdo com Overflow */}
        <div className="flex w-full grow items-start gap-6 bg-transparent px-6 py-6 pb-24 overflow-y-auto">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-6 self-stretch">
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center gap-2">
                <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                  Basic Information
                </span>
              </div>
              <div className="flex w-full flex-col items-start justify-between">
                <div className="flex w-full items-center justify-between py-2 mobile:flex-col mobile:flex-nowrap mobile:justify-between">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Patient name
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={null}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="Enter patient name"
                      value={patientName}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => setPatientName(event.target.value)}
                    />
                  </TextField>
                </div>
                <div className="flex h-16 w-full flex-none items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Patient avatar
                  </span>
                  <div className="flex items-center gap-3">
                    {avatarPreview ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="h-12 w-12 rounded-full object-cover border border-neutral-300"
                        />
                        <Button
                          variant="neutral-tertiary"
                          size="small"
                          icon={<FeatherX />}
                          onClick={removeAvatar}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Button
                          disabled={false}
                          variant="brand-tertiary"
                          size="large"
                          icon={null}
                          iconRight={<FeatherUpload />}
                          loading={false}
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          Upload avatar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Date of Birth
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={
                      <div 
                        onClick={() => openDatePicker('date-of-birth')}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <FeatherCalendar />
                      </div>
                    }
                    iconRight={null}
                  >
                    <TextField.Input
                      id="date-of-birth"
                      type="date"
                      placeholder="DD/MM/YYYY"
                      value={dateOfBirth}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDateOfBirth(event.target.value)}
                      style={{ colorScheme: 'light' }}
                      className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </TextField>
                </div>
                <div className="flex h-16 w-full flex-none items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Genre
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
                    <RadioGroup.Option label="Male" value="c9384fd6" />
                    <RadioGroup.Option label="Female" value="d8587aff" />
                    <RadioGroup.Option
                      label="Rather not say"
                      value="56d96e87"
                    />
                  </RadioGroup>
                </div>
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Preferred language
                  </span>
                  <Select
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    placeholder="Select language"
                    helpText=""
                    value={preferredLanguage}
                    onValueChange={(value: string) => setPreferredLanguage(value)}
                  >
                    <Select.Item value="english">English</Select.Item>
                    <Select.Item value="portuguese">Portuguese</Select.Item>
                    <Select.Item value="spanish">Spanish</Select.Item>
                  </Select>
                </div>
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Clinic branch
                  </span>
                  <Select
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    placeholder="Select clinic branch"
                    helpText=""
                    value={clinicBranch}
                    onValueChange={(value: string) => setClinicBranch(value)}
                  >
                    <Select.Item value="branch-1">Main Branch</Select.Item>
                    <Select.Item value="branch-2">Downtown Branch</Select.Item>
                    <Select.Item value="branch-3">North Branch</Select.Item>
                  </Select>
                </div>
                <div className="flex w-full items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Referral source
                  </span>
                  <Select
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    placeholder="Select referral source"
                    helpText=""
                    value={referralSource}
                    onValueChange={(value: string) => setReferralSource(value)}
                  >
                    <Select.Item value="google">Google</Select.Item>
                    <Select.Item value="social-media">Social Media</Select.Item>
                    <Select.Item value="referral">Patient Referral</Select.Item>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center gap-2">
                <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                  Contact Information
                </span>
              </div>
              <div className="flex w-full flex-col items-start">
                <div className="flex w-full items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Email
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={<FeatherMail />}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="Add email"
                      value={email}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => setEmail(event.target.value)}
                    />
                  </TextField>
                </div>
                <div className="flex w-full grow shrink-0 basis-0 items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Mobile
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={<FeatherPhone />}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="Add mobile"
                      value={mobile}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => setMobile(event.target.value)}
                    />
                  </TextField>
                  <IconButton
                    disabled={false}
                    variant="neutral-secondary"
                    size="large"
                    icon={<FeatherPlus />}
                    loading={false}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => addAlternativePhone()}
                    className="ml-3"
                  />
                </div>
                {alternativePhones.slice(1).map((phone, index) => (
                  <div key={index + 1} className="flex w-full items-center py-2">
                    <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                      Alternative phone {index + 2}
                    </span>
                    <TextField
                      className="h-10 grow shrink-0 basis-0"
                      variant="filled"
                      disabled={false}
                      error={false}
                      label=""
                      helpText=""
                      icon={<FeatherPhone />}
                      iconRight={null}
                    >
                      <TextField.Input
                        placeholder="Add alternative phone"
                        value={phone}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => updateAlternativePhone(index + 1, event.target.value)}
                      />
                    </TextField>
                    <IconButton
                      disabled={false}
                      variant="destructive-secondary"
                      size="large"
                      icon={<FeatherX />}
                      loading={false}
                      onClick={() => removeAlternativePhone(index + 1)}
                      className="ml-2"
                    />
                  </div>
                ))}
                <div className="flex w-full items-center py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    WhatsApp number
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={<FeatherPhone />}
                    iconRight={null}
                  >
                    <TextField.Input
                      placeholder="Add WhatsApp number"
                      value={alternativePhones[0]}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => updateAlternativePhone(0, event.target.value)}
                    />
                  </TextField>
                </div>
                <div className="flex h-16 w-full flex-none items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Preferred contact time
                  </span>
                  <CheckboxGroup
                    className="h-auto grow shrink-0 basis-0"
                    label=""
                    helpText=""
                    error={false}
                    horizontal={true}
                  >
                    <Checkbox
                      label="9am-12am"
                      checked={contactTime.includes("9am-12am")}
                      onCheckedChange={(checked: boolean) => handleContactTimeChange("9am-12am", checked)}
                    />
                    <Checkbox
                      label="12pm-6pm"
                      checked={contactTime.includes("12pm-6pm")}
                      onCheckedChange={(checked: boolean) => handleContactTimeChange("12pm-6pm", checked)}
                    />
                    <Checkbox
                      label="6pm-9pm"
                      checked={contactTime.includes("6pm-9pm")}
                      onCheckedChange={(checked: boolean) => handleContactTimeChange("6pm-9pm", checked)}
                    />
                    <Checkbox
                      label="Anytime"
                      checked={contactTime.includes("Anytime")}
                      onCheckedChange={(checked: boolean) => handleContactTimeChange("Anytime", checked)}
                    />
                  </CheckboxGroup>
                </div>
                <div className="flex w-full items-start py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Address
                  </span>
                  <div className="flex grow shrink-0 basis-0 flex-col items-center gap-2">
                    <TextField
                      className="h-10 w-full flex-none"
                      variant="filled"
                      disabled={false}
                      error={false}
                      label=""
                      helpText=""
                      icon={null}
                      iconRight={null}
                    >
                      <TextField.Input
                        placeholder="Address"
                        value={address}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => setAddress(event.target.value)}
                      />
                    </TextField>
                    <div className="flex w-full items-center gap-2">
                      <TextField
                        className="h-10 grow shrink-0 basis-0"
                        variant="filled"
                        disabled={false}
                        error={false}
                        label=""
                        helpText=""
                        icon={null}
                        iconRight={null}
                      >
                        <TextField.Input
                          placeholder="Post Code"
                          value={postCode}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => setPostCode(event.target.value)}
                        />
                      </TextField>
                      <TextField
                        className="h-10 grow shrink-0 basis-0"
                        variant="filled"
                        disabled={false}
                        error={false}
                        label=""
                        helpText=""
                        icon={null}
                        iconRight={null}
                      >
                        <TextField.Input
                          placeholder=""
                          value=""
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {}}
                        />
                      </TextField>
                      <TextField
                        className="h-10 grow shrink-0 basis-0"
                        variant="filled"
                        disabled={false}
                        error={false}
                        label=""
                        helpText=""
                        icon={null}
                        iconRight={null}
                      >
                        <TextField.Input
                          placeholder=""
                          value=""
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {}}
                        />
                      </TextField>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start">
              <div className="flex w-full items-start justify-end gap-2">
                <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                  Insurance
                </span>
              </div>
              <div className="flex h-16 w-full flex-none items-center py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Insurance name
                </span>
                <Select
                  className="h-10 grow shrink-0 basis-0"
                  variant="filled"
                  disabled={false}
                  error={false}
                  label=""
                  placeholder="Select insurance"
                  helpText=""
                  value={insuranceName}
                  onValueChange={(value: string) => setInsuranceName(value)}
                >
                  <Select.Item value="unimed">Unimed</Select.Item>
                  <Select.Item value="amil">Amil</Select.Item>
                  <Select.Item value="sulamerica">SulAmérica</Select.Item>
                </Select>
              </div>
              <div className="flex h-16 w-full flex-none items-center py-6">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Insurance plan
                </span>
                <Select
                  className="h-10 grow shrink-0 basis-0"
                  variant="filled"
                  disabled={false}
                  error={false}
                  label=""
                  placeholder="Select plan"
                  helpText=""
                  value={insurancePlan}
                  onValueChange={(value: string) => setInsurancePlan(value)}
                >
                  <Select.Item value="basic">Basic Plan</Select.Item>
                  <Select.Item value="standard">Standard Plan</Select.Item>
                  <Select.Item value="premium">Premium Plan</Select.Item>
                </Select>
              </div>
              <div className="flex w-full items-center py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Insurance ID
                </span>
                <TextField
                  className="h-10 grow shrink-0 basis-0"
                  variant="filled"
                  disabled={false}
                  error={false}
                  label=""
                  helpText=""
                  iconRight={null}
                >
                  <TextField.Input
                    placeholder="Type patient Insurance ID"
                    value={insuranceId}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>
                    ) => setInsuranceId(event.target.value)}
                  />
                </TextField>
              </div>
              <div className="flex h-16 w-full flex-none items-center py-6">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Valid until
                </span>
                <TextField
                  className="h-10 grow shrink-0 basis-0"
                  variant="filled"
                  disabled={false}
                  error={false}
                  label=""
                  helpText=""
                  icon={
                    <div 
                      onClick={() => openDatePicker('valid-until')}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <FeatherCalendar />
                  </div>
                  }
                  iconRight={null}
                >
                  <TextField.Input
                    id="valid-until"
                    type="date"
                    placeholder="DD/MM/YYYY"
                    value={validUntil}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValidUntil(event.target.value)}
                    style={{ colorScheme: 'light' }}
                    className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </TextField>
              </div>
            </div>
          </div>
          <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />
          <div className="flex w-112 flex-none flex-col items-start gap-6 self-stretch">
            <div className="flex w-full flex-col items-start gap-4">
              <span className="w-full text-heading-3 font-heading-3 text-default-font">
                Professional assigned
              </span>
              <div className="flex w-full items-center gap-2 py-2">
                <span className="w-28 flex-none text-body-medium font-body-medium text-subtext-color">
                  Professional
                </span>
                <Select
                  className="h-10 grow shrink-0 basis-0"
                  variant="filled"
                  disabled={false}
                  error={false}
                  label=""
                  placeholder="Select professional"
                  helpText=""
                  value={professional}
                  onValueChange={(value: string) => setProfessional(value)}
                >
                  {professionals.map((prof) => (
                    <Select.Item key={prof.id} value={prof.id || ""}>
                      {prof.name} {prof.specialty && `- ${prof.specialty}`}
                    </Select.Item>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <span className="w-full text-heading-3 font-heading-3 text-default-font">
                Patient groups
              </span>
              <div className="flex w-full items-center gap-2 py-2">
                <span className="w-28 flex-none text-body-medium font-body-medium text-subtext-color">
                  Groups
                </span>
                <Select
                  className="h-10 grow shrink-0 basis-0"
                  variant="filled"
                  disabled={false}
                  error={false}
                  label=""
                  placeholder="Select group"
                  helpText="Optional"
                  value={patientGroups}
                  onValueChange={(value: string) => setPatientGroups(value)}
                >
                  {groups.map((group) => (
                    <Select.Item key={group.id} value={group.id || ""}>
                      {group.name}
                    </Select.Item>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Fixo */}
        <div className="flex w-full shrink-0 items-start justify-between border-t border-solid border-neutral-border bg-white/50 backdrop-blur px-4 py-4 sticky bottom-0 z-10">
          <Button
            disabled={isLoading}
            variant="destructive-tertiary"
            size="large"
            icon={null}
            iconRight={null}
            loading={false}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => clearAll()}
          >
            Clear all
          </Button>
          <Button
            disabled={isLoading}
            variant="brand-primary"
            size="large"
            icon={null}
            iconRight={null}
            loading={isLoading}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              console.log("Save Patient button clicked");
              savePatient();
            }}
          >
            {editingPatient ? "Update Patient" : "Save Patient"}
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default AddPatientModal;