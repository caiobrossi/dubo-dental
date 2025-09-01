"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { Table } from "@/ui/components/Table";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherCalendar } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { useRouter } from "next/navigation";
import { supabase, Professional } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

// Interface para schedule shifts
interface ScheduleShift {
  id?: string;
  professional_id: string;
  week_start_date: string; // ISO string of Monday of the week
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  total_hours?: number;
}

// Interface para display com professional data
interface DisplaySchedule extends ScheduleShift {
  professional: Professional;
}

// Helper function para calcular horas de um range (ex: "09:00-18:00")
const calculateHours = (timeRange: string): number => {
  if (!timeRange || timeRange.trim() === '') return 0;
  
  const regex = /(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/;
  const match = timeRange.match(regex);
  
  if (!match) return 0;
  
  const startHour = parseInt(match[1]);
  const startMin = parseInt(match[2]);
  const endHour = parseInt(match[3]);
  const endMin = parseInt(match[4]);
  
  const startTime = startHour + startMin / 60;
  const endTime = endHour + endMin / 60;
  
  return Math.max(0, endTime - startTime);
};

// Helper para calcular total de horas da semana
const calculateWeeklyHours = (schedule: ScheduleShift): number => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.reduce((total, day) => {
    const daySchedule = schedule[day as keyof ScheduleShift] as string || '';
    return total + calculateHours(daySchedule);
  }, 0);
};

// Get week dates for any given date
const getWeekDates = (targetDate: Date): { dates: string[], weekRange: string, fullDates: Date[] } => {
  const currentDay = targetDate.getDay();
  const monday = new Date(targetDate);
  monday.setDate(targetDate.getDate() - currentDay + 1);
  
  const dates = [];
  const fullDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.getDate().toString());
    fullDates.push(new Date(date));
  }

  // Format week range (e.g., "18 - 24 Nov 2024")
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekRange = `${monday.getDate()} - ${sunday.getDate()} ${sunday.toLocaleString('en', { month: 'short' })} ${sunday.getFullYear()}`;

  return { dates, weekRange, fullDates };
};

// Navigation functions
const navigateWeek = (currentDate: Date, direction: 'prev' | 'next' | 'today'): Date => {
  if (direction === 'today') {
    return new Date();
  }
  
  const newDate = new Date(currentDate);
  if (direction === 'prev') {
    newDate.setDate(currentDate.getDate() - 7);
  } else {
    newDate.setDate(currentDate.getDate() + 7);
  }
  return newDate;
};

// Get Monday of the week for a given date
const getWeekStartDate = (date: Date): Date => {
  const currentDay = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - currentDay + 1);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

function ScheduleShifts() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  const [schedules, setSchedules] = useState<DisplaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { dates: weekDates, weekRange, fullDates } = getWeekDates(selectedDate);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load professionals and their schedules
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get the Monday of the selected week
      const weekStart = getWeekStartDate(selectedDate);
      const weekStartString = weekStart.toISOString().split('T')[0];
      
      // First get all professionals
      const { data: professionals, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (profError) throw profError;

      if (!professionals || professionals.length === 0) {
        setSchedules([]);
        return;
      }

      // Then get existing schedules for this specific week
      const { data: existingSchedules, error: scheduleError } = await supabase
        .from('schedule_shifts')
        .select('*')
        .eq('week_start_date', weekStartString);

      if (scheduleError) {
        console.error('Error loading schedules (table might not exist yet):', scheduleError);
      }

      // Combine professionals with their schedules
      const combinedData = professionals.map(prof => {
        const existingSchedule = existingSchedules?.find(s => s.professional_id === prof.id);
        
        // Auto-populate with professional's working hours if no existing schedule
        const schedule: ScheduleShift = existingSchedule || {
          professional_id: prof.id,
          week_start_date: weekStartString,
          monday: prof.monday_start && prof.monday_end ? `${prof.monday_start}-${prof.monday_end}` : '',
          tuesday: prof.tuesday_start && prof.tuesday_end ? `${prof.tuesday_start}-${prof.tuesday_end}` : '',
          wednesday: prof.wednesday_start && prof.wednesday_end ? `${prof.wednesday_start}-${prof.wednesday_end}` : '',
          thursday: prof.thursday_start && prof.thursday_end ? `${prof.thursday_start}-${prof.thursday_end}` : '',
          friday: prof.friday_start && prof.friday_end ? `${prof.friday_start}-${prof.friday_end}` : '',
          saturday: prof.saturday_start && prof.saturday_end ? `${prof.saturday_start}-${prof.saturday_end}` : '',
          sunday: prof.sunday_start && prof.sunday_end ? `${prof.sunday_start}-${prof.sunday_end}` : '',
        };

        schedule.total_hours = calculateWeeklyHours(schedule);

        return {
          ...schedule,
          professional: prof
        } as DisplaySchedule;
      });

      setSchedules(combinedData);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle time input change
  const handleTimeChange = useCallback((professionalId: string, day: keyof ScheduleShift, value: string) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.professional_id === professionalId) {
        const updated = { ...schedule, [day]: value };
        updated.total_hours = calculateWeeklyHours(updated);
        return updated;
      }
      return schedule;
    }));
  }, []);

  // Save all schedules
  const handleSaveAll = useCallback(async () => {
    try {
      setSaving(true);

      // Get the Monday of the selected week
      const weekStart = getWeekStartDate(selectedDate);
      const weekStartString = weekStart.toISOString().split('T')[0];

      // Prepare data for upsert
      const schedulesToSave = schedules.map(schedule => ({
        professional_id: schedule.professional_id,
        week_start_date: weekStartString,
        monday: schedule.monday || null,
        tuesday: schedule.tuesday || null,
        wednesday: schedule.wednesday || null,
        thursday: schedule.thursday || null,
        friday: schedule.friday || null,
        saturday: schedule.saturday || null,
        sunday: schedule.sunday || null,
        total_hours: schedule.total_hours || 0,
      }));

      const { error } = await supabase
        .from('schedule_shifts')
        .upsert(schedulesToSave, { 
          onConflict: 'professional_id,week_start_date',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      showSuccess('Schedule shifts saved successfully');
    } catch (error) {
      console.error('Error saving schedules:', error);
      showError('Failed to save schedule shifts');
    } finally {
      setSaving(false);
    }
  }, [schedules, selectedDate, showSuccess, showError]);

  // Week navigation handlers
  const handleWeekNavigation = useCallback((direction: 'prev' | 'next' | 'today') => {
    const newDate = navigateWeek(selectedDate, direction);
    setSelectedDate(newDate);
  }, [selectedDate]);

  // Delete all shifts for a professional for this week
  const handleDeleteAllShifts = useCallback(async (professionalId: string) => {
    if (!window.confirm('Are you sure you want to delete all shifts for this professional for this week?')) return;

    try {
      // Get the Monday of the selected week
      const weekStart = getWeekStartDate(selectedDate);
      const weekStartString = weekStart.toISOString().split('T')[0];

      const { error } = await supabase
        .from('schedule_shifts')
        .delete()
        .eq('professional_id', professionalId)
        .eq('week_start_date', weekStartString);

      if (error) throw error;

      // Update local state
      setSchedules(prev => prev.map(schedule => {
        if (schedule.professional_id === professionalId) {
          return {
            ...schedule,
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: '',
            total_hours: 0
          };
        }
        return schedule;
      }));

      showSuccess('Week shifts deleted successfully');
    } catch (error) {
      console.error('Error deleting shifts:', error);
      showError('Failed to delete shifts');
    }
  }, [selectedDate, showSuccess, showError]);

  if (loading) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center bg-white">
          <span className="text-body-medium font-body-medium text-subtext-color">Loading schedules...</span>
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
                Clinic Up
              </span>
            </div>
            <Button
              disabled={saving}
              variant="brand-primary"
              size="large"
              icon={<FeatherCheck />}
              loading={saving}
              onClick={handleSaveAll}
            >
              Save All Schedules
            </Button>
          </div>
          <SegmentControl
            className="h-10 w-auto flex-none"
            variant="default"
            variant2="default"
          >
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin')}
            >
              Clinic Info
            </SegmentControl.Item>
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
            <SegmentControl.Item active={true}>Schedule shifts</SegmentControl.Item>
            <SegmentControl.Item active={false}>Team payment</SegmentControl.Item>
            <SegmentControl.Item active={false}>Finance</SegmentControl.Item>
          </SegmentControl>
        </div>

        {/* Week Navigation */}
        <div className="flex w-full items-center justify-center py-4 px-8 bg-white border-b border-neutral-border/50">
          <div className="flex items-center gap-4">
            <IconButton
              size="medium"
              icon={<FeatherChevronLeft />}
              onClick={() => handleWeekNavigation('prev')}
              variant="neutral-tertiary"
            />
            <div className="flex items-center gap-2">
              <span className="text-heading-2 font-heading-2 text-default-font">
                Week: {weekRange}
              </span>
              <Button
                size="small"
                variant="neutral-secondary"
                onClick={() => handleWeekNavigation('today')}
              >
                Today
              </Button>
            </div>
            <IconButton
              size="medium"
              icon={<FeatherChevronRight />}
              onClick={() => handleWeekNavigation('next')}
              variant="neutral-tertiary"
            />
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-stretch gap-2 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          {schedules.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-body-medium font-body-medium text-subtext-color">
                No professionals found. Add team members first.
              </span>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table 
                className="h-auto w-full flex-none min-w-[1200px]"
                header={
                  <Table.HeaderRow>
                    <Table.HeaderCell className="w-80">Professional</Table.HeaderCell>
                    {dayNames.map((day, index) => (
                      <Table.HeaderCell key={day} className="min-w-28 px-2">
                        {weekDates[index]} - {day}
                      </Table.HeaderCell>
                    ))}
                  </Table.HeaderRow>
                }
              >
                {schedules.map((schedule) => (
                    <Table.Row key={schedule.professional_id} className="h-24 w-auto flex-none" clickable={false}>
                      <Table.Cell className="h-20 w-80 flex-none">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-start gap-4">
                            <Avatar
                              size="large"
                              image={schedule.professional.image}
                              square={false}
                            >
                              {schedule.professional.name?.charAt(0) || 'A'}
                            </Avatar>
                            <div className="flex flex-col items-start gap-1">
                              <span className="whitespace-nowrap text-[16px] font-medium text-neutral-700">
                                {schedule.professional.name}
                              </span>
                              <span className="whitespace-nowrap text-[14px] font-normal text-subtext-color">
                                {schedule.total_hours?.toFixed(1) || 0} hours
                              </span>
                            </div>
                          </div>
                          <SubframeCore.DropdownMenu.Root>
                            <SubframeCore.DropdownMenu.Trigger asChild={true}>
                              <IconButton
                                size="medium"
                                icon={<FeatherMoreHorizontal />}
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
                                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                                    Edit professional
                                  </DropdownMenu.DropdownItem>
                                  <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                                    Add time off
                                  </DropdownMenu.DropdownItem>
                                  <DropdownMenu.DropdownItem icon={<FeatherCalendar />}>
                                    View calendar
                                  </DropdownMenu.DropdownItem>
                                  <DropdownMenu.DropdownItem 
                                    icon={<FeatherTrash />}
                                    onClick={() => handleDeleteAllShifts(schedule.professional_id)}
                                  >
                                    Delete all shifts
                                  </DropdownMenu.DropdownItem>
                                </DropdownMenu>
                              </SubframeCore.DropdownMenu.Content>
                            </SubframeCore.DropdownMenu.Portal>
                          </SubframeCore.DropdownMenu.Root>
                        </div>
                      </Table.Cell>
                      
                      {/* Monday */}
                      <Table.Cell className="h-20 min-w-28 flex-none px-2">
                        <div className="h-10 w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-border rounded px-2 py-2 flex items-center cursor-pointer transition-colors">
                          <span className="text-[14px] text-neutral-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {schedule.monday || '09:00 - 18:00'}
                          </span>
                        </div>
                      </Table.Cell>

                      {/* Tuesday */}
                      <Table.Cell className="h-20 min-w-28 flex-none px-2">
                        <div className="h-10 w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-border rounded px-2 py-2 flex items-center cursor-pointer transition-colors">
                          <span className="text-[14px] text-neutral-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {schedule.tuesday || '09:00 - 18:00'}
                          </span>
                        </div>
                      </Table.Cell>

                      {/* Wednesday */}
                      <Table.Cell className="h-20 min-w-28 flex-none px-2">
                        <div className="h-10 w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-border rounded px-2 py-2 flex items-center cursor-pointer transition-colors">
                          <span className="text-[14px] text-neutral-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {schedule.wednesday || '09:00 - 18:00'}
                          </span>
                        </div>
                      </Table.Cell>

                      {/* Thursday */}
                      <Table.Cell className="h-20 min-w-28 flex-none px-2">
                        <div className="h-10 w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-border rounded px-2 py-2 flex items-center cursor-pointer transition-colors">
                          <span className="text-[14px] text-neutral-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {schedule.thursday || '09:00 - 18:00'}
                          </span>
                        </div>
                      </Table.Cell>

                      {/* Friday */}
                      <Table.Cell className="h-20 min-w-28 flex-none px-2">
                        <div className="h-10 w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-border rounded px-2 py-2 flex items-center cursor-pointer transition-colors">
                          <span className="text-[14px] text-neutral-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {schedule.friday || '09:00 - 18:00'}
                          </span>
                        </div>
                      </Table.Cell>

                      {/* Saturday */}
                      <Table.Cell className="h-20 min-w-28 flex-none px-2">
                        <div className="h-10 w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-border rounded px-2 py-2 flex items-center cursor-pointer transition-colors">
                          <span className="text-[14px] text-neutral-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {schedule.saturday || '09:00 - 12:00'}
                          </span>
                        </div>
                      </Table.Cell>

                      {/* Sunday */}
                      <Table.Cell className="h-20 min-w-28 flex-none px-2">
                        <div className="h-10 w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-border rounded px-2 py-2 flex items-center cursor-pointer transition-colors">
                          <span className="text-[14px] text-neutral-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {schedule.sunday || 'Closed'}
                          </span>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table>
            </div>
          )}
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default ScheduleShifts;