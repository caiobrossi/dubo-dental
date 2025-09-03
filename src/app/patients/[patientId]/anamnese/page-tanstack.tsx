"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useAnamneseColumns, type AnamneseData } from "./components/columns";

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
  
  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState("");

  // Sample data for anamnese forms
  const anamneseData: AnamneseData[] = useMemo(() => [
    {
      id: '1',
      name: 'Medical History',
      type: 'medical',
      lastDate: '23/03/2025',
      alerts: '8 generated alerts',
      reviewed: true,
      status: 'completed',
      professionalName: 'Dr. Sarah Johnson',
      professionalAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
    },
    {
      id: '2',
      name: 'Orthodontic Anamnese',
      type: 'orthodontic',
      lastDate: '23/03/2025',
      alerts: '4 generated alerts',
      reviewed: true,
      status: 'completed',
      professionalName: 'Dr. Emily Chen',
      professionalAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
    },
    {
      id: '3',
      name: 'Dental History',
      type: 'dental',
      lastDate: '23/03/2025',
      alerts: '4 generated alerts',
      reviewed: true,
      status: 'completed',
      professionalName: 'Dr. Michael Rodriguez',
      professionalAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c8a2406f'
    }
  ], []);

  const columns = useAnamneseColumns({
    onEdit: (anamnese) => console.log('Edit:', anamnese),
    onDelete: (anamnese) => console.log('Delete:', anamnese),
    onView: (anamnese) => console.log('View:', anamnese),
  });

  const table = useReactTable({
    data: anamneseData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchValue,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearchValue,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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
          
          patientId = patients[0].id;
        }

        setActualPatientId(patientId);

        // Now fetch the full patient data using the ID
        const { data: patient, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (error) {
          console.error('Error fetching patient:', error);
          router.push('/patients');
          return;
        }

        if (!patient) {
          console.error('Patient not found');
          router.push('/patients');
          return;
        }

        // Calculate age from date_of_birth
        const calculateAge = (birthDate: string) => {
          const birth = new Date(birthDate);
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          return age;
        };

        setPatientData({
          name: formatPatientNameForDisplay(patient.name || 'Unknown Patient'),
          gender: patient.gender || 'Unknown',
          age: patient.date_of_birth ? `${calculateAge(patient.date_of_birth)} years` : 'Unknown',
          patientId: patient.id || 'N/A',
          avatarUrl: patient.avatar_url || undefined
        });
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching patient:', error);
        router.push('/patients');
      }
    };

    fetchPatientData();
  }, [patientSlug, router]);

  const patientId = actualPatientId || patientSlug;

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 bg-default-background shadow-md pb-3">
        {/* Header with Member Banner */}
        <div className="w-full">
          <MemberBanner
            className="px-4 sm:px-6 pt-6 pb-4"
            name={patientData.name}
            subheader={
              <Badge
                variant="error"
                icon={<FeatherAlertTriangle />}
                iconRight={null}
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
                      active={activeSegment === "files"}
                      onClick={() => {}}
                    >
                      Files
                    </SegmentControl.Item>
                    <SegmentControl.Item 
                      active={activeSegment === "treatment-plan"}
                      onClick={() => {}}
                    >
                      Treatment plan
                    </SegmentControl.Item>
                    <SegmentControl.Item 
                      active={activeSegment === "payment"}
                      onClick={() => {}}
                    >
                      Payment
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
                          icon={<FeatherBaby />}
                          square={false}
                        />
                        <div className="flex flex-col items-start justify-end gap-2">
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            Kids Only
                          </span>
                          <span className="text-body-small font-body-small text-subtext-color">
                            12 questions
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
                          variant="default"
                          size="medium"
                          icon={<FeatherAlertTriangle />}
                          square={false}
                        />
                        <div className="flex flex-col items-start justify-end gap-2">
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            Allergies
                          </span>
                          <span className="text-body-small font-body-small text-subtext-color">
                            8 questions
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
                          variant="brand"
                          size="medium"
                          icon={<FeatherHeartPulse />}
                          square={false}
                        />
                        <div className="flex flex-col items-start justify-end gap-2">
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            Health Status
                          </span>
                          <span className="text-body-small font-body-small text-subtext-color">
                            25 questions
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
                </div>

                {/* Table Section - Now using TanStack Table */}
                <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
                  {/* Header */}
                  <div className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-[5]">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <div key={headerGroup.id} className="flex">
                        {headerGroup.headers.map((header) => (
                          <div
                            key={header.id}
                            className="flex-1 px-4 py-3 text-left text-sm font-medium text-neutral-900 first:pl-6 last:pr-6"
                            style={{ 
                              minWidth: header.column.columnDef.minSize || 150,
                              width: header.column.columnDef.size 
                            }}
                          >
                            {header.isPlaceholder ? null : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Body */}
                  <div className="overflow-auto">
                    <div className="w-full">
                      {table.getRowModel().rows.map((row) => (
                        <div
                          key={row.id}
                          className="flex items-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                          style={{ minHeight: 80 }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <div
                              key={cell.id}
                              className="flex-1 px-4 py-3 text-sm text-neutral-900 first:pl-6 last:pr-6 overflow-hidden"
                              style={{ 
                                minWidth: cell.column.columnDef.minSize || 150,
                                width: cell.column.columnDef.size 
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          ))}
                        </div>
                      ))}
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