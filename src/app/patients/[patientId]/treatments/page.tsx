"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { MemberBanner } from "@/ui/components/MemberBanner";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { Avatar } from "@/ui/components/Avatar";
import { Chips } from "@/ui/components/Chips";
import { CustomComponent } from "@/ui/components/CustomComponent";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { LinkButton } from "@/ui/components/LinkButton";
import { Table } from "@/ui/components/Table";
import { Progress } from "@/ui/components/Progress";
import { FeatherAlertTriangle } from "@subframe/core";
import { FeatherArrowLeft } from "@subframe/core";
import { FeatherBaby } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherHeartPulse } from "@subframe/core";
import { FeatherHistory } from "@subframe/core";
import { FeatherMail } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPhone } from "@subframe/core";
import { FeatherPill } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherProportions } from "@subframe/core";
import { FeatherSmartphone } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherMoreVertical } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { supabase } from "@/lib/supabase";
import { formatPatientNameForDisplay } from "@/app/scheduling/utils/nameUtils";
import { createPatientSlug, parsePatientSlug } from "@/utils/patientSlug";
import NewTreatmentModal from "@/components/custom/NewTreatmentModal";
import { useSettings } from "@/contexts/SettingsContext";

interface PatientData {
  name: string;
  gender: string;
  age: string;
  patientId: string;
  avatarUrl?: string;
}

interface Treatment {
  id: string;
  code: string;
  name: string;
  status: string;
  total_procedures: number;
  completed_procedures: number;
  created_at: string;
  updated_at: string;
  professional_id: string;
  expire_date?: string;
  patient_insurance?: string;
}

function TreatmentsPage() {
  const params = useParams();
  const router = useRouter();
  const patientSlug = params?.patientId as string;
  const { formatDate, formatCurrency } = useSettings();
  
  const [patientData, setPatientData] = useState<PatientData>({
    name: "Loading...",
    gender: "Unknown",
    age: "Unknown",
    patientId: "N/A"
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSegment, setActiveSegment] = useState("treatments");
  const [actualPatientId, setActualPatientId] = useState<string | null>(null);
  const [isNewTreatmentModalOpen, setIsNewTreatmentModalOpen] = useState(false);
  const [treatments, setTreatments] = useState<Treatment[]>([]);

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
            .or(`id.like.${slugData.id}%,id.ilike.${slugData.id}%`)
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

        // Fetch patient data from Supabase
        const { data: patient, error } = await supabase
          .from('patients')
          .select(`
            *,
            professionals:professional_id (
              id,
              name
            )
          `)
          .eq('id', patientId)
          .single();

        if (error || !patient) {
          console.error('Error fetching patient:', error);
          router.push('/patients');
          return;
        }

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
          avatarUrl: patient.avatar_url
        };

        setPatientData(mappedData);
      } catch (error) {
        console.error('Error loading patient data:', error);
        router.push('/patients');
      } finally {
        setIsLoaded(true);
      }
    };

    fetchPatientData();
  }, [patientSlug, router]);

  // Load treatments for this patient
  const fetchTreatments = async () => {
    if (!actualPatientId) return;

    try {
      const { data: treatmentsData, error } = await supabase
        .from('treatments')
        .select(`
          id,
          code,
          name,
          status,
          total_procedures,
          completed_procedures,
          created_at,
          updated_at,
          professional_id,
          expire_date,
          patient_insurance,
          professionals:professional_id (
            name
          )
        `)
        .eq('patient_id', actualPatientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching treatments:', error);
      } else {
        setTreatments(treatmentsData || []);
      }
    } catch (error) {
      console.error('Error fetching treatments:', error);
    }
  };

  // Load treatments when patient is loaded
  useEffect(() => {
    if (actualPatientId && isLoaded) {
      fetchTreatments();
    }
  }, [actualPatientId, isLoaded]);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { variant: 'success' as const, text: 'Approved' };
      case 'pending':
        return { variant: 'warning' as const, text: 'Pending' };
      case 'in_progress':
        return { variant: 'brand' as const, text: 'In Progress' };
      case 'completed':
        return { variant: 'success' as const, text: 'Completed' };
      case 'cancelled':
        return { variant: 'error' as const, text: 'Cancelled' };
      default:
        return { variant: 'neutral' as const, text: 'Unknown' };
    }
  };

  const getProgressValue = (treatment: Treatment) => {
    if (treatment.total_procedures === 0) return 0;
    return Math.round((treatment.completed_procedures / treatment.total_procedures) * 100);
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
                onClick={() => {}}
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
                          Back to patient
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
                      onClick={() => router.push(`/patients/${patientSlug}`)}
                    >
                      Overview
                    </SegmentControl.Item>
                    <SegmentControl.Item 
                      active={activeSegment === "patient-info"}
                      onClick={() => router.push(`/patients/${patientSlug}`)}
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
                      onClick={() => router.push(`/patients/${patientSlug}/billing`)}
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
            
            {/* Treatments Content */}
            <div className="flex w-full flex-col items-start gap-8 px-2 py-2">
              <div className="w-full max-w-[2000px] mx-auto px-4 space-y-8">
                {/* Section Title with Create Button */}
                <div className="flex w-full items-center justify-between">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Latest Treatments
                  </span>
                  <Button
                    disabled={false}
                    variant="brand"
                    size="medium"
                    icon={<FeatherPlus />}
                    iconRight={null}
                    loading={false}
                    onClick={() => {
                      console.log("Opening treatment modal");
                      setIsNewTreatmentModalOpen(true);
                    }}
                  >
                    Create new Treatment
                  </Button>
                </div>
                
                {/* Treatment Cards */}
                <div className="flex w-full flex-col items-start gap-2">
                  {treatments.length === 0 ? (
                    <div className="flex w-full items-center justify-center py-12">
                      <span className="text-body-medium font-body-medium text-subtext-color">
                        No treatments found. Create your first treatment to get started.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
                      {treatments.map((treatment: any) => {
                        const statusBadge = getStatusBadge(treatment.status);
                        const progressValue = getProgressValue(treatment);
                        
                        return (
                          <div key={treatment.id} className="flex flex-col items-start gap-3 rounded-md border border-solid border-white bg-neutral-50 hover:bg-neutral-100 hover:shadow-md transition-all duration-200 px-4 py-4">
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-heading-3 font-heading-3 text-default-font">
                                  {treatment.name}
                                </span>
                                <Badge
                                  variant={statusBadge.variant}
                                  icon={null}
                                  iconRight={null}
                                  variant2="default"
                                >
                                  {statusBadge.text}
                                </Badge>
                              </div>
                              <IconButton
                                disabled={false}
                                variant="neutral-secondary"
                                size="medium"
                                icon={<FeatherMoreVertical />}
                                loading={false}
                                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                              />
                            </div>
                            <div className="flex w-full flex-col items-start gap-2">
                              <div className="flex w-full items-start justify-between">
                                <span className="text-body-small font-body-small text-subtext-color">
                                  Professional
                                </span>
                                <span className="text-body-medium font-body-medium text-default-font">
                                  {treatment.professionals?.name || 'Not assigned'}
                                </span>
                              </div>
                              <div className="flex w-full items-start justify-between">
                                <span className="text-body-small font-body-small text-subtext-color">
                                  Total procedures
                                </span>
                                <span className="text-body-medium font-body-medium text-default-font">
                                  {treatment.total_procedures} procedures
                                </span>
                              </div>
                              <div className="flex w-full items-start justify-between">
                                <span className="text-body-small font-body-small text-subtext-color">
                                  Completed
                                </span>
                                <span className="text-body-medium font-body-medium text-default-font">
                                  {treatment.completed_procedures} procedures
                                </span>
                              </div>
                              <div className="flex w-full items-center justify-between">
                                <span className="text-body-small font-body-small text-subtext-color">
                                  Created on
                                </span>
                                <span className="text-body-medium font-body-medium text-default-font">
                                  {formatDate(treatment.created_at)}
                                </span>
                              </div>
                            </div>
                            <Progress value={progressValue} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Treatment Modal */}
      <NewTreatmentModal
        open={isNewTreatmentModalOpen}
        onOpenChange={setIsNewTreatmentModalOpen}
        patientId={actualPatientId}
        patientName={patientData.name}
        onTreatmentCreated={() => {
          // Refresh treatments list
          fetchTreatments();
          console.log("Treatment created successfully, refreshing list");
        }}
      />
    </DefaultPageLayout>
  );
}

export default TreatmentsPage;