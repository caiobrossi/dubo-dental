"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { Switch } from "@/ui/components/Switch";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherEdit2 } from "@subframe/core";
import EditClinicInfoModal from "@/components/custom/EditClinicInfoModal";
import { useRouter } from "next/navigation";

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

// Default clinic data
const defaultClinicData: ClinicInfoData = {
  clinicName: "Clinic Up",
  registeredNumber: "356703 457",
  clinicResponsible: "Caio Brossi",
  responsibleRegNumber: "3046703027",
  teamLanguage: "English",
  businessType: "Dental and Aesthetics",
  email: "contact@caiobrossi.com",
  mobile: "+351 954 345 245",
  alternativePhone: "+351 403 567 267",
  address: "Av Elias Garcia, 157, 7 esquerdo",
  postCode: "1050-0990",
  city: "Lisbon",
  country: "PT",
  workingHours: {
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: true, start: "09:00", end: "14:00" },
    sunday: { enabled: false, start: "09:00", end: "18:00" }
  }
};

function ClinicInfo() {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [clinicData, setClinicData] = useState<ClinicInfoData>(defaultClinicData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('clinic-info-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setClinicData(parsedData);
      }
    } catch (error) {
      console.error('Error loading clinic data from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleClinicDataUpdate = (updatedData: ClinicInfoData) => {
    setClinicData(updatedData);
    // Save to localStorage
    try {
      localStorage.setItem('clinic-info-data', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving clinic data to localStorage:', error);
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
        <div className="flex w-full flex-col items-center bg-white/80 backdrop-blur-md px-8 py-3 border-b border-neutral-border/50">
          <div className="flex w-full items-start justify-between px-2 py-2">
            <div className="flex items-center gap-4">
              <Avatar
                size="large"
                image="https://res.cloudinary.com/subframe/image/upload/v1711417549/shared/jtjkdxvy1mm2ozvaymwv.png"
              >
                A
              </Avatar>
              <span className="text-heading-1 font-heading-1 text-default-font">
                {clinicData.clinicName}
              </span>
            </div>
            <Button
              disabled={false}
              variant="neutral-secondary"
              size="large"
              icon={<FeatherEdit2 />}
              iconRight={null}
              loading={false}
              onClick={() => setEditModalOpen(true)}
            >
              Edit Info
            </Button>
          </div>
          <SegmentControl
            className="h-10 w-auto flex-none"
            variant="default"
            variant2="default"
          >
            <SegmentControl.Item active={true}>Clinic Info</SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin/chairs-rooms')}
            >
              Chairs and Rooms
            </SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin/my-team')}
            >
              My team
            </SegmentControl.Item>
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin/schedule-shifts')}
            >
              Schedule shifts
            </SegmentControl.Item>
            <SegmentControl.Item active={false}>Team payment</SegmentControl.Item>
            <SegmentControl.Item active={false}>Finance</SegmentControl.Item>
          </SegmentControl>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-12 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <div className="flex w-full max-w-[1200px] grow shrink-0 basis-0 items-start gap-8 px-4 pt-6 flex-col lg:flex-row">
            <div className="flex w-full lg:flex-1 flex-col items-start gap-8 self-stretch">
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                    Business Information
                  </span>
                </div>
                <div className="flex w-full flex-col items-start justify-between">
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Register number
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.registeredNumber}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Clinic Responsible
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.clinicResponsible}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Responsible register number
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.responsibleRegNumber}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Team language
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.teamLanguage}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Business type
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.businessType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                    Contact information
                  </span>
                </div>
                <div className="flex w-full flex-col items-start justify-between">
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Company email
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.email}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Phone number
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.mobile}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Secondary Number
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.alternativePhone}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Address
                    </span>
                    <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-large font-body-large text-default-font text-right">
                      {`${clinicData.address}\n${clinicData.postCode} ${clinicData.city}, ${clinicData.country}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                    Billing
                  </span>
                </div>
                <span className="w-full text-body-medium font-body-medium text-subtext-color">
                  These details will appear on the client's sale receipt for
                  this location as well as the information you've configured in
                  your Receipt Template settings.
                </span>
                <div className="flex w-full flex-col items-start justify-between">
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Company phone number
                    </span>
                    <Switch
                      checked={false}
                      onCheckedChange={(checked: boolean) => {}}
                    />
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Company address
                    </span>
                    <Switch
                      checked={false}
                      onCheckedChange={(checked: boolean) => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />
            <div className="flex w-full lg:w-80 xl:w-96 flex-none flex-col items-start gap-2 self-stretch">
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="grow shrink-0 basis-0 font-['Urbanist'] text-[20px] font-[600] leading-[24px] text-default-font">
                    Working hours
                  </span>
                </div>
                <div className="flex w-full flex-col items-start justify-between">
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Monday
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.workingHours.monday.enabled ? `${clinicData.workingHours.monday.start} - ${clinicData.workingHours.monday.end}` : 'closed'}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Tuesday
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.workingHours.tuesday.enabled ? `${clinicData.workingHours.tuesday.start} - ${clinicData.workingHours.tuesday.end}` : 'closed'}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Wednesday
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.workingHours.wednesday.enabled ? `${clinicData.workingHours.wednesday.start} - ${clinicData.workingHours.wednesday.end}` : 'closed'}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Thursday
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.workingHours.thursday.enabled ? `${clinicData.workingHours.thursday.start} - ${clinicData.workingHours.thursday.end}` : 'closed'}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Friday
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.workingHours.friday.enabled ? `${clinicData.workingHours.friday.start} - ${clinicData.workingHours.friday.end}` : 'closed'}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Saturday
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.workingHours.saturday.enabled ? `${clinicData.workingHours.saturday.start} - ${clinicData.workingHours.saturday.end}` : 'closed'}
                    </span>
                  </div>
                  <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                      Sunday
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                      {clinicData.workingHours.sunday.enabled ? `${clinicData.workingHours.sunday.start} - ${clinicData.workingHours.sunday.end}` : 'closed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <EditClinicInfoModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        clinicData={clinicData}
        onClinicInfoUpdated={handleClinicDataUpdate}
      />
    </DefaultPageLayout>
  );
}

export default ClinicInfo;