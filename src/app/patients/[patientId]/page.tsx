"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Accordion } from "@/ui/components/Accordion";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { MemberBanner } from "@/ui/components/MemberBanner";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { Tabs } from "@/ui/components/Tabs";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherAlertTriangle } from "@subframe/core";
import { FeatherCheckCircle } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherMail } from "@subframe/core";
import { FeatherPhone } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSend } from "@subframe/core";
import { useSettings } from "@/contexts/SettingsContext";
import { FeatherSmartphone } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherArrowLeft } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { supabase } from "@/lib/supabase";
import { formatPatientNameForDisplay } from "@/app/scheduling/utils/nameUtils";
import { createPatientSlug, parsePatientSlug } from "@/utils/patientSlug";
import AddPatientModal from "@/components/custom/AddPatientModal";
import AddToGroupModal from "@/components/custom/AddToGroupModal";

interface PatientData {
  name: string;
  gender: string;
  age: string;
  patientId: string;
  dateOfBirth: string;
  preferredLanguage: string;
  clinicBranch: string;
  referralBy: string;
  email: string;
  mobile: string;
  alternativePhone: string;
  preferredContactTime: string;
  address: string;
  insurancePlan: string;
  insuranceName: string;
  insuranceId: string;
  insuranceValidUntil: string;
  professionalAssigned: string;
  patientGroups: string;
  familyMembers: string;
  quickNotes: string[];
  avatarUrl?: string;
}

// Default patient data
const defaultPatientData: PatientData = {
  name: "David Stuart",
  gender: "Male",
  age: "34y old",
  patientId: "404569660",
  dateOfBirth: "03/04/1990",
  preferredLanguage: "English",
  clinicBranch: "Don Pedro Lisbon",
  referralBy: "Don Pedro Lisbon",
  email: "contact@caiobrossi.com",
  mobile: "+351 954 345 245",
  alternativePhone: "+351 403 567 267",
  preferredContactTime: "+351 403 567 267",
  address: "Av Elias Garcia, 157, 7 esquerdo\n1050-0990 Lisbon, PT",
  insurancePlan: "+351 403 567 267",
  insuranceName: "+351 403 567 267",
  insuranceId: "+351 403 567 267",
  insuranceValidUntil: "+351 403 567 267",
  professionalAssigned: "Rafael Souza",
  patientGroups: "Vip patient, Orthodontics",
  familyMembers: "Susan Stuart (Daughter)",
  quickNotes: [
    "Patient have 3 kids, João, Marie and Jose",
    "David likes to talk about cars"
  ]
};

function PatientInfo() {
  const params = useParams();
  const router = useRouter();
  const patientSlug = params?.patientId as string;
  const { formatDate } = useSettings();
  
  const [patientData, setPatientData] = useState<PatientData>(defaultPatientData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [activeSegment, setActiveSegment] = useState("patient-info");
  const [newNote, setNewNote] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [patientGroups, setPatientGroups] = useState<{id: string, name: string}[]>([]);
  const [actualPatientId, setActualPatientId] = useState<string | null>(null);

  // Load patient data from Supabase
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientSlug) {
        router.push('/patients');
        return;
      }

      try {
        // Convert slug back to name and potential ID
        const slugData = parsePatientSlug(patientSlug);
        
        let patientId: string;
        
        // If we have an ID in the slug, try to find by ID first
        if (slugData.id) {
          const { data: patientById, error: idError } = await supabase
            .from('patients')
            .select('id, name')
            .ilike('id', `${slugData.id}%`)
            .single();
          
          if (patientById && !idError) {
            patientId = patientById.id;
          } else {
            // Fallback to name search
            const { data: patients, error: searchError } = await supabase
              .from('patients')
              .select('id, name')
              .ilike('name', `%${slugData.name}%`);
            
            if (searchError || !patients || patients.length === 0) {
              console.error('Patient not found:', searchError);
              router.push('/patients');
              return;
            }
            
            patientId = patients[0].id;
          }
        } else {
          // No ID in slug, search by name only
          const { data: patients, error: searchError } = await supabase
            .from('patients')
            .select('id, name')
            .ilike('name', `%${slugData.name}%`);
          
          if (searchError || !patients || patients.length === 0) {
            console.error('Patient not found:', searchError);
            router.push('/patients');
            return;
          }
          
          // Find exact match or closest match
          const exactMatch = patients.find(p => 
            createPatientSlug(p.name, p.id) === patientSlug
          );
          
          patientId = exactMatch?.id || patients[0].id;
        }
        
        setActualPatientId(patientId);

        // Fetch full patient data from Supabase with groups
        const { data: patient, error } = await supabase
          .from('patients')
          .select(`
            *,
            professionals:professional_id (
              id,
              name
            ),
            patient_groups:group_id (
              id,
              name
            )
          `)
          .eq('id', patientId)
          .single();

        if (error || !patient) {
          console.error('Error fetching patient:', error);
          return;
        }

        // Also fetch multiple groups from memberships table
        const { data: memberships, error: membershipError } = await supabase
          .from('patient_group_memberships')
          .select(`
            patient_groups:group_id (
              id,
              name
            )
          `)
          .eq('patient_id', patientId);

        const groupsWithDetails = memberships?.map(m => ({
          id: m.patient_groups?.id,
          name: m.patient_groups?.name
        })).filter(g => g.id && g.name) || [];
        
        const multipleGroups = groupsWithDetails.map(g => g.name);
        
        // Store detailed groups for card display
        setPatientGroups(groupsWithDetails as {id: string, name: string}[]);

        // Calculate age from date_of_birth
        const calculateAge = (dateString: string) => {
          if (!dateString) return 'Unknown';
          const birthDate = new Date(dateString);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return `${age}y old`;
        };

        // Map Supabase data to component format
        const mappedData: PatientData = {
          name: patient.name || 'Unknown Patient',
          gender: patient.gender === 'male' ? 'Male' : patient.gender === 'female' ? 'Female' : 'Rather not say',
          age: calculateAge(patient.date_of_birth),
          patientId: patient.id?.substring(0, 8) || 'N/A',
          dateOfBirth: patient.date_of_birth ? formatDate(new Date(patient.date_of_birth)) : 'Not provided',
          preferredLanguage: patient.preferred_language || 'English',
          clinicBranch: patient.clinic_branch || 'Main Branch',
          referralBy: patient.referral_source || 'Direct',
          email: patient.email || 'Not provided',
          mobile: patient.mobile || 'Not provided',
          alternativePhone: patient.alternative_phone || 'Not provided',
          preferredContactTime: patient.preferred_contact_time?.join(', ') || 'Any time',
          address: patient.address ? 
            `${patient.address}${patient.post_code ? '\n' + patient.post_code : ''}${patient.city ? ' ' + patient.city : ''}${patient.state ? ', ' + patient.state : ''}` 
            : 'Not provided',
          insurancePlan: patient.insurance_plan || 'Not provided',
          insuranceName: patient.insurance_name || 'Not provided',
          insuranceId: patient.insurance_id || 'Not provided',
          insuranceValidUntil: patient.insurance_valid_until ? formatDate(new Date(patient.insurance_valid_until)) : 'Not provided',
          professionalAssigned: patient.professionals?.name || 'Not assigned',
          patientGroups: multipleGroups.length > 0 ? multipleGroups.join(', ') : (patient.patient_groups?.name || 'No groups'),
          familyMembers: 'Not available',
          quickNotes: patient.quick_notes || [],
          avatarUrl: patient.avatar_url
        };

        setPatientData(mappedData);
        setCurrentPatient(patient);
      } catch (error) {
        console.error('Error loading patient data:', error);
        router.push('/patients');
      } finally {
        setIsLoaded(true);
      }
    };

    fetchPatientData();
  }, [patientSlug, router]);

  // Function to refresh patient data after edit
  const handlePatientUpdated = async () => {
    console.log('handlePatientUpdated called'); // Debug log
    
    if (!actualPatientId) return;

    try {
      // Fetch patient data
      const { data: patient, error } = await supabase
        .from('patients')
        .select(`
          *,
          professionals:professional_id (
            id,
            name
          ),
          patient_groups:group_id (
            id,
            name
          )
        `)
        .eq('id', actualPatientId)
        .single();

      if (error || !patient) {
        console.error('Error fetching updated patient:', error);
        return;
      }

      // Fetch multiple groups from memberships table
      const { data: memberships, error: membershipError } = await supabase
        .from('patient_group_memberships')
        .select(`
          patient_groups:group_id (
            id,
            name
          )
        `)
        .eq('patient_id', actualPatientId);

      console.log('Fetched memberships:', memberships); // Debug log

      const groupsWithDetails = memberships?.map(m => ({
        id: m.patient_groups?.id,
        name: m.patient_groups?.name
      })).filter(g => g.id && g.name) || [];
      
      const multipleGroups = groupsWithDetails.map(g => g.name);
      
      console.log('Updated groups:', groupsWithDetails); // Debug log
      
      // Update groups state immediately
      setPatientGroups(groupsWithDetails as {id: string, name: string}[]);

      // Calculate age from date_of_birth
      const calculateAge = (dateString: string) => {
        if (!dateString) return 'Unknown';
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return `${age}y old`;
      };

      // Map updated data
      const mappedData: PatientData = {
        name: patient.name || 'Unknown Patient',
        gender: patient.gender === 'male' ? 'Male' : patient.gender === 'female' ? 'Female' : 'Rather not say',
        age: calculateAge(patient.date_of_birth),
        patientId: patient.id?.substring(0, 8) || 'N/A',
        dateOfBirth: patient.date_of_birth ? formatDate(new Date(patient.date_of_birth)) : 'Not provided',
        preferredLanguage: patient.preferred_language || 'English',
        clinicBranch: patient.clinic_branch || 'Main Branch',
        referralBy: patient.referral_source || 'Direct',
        email: patient.email || 'Not provided',
        mobile: patient.mobile || 'Not provided',
        alternativePhone: patient.alternative_phone || 'Not provided',
        preferredContactTime: patient.preferred_contact_time?.join(', ') || 'Any time',
        address: patient.address ? 
          `${patient.address}${patient.post_code ? '\\n' + patient.post_code : ''}${patient.city ? ' ' + patient.city : ''}${patient.state ? ', ' + patient.state : ''}` 
          : 'Not provided',
        insurancePlan: patient.insurance_plan || 'Not provided',
        insuranceName: patient.insurance_name || 'Not provided',
        insuranceId: patient.insurance_id || 'Not provided',
        insuranceValidUntil: patient.insurance_valid_until ? formatDate(new Date(patient.insurance_valid_until)) : 'Not provided',
        professionalAssigned: patient.professionals?.name || 'Not assigned',
        patientGroups: multipleGroups.length > 0 ? multipleGroups.join(', ') : (patient.patient_groups?.name || 'No groups'),
        familyMembers: 'Not available',
        quickNotes: patient.quick_notes || [],
        avatarUrl: patient.avatar_url
      };

      setPatientData(mappedData);
      setCurrentPatient(patient);
      
      console.log('Patient data updated successfully'); // Debug log
      
    } catch (error) {
      console.error('Error refreshing patient data:', error);
    }
  };

  const handleRemoveFromGroup = async (groupId: string, groupName: string) => {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${patientData.name} from the group "${groupName}"?`
    );

    if (!confirmRemove) return;

    try {
      // Remove from memberships table
      const { error } = await supabase
        .from('patient_group_memberships')
        .delete()
        .eq('patient_id', actualPatientId)
        .eq('group_id', groupId);

      if (error) throw error;

      // If this was the legacy group, also clear it
      if (currentPatient?.group_id === groupId) {
        const { error: legacyError } = await supabase
          .from('patients')
          .update({ group_id: null })
          .eq('id', actualPatientId);

        if (legacyError) {
          console.error('Error updating legacy group:', legacyError);
        }
      }

      // Update local state immediately
      setPatientGroups(prev => prev.filter(group => group.id !== groupId));

    } catch (error) {
      console.error('Error removing patient from group:', error);
      alert('Failed to remove patient from group. Please try again.');
    }
  };

  const handlePatientDataUpdate = (updatedData: PatientData) => {
    setPatientData(updatedData);
    // Save to localStorage
    try {
      localStorage.setItem('patient-info-data', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving patient data to localStorage:', error);
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const updatedNotes = [...patientData.quickNotes, newNote.trim()];
        
        // Update in Supabase
        const { error } = await supabase
          .from('patients')
          .update({ quick_notes: updatedNotes })
          .eq('id', actualPatientId);
        
        if (error) {
          console.error('Error saving note:', error);
          return;
        }
        
        // Update local state
        const updatedData = {
          ...patientData,
          quickNotes: updatedNotes
        };
        handlePatientDataUpdate(updatedData);
        setNewNote("");
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const handleDeleteNote = async (index: number) => {
    try {
      const updatedNotes = patientData.quickNotes.filter((_, i) => i !== index);
      
      // Update in Supabase
      const { error } = await supabase
        .from('patients')
        .update({ quick_notes: updatedNotes })
        .eq('id', actualPatientId);
      
      if (error) {
        console.error('Error deleting note:', error);
        return;
      }
      
      // Update local state
      const updatedData = {
        ...patientData,
        quickNotes: updatedNotes
      };
      handlePatientDataUpdate(updatedData);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Show loading state while data is being loaded
  if (!isLoaded) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center bg-white">
          <span className="text-body-medium font-body-medium text-subtext-color">Loading...</span>
        </div>
      </DefaultPageLayout>
    );
  }

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start bg-default-background">
        {/* Fixed Header */}
        <div className="flex w-full flex-col items-center bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3 border-b border-neutral-border/50">
          <MemberBanner
            name={formatPatientNameForDisplay(patientData.name)}
            avatarUrl={patientData.avatarUrl}
            alerts={
              <Badge
                variant="error"
                icon={null}
                iconRight={<FeatherAlertTriangle />}
              >
                12 Alerts
              </Badge>
            }
            gender={patientData.gender}
            age={patientData.age}
            patientId={patientData.patientId}
            contactButtons={
              <>
                <IconButton
                  disabled={false}
                  variant="neutral-secondary"
                  size="large"
                  icon={<FeatherPhone />}
                  loading={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <IconButton
                  disabled={false}
                  variant="neutral-secondary"
                  size="large"
                  icon={<FeatherMail />}
                  loading={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <IconButton
                  disabled={false}
                  variant="neutral-secondary"
                  size="large"
                  icon={<FeatherSmartphone />}
                  loading={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </>
            }
            editProfile={
              <Button
                disabled={false}
                variant="neutral-secondary"
                size="large"
                icon={<FeatherEdit2 />}
                iconRight={null}
                loading={false}
                onClick={() => setEditModalOpen(true)}
              >
                Edit Profile
              </Button>
            }
            navigation={
              <div className="grid grid-cols-3 w-full items-center">
                <div className="flex justify-start">
                  <SubframeCore.Tooltip.Provider>
                    <SubframeCore.Tooltip.Root>
                      <SubframeCore.Tooltip.Trigger asChild>
                        <IconButton
                          variant="neutral-secondary"
                          size="medium"
                          icon={<FeatherArrowLeft />}
                          onClick={() => router.push('/patients')}
                          className="flex-shrink-0"
                        />
                      </SubframeCore.Tooltip.Trigger>
                      <SubframeCore.Tooltip.Portal>
                        <SubframeCore.Tooltip.Content
                          side="bottom"
                          align="center"
                          sideOffset={8}
                          className="bg-neutral-800 text-white px-2 py-1 rounded text-sm"
                        >
                          Back to patients
                          <SubframeCore.Tooltip.Arrow className="fill-neutral-800" />
                        </SubframeCore.Tooltip.Content>
                      </SubframeCore.Tooltip.Portal>
                    </SubframeCore.Tooltip.Root>
                  </SubframeCore.Tooltip.Provider>
                </div>
                <div className="flex justify-center">
                  <SegmentControl className="h-10 w-auto flex-none" variant="default">
                  <SegmentControl.Item 
                    active={activeSegment === "overview"}
                    onClick={() => setActiveSegment("overview")}
                  >
                    Overview
                  </SegmentControl.Item>
                <SegmentControl.Item 
                  active={activeSegment === "patient-info"}
                  onClick={() => setActiveSegment("patient-info")}
                >
                  Patient info
                </SegmentControl.Item>
                <SegmentControl.Item 
                  active={activeSegment === "anamnese"}
                  onClick={() => router.push(`/patients/${patientSlug}/anamnese`)}
                >
                  Anamnese
                </SegmentControl.Item>
                <SegmentControl.Item 
                  active={activeSegment === "charting"}
                  onClick={() => router.push(`/patients/${patientSlug}/charting`)}
                >
                  Charting
                </SegmentControl.Item>
                <SegmentControl.Item 
                  active={activeSegment === "treatments"}
                  onClick={() => router.push(`/patients/${patientSlug}/treatments`)}
                >
                  Treatments
                </SegmentControl.Item>
                <SegmentControl.Item 
                  active={activeSegment === "documentation"}
                  onClick={() => setActiveSegment("documentation")}
                >
                  Documentation
                </SegmentControl.Item>
                <SegmentControl.Item 
                  active={activeSegment === "billing"}
                  onClick={() => setActiveSegment("billing")}
                >
                  Billing
                </SegmentControl.Item>
                <SegmentControl.Item 
                  active={activeSegment === "files"}
                  onClick={() => setActiveSegment("files")}
                >
                  Files and Images
                </SegmentControl.Item>
                    <SegmentControl.Item 
                      active={activeSegment === "insights"}
                      onClick={() => setActiveSegment("insights")}
                    >
                      Insights
                    </SegmentControl.Item>
                  </SegmentControl>
                </div>
                <div className="flex justify-end">
                  {/* Third column - empty for balance */}
                </div>
              </div>
            }
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-12 rounded-lg bg-default-background px-2 sm:px-4 py-4 overflow-auto">
          <div className="flex w-full lg:max-w-[1400px] grow shrink-0 basis-0 items-start gap-8 px-2 sm:px-4 pt-6">
            
            {/* Tabs */}
            <div className="flex w-full flex-col items-start gap-6">
              <Tabs>
                <Tabs.Item 
                  active={activeTab === "general"}
                  onClick={() => setActiveTab("general")}
                >
                  General Info
                </Tabs.Item>
                <Tabs.Item 
                  active={activeTab === "health"}
                  onClick={() => setActiveTab("health")}
                >
                  Health history
                </Tabs.Item>
                <Tabs.Item 
                  active={activeTab === "medications"}
                  onClick={() => setActiveTab("medications")}
                >
                  Medications
                </Tabs.Item>
              </Tabs>

              <div className="flex w-full items-start lg:gap-8 gap-0 lg:flex-row flex-col">
                {/* Left Column - Main Information */}
<div className="flex w-full lg:flex-1 flex-col items-start gap-6">
                  {/* Basic Information */}
                  <div className="flex w-full lg:max-w-[1024px] flex-col items-start gap-2">
                    <div className="flex w-full items-center gap-2">
                      <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                        Basic Information
                      </span>
                    </div>
                    <div className="flex w-full flex-col items-start justify-between">
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Date of birth
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.dateOfBirth}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Gender
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.gender}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Preference language
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.preferredLanguage}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Clinic Branch
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.clinicBranch}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Referral by
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.referralBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="flex w-full lg:max-w-[1024px] flex-col items-start gap-2">
                    <div className="flex w-full items-center gap-2">
                      <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                        Contact information
                      </span>
                    </div>
                    <div className="flex w-full flex-col items-start justify-between">
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Email
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.email}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Mobile
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.mobile}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Alternative phone
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.alternativePhone}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Preferred contact time
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.preferredContactTime}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Address
                        </span>
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-large font-body-large text-default-font text-right">
                          {patientData.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="flex w-full lg:max-w-[1024px] flex-col items-start gap-2">
                    <div className="flex w-full items-center gap-2">
                      <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                        Insurance
                      </span>
                    </div>
                    <div className="flex w-full flex-col items-start justify-between">
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Insurance plan
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.insurancePlan}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Insurance name
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.insuranceName}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Insurance ID
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.insuranceId}
                        </span>
                      </div>
                      <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Valid until
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.insuranceValidUntil}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider - Only show on large screens */}
                <div className="hidden lg:flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />

                {/* Right Column - Additional Information */}
                <div className="flex w-full lg:w-96 flex-col items-start lg:items-end gap-4 lg:pr-4 pt-4">
                  {/* Professional Assigned */}
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full items-center lg:justify-end justify-start gap-2">
                      <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                        Professional Assigned
                      </span>
                    </div>
                    <div className="flex w-full flex-col items-start justify-between">
                      <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Professional
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.professionalAssigned}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Patient Groups */}
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full items-center gap-2">
                      <div className="flex grow shrink-0 basis-0 items-center gap-2">
                        <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                          Patient groups
                        </span>
                        <IconButton
                          disabled={false}
                          variant="neutral-secondary"
                          size="medium"
                          icon={<FeatherPlus />}
                          loading={false}
                          onClick={() => setGroupModalOpen(true)}
                        />
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-3 py-2">
                      {patientGroups.length > 0 ? (
                        patientGroups.map((group, index) => (
                          <div key={index} className="flex w-full items-center gap-2 rounded-md bg-neutral-50 px-2 py-2">
                            <div className="flex items-center gap-4 px-1 py-1 flex-shrink-0">
                              <FeatherCheckCircle className="text-body-medium font-body-medium text-brand-700" />
                            </div>
                            <div 
                              className="flex-1 text-body-medium font-body-medium text-default-font min-w-0" 
                              style={{ 
                                wordBreak: 'break-word', 
                                overflowWrap: 'anywhere',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {group.name}
                            </div>
                            <IconButton
                              size="small"
                              icon={<FeatherTrash />}
                              onClick={() => handleRemoveFromGroup(group.id, group.name)}
                              className="flex-shrink-0"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="flex w-full items-center justify-start py-2">
                          <span className="text-body-medium text-neutral-500">
                            No groups assigned yet
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Family */}
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full items-center gap-2">
                      <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                        Family
                      </span>
                      <IconButton
                        disabled={false}
                        variant="neutral-secondary"
                        size="medium"
                        icon={<FeatherPlus />}
                        loading={false}
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                      />
                    </div>
                    <div className="flex w-full flex-col items-start justify-between">
                      <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                        <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                          Family member
                        </span>
                        <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                          {patientData.familyMembers}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Notes */}
                  <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background shadow-sm">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-6 py-6">
                          <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                            Quick Notes
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={false}
                    >
                      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 border-t border-solid border-neutral-border px-6 py-6">
                        {patientData.quickNotes.map((note, index) => (
                          <div key={index} className="flex w-full items-start gap-2 rounded-md bg-neutral-50 px-2 py-2">
                            <div className="flex items-center gap-4 px-1 py-1 flex-shrink-0">
                              <FeatherCheckCircle className="text-body-medium font-body-medium text-brand-700" />
                            </div>
                            <div 
                              className="flex-1 text-body-medium font-body-medium text-default-font min-w-0" 
                              style={{ 
                                wordBreak: 'break-word', 
                                overflowWrap: 'anywhere',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {note}
                            </div>
                            <IconButton
                              size="small"
                              icon={<FeatherTrash />}
                              onClick={() => handleDeleteNote(index)}
                              className="flex-shrink-0"
                            />
                          </div>
                        ))}
                        
                        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-200" />
                        <div className="flex w-full items-center gap-2">
                          <TextField
                            className="flex-1 h-10"
                            disabled={false}
                            error={false}
                            label=""
                            helpText=""
                            icon={null}
                            iconRight={null}
                          >
                            <TextField.Input
                              placeholder="Add a quick note..."
                              value={newNote}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewNote(event.target.value)}
                              onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
                                if (event.key === 'Enter') {
                                  handleAddNote();
                                }
                              }}
                            />
                          </TextField>
                          <IconButton
                            size="medium"
                            variant="brand-primary"
                            icon={<FeatherSend />}
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            className="flex-shrink-0 w-10 h-10"
                          />
                        </div>
                      </div>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Patient Modal */}
      <AddPatientModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onPatientAdded={handlePatientUpdated}
        editingPatient={currentPatient}
      />

      {/* Add to Group Modal */}
      <AddToGroupModal
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
        patient={currentPatient}
        onPatientUpdated={handlePatientUpdated}
        showToast={false}
      />
    </DefaultPageLayout>
  );
}

export default PatientInfo;