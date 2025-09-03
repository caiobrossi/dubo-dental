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
import * as SubframeCore from "@subframe/core";
import { supabase } from "@/lib/supabase";
import { formatPatientNameForDisplay } from "@/app/scheduling/utils/nameUtils";
import { createPatientSlug, parsePatientSlug } from "@/utils/patientSlug";

interface PatientData {
  name: string;
  gender: string;
  age: string;
  patientId: string;
  avatarUrl?: string;
}

function AnamnesesPage() {
  const params = useParams();
  const router = useRouter();
  const patientSlug = params?.patientId as string;
  
  const [patientData, setPatientData] = useState<PatientData>({
    name: "Loading...",
    gender: "Unknown",
    age: "Unknown",
    patientId: "N/A"
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSegment, setActiveSegment] = useState("anamnese");
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
                          onClick={() => router.push(`/patients/${patientId}`)}
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
                      onClick={() => setActiveSegment("anamnese")}
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
            
            {/* Anamnese Content */}
            <div className="flex w-full flex-col items-start gap-8 px-2 py-2">
              <div className="w-full max-w-[2000px] mx-auto px-4 space-y-8">
                {/* Responsive grid for cards - all in one row on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <CustomComponent
                    className="h-40 w-full"
                    content={
                      <>
                        <IconWithBackground
                          variant="brand"
                          size="medium"
                          icon={<FeatherPill />}
                          square={false}
                        />
                        <div className="flex flex-col items-start justify-end gap-2">
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            Medical History
                          </span>
                          <span className="text-body-small font-body-small text-subtext-color">
                            23 questions
                          </span>
                        </div>
                      </>
                    }
                  >
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Medical History Form
                    </span>
                    <span className="text-body-small font-body-small text-subtext-color">
                      30 questions
                    </span>
                  </CustomComponent>
                  <CustomComponent
                    className="h-40 w-full"
                    content={
                      <>
                        <IconWithBackground
                          variant="error"
                          size="medium"
                          icon={<FeatherHistory />}
                          square={false}
                        />
                        <div className="flex flex-col items-start justify-end gap-2">
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            Dental History 
                          </span>
                          <span className="text-body-small font-body-small text-subtext-color">
                            30 questions
                          </span>
                        </div>
                      </>
                    }
                  >
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Medical History Form
                    </span>
                    <span className="text-body-small font-body-small text-subtext-color">
                      30 questions
                    </span>
                  </CustomComponent>
                  <CustomComponent
                    className="h-40 w-full"
                    content={
                      <>
                        <IconWithBackground
                          variant="success"
                          size="medium"
                          icon={<FeatherProportions />}
                          square={false}
                        />
                        <div className="flex flex-col items-start justify-end gap-2">
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            Orthodontcs
                          </span>
                          <span className="text-body-small font-body-small text-subtext-color">
                            15 questions
                          </span>
                        </div>
                      </>
                    }
                  >
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Medical History Form
                    </span>
                    <span className="text-body-small font-body-small text-subtext-color">
                      30 questions
                    </span>
                  </CustomComponent>
                  <CustomComponent
                    className="h-40 w-full"
                    content={
                      <>
                        <IconWithBackground
                          variant="warning"
                          size="medium"
                          icon={<FeatherHeartPulse />}
                          square={false}
                        />
                        <div className="flex flex-col items-start justify-end gap-2">
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            Cosmetic dentistry
                          </span>
                          <span className="text-body-small font-body-small text-subtext-color">
                            10 questions
                          </span>
                        </div>
                      </>
                    }
                  >
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Medical History Form
                    </span>
                    <span className="text-body-small font-body-small text-subtext-color">
                      30 questions
                    </span>
                  </CustomComponent>
                  <CustomComponent
                    className="h-40 w-full"
                    content={
                      <>
                        <IconWithBackground
                          size="medium"
                          icon={<FeatherBaby />}
                          square={false}
                        />
                        <div className="flex flex-col items-start justify-end gap-2">
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            Pediatric History
                          </span>
                          <span className="text-body-small font-body-small text-subtext-color">
                            10 questions
                          </span>
                        </div>
                      </>
                    }
                  >
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Medical History Form
                    </span>
                    <span className="text-body-small font-body-small text-subtext-color">
                      30 questions
                    </span>
                  </CustomComponent>
                  <CustomComponent
                    className="h-40 w-full"
                    content={
                      <>
                        <IconWithBackground
                          variant="neutral"
                          size="medium"
                          icon={<FeatherPlus />}
                          square={false}
                        />
                        <span className="text-heading-3 font-heading-3 text-default-font">
                          Create new
                        </span>
                      </>
                    }
                  >
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Medical History Form
                    </span>
                    <span className="text-body-small font-body-small text-subtext-color">
                      30 questions
                    </span>
                  </CustomComponent>
                </div>
                
                {/* Section Title with spacing */}
                <div className="mt-8 mb-4">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Latest anamnese
                  </span>
                </div>
                
                {/* Table with proper spacing - Labs Style */}
                <div className="w-full h-full flex flex-col">
                  {/* Table container */}
                  <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden flex-1 flex flex-col">
                    {/* Header */}
                    <div className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-[5]">
                      <div className="flex">
                        <div className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6" style={{ minWidth: 250 }}>
                          Anamnese template
                        </div>
                        <div className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6" style={{ minWidth: 120 }}>
                          Filled on
                        </div>
                        <div className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6" style={{ minWidth: 150 }}>
                          Alerts
                        </div>
                        <div className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6" style={{ minWidth: 120 }}>
                          Patient signed
                        </div>
                        <div className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6" style={{ minWidth: 120 }}>
                          Status
                        </div>
                        <div className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6" style={{ minWidth: 200 }}>
                          Practitioner
                        </div>
                        <div className="px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6" style={{ width: 80 }}>
                          Actions
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="overflow-auto flex-1">
                      <div className="w-full">
                        {/* Row 1 */}
                        <div className="flex items-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors" style={{ minHeight: 80 }}>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 250 }}>
                            <div className="flex items-center gap-4">
                              <IconWithBackground
                                variant="success"
                                size="medium"
                                icon={<FeatherProportions />}
                              />
                              <LinkButton
                                variant="brand"
                                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                              >
                                Orthodontic Anamnese
                              </LinkButton>
                            </div>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 120 }}>
                            <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                              23/03/2025
                            </span>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 150 }}>
                            <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                              4 generated alerts
                            </span>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 120 }}>
                            <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                              Yes
                            </span>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 120 }}>
                            <Chips variant="success" size="large">
                              Completed
                            </Chips>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 200 }}>
                            <div className="flex items-center gap-2">
                              <Avatar image="https://images.unsplash.com/photo-1494790108377-be9c29b29330" />
                              <span className="text-body-medium font-body-medium text-neutral-500">
                                Dr. Emily Chen
                              </span>
                            </div>
                          </div>
                          <div className="px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ width: 80 }}>
                            <div className="flex grow shrink-0 basis-0 items-center justify-end">
                              <SubframeCore.DropdownMenu.Root>
                                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                                  <IconButton
                                    icon={<FeatherMoreHorizontal />}
                                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                                  />
                                </SubframeCore.DropdownMenu.Trigger>
                                <SubframeCore.DropdownMenu.Portal>
                                  <SubframeCore.DropdownMenu.Content
                                    side="bottom"
                                    align="end"
                                    sideOffset={8}
                                    asChild={true}
                                  >
                                    <DropdownMenu>
                                      <DropdownMenu.DropdownItem>
                                        Favorite
                                      </DropdownMenu.DropdownItem>
                                      <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                                        Add
                                      </DropdownMenu.DropdownItem>
                                      <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                                        Edit
                                      </DropdownMenu.DropdownItem>
                                      <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                                        Delete
                                      </DropdownMenu.DropdownItem>
                                    </DropdownMenu>
                                  </SubframeCore.DropdownMenu.Content>
                                </SubframeCore.DropdownMenu.Portal>
                              </SubframeCore.DropdownMenu.Root>
                            </div>
                          </div>
                        </div>
                        {/* Row 2 */}
                        <div className="flex items-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors" style={{ minHeight: 80 }}>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 250 }}>
                            <div className="flex items-center gap-4">
                              <IconWithBackground
                                variant="error"
                                size="medium"
                                icon={<FeatherHistory />}
                              />
                              <LinkButton
                                variant="brand"
                                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                              >
                                Dental History
                              </LinkButton>
                            </div>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 120 }}>
                            <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                              23/03/2025
                            </span>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 150 }}>
                            <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                              4 generated alerts
                            </span>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 120 }}>
                            <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                              Yes
                            </span>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 120 }}>
                            <Chips variant="success" size="large">
                              Completed
                            </Chips>
                          </div>
                          <div className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ minWidth: 200 }}>
                            <div className="flex items-center gap-2">
                              <Avatar image="https://images.unsplash.com/photo-1539571696357-5a69c8a2406f" />
                              <span className="text-body-medium font-body-medium text-neutral-500">
                                Dr. Michael Rodriguez
                              </span>
                            </div>
                          </div>
                          <div className="px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden" style={{ width: 80 }}>
                            <div className="flex grow shrink-0 basis-0 items-center justify-end">
                              <SubframeCore.DropdownMenu.Root>
                                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                                  <IconButton
                                    icon={<FeatherMoreHorizontal />}
                                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                                  />
                                </SubframeCore.DropdownMenu.Trigger>
                                <SubframeCore.DropdownMenu.Portal>
                                  <SubframeCore.DropdownMenu.Content
                                    side="bottom"
                                    align="end"
                                    sideOffset={8}
                                    asChild={true}
                                  >
                                    <DropdownMenu>
                                      <DropdownMenu.DropdownItem>
                                        Favorite
                                      </DropdownMenu.DropdownItem>
                                      <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                                        Add
                                      </DropdownMenu.DropdownItem>
                                      <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                                        Edit
                                      </DropdownMenu.DropdownItem>
                                      <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                                        Delete
                                      </DropdownMenu.DropdownItem>
                                    </DropdownMenu>
                                  </SubframeCore.DropdownMenu.Content>
                                </SubframeCore.DropdownMenu.Portal>
                              </SubframeCore.DropdownMenu.Root>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default AnamnesesPage;