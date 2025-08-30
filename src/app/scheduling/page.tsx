"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { Calendar } from "@/ui/components/Calendar";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherCalendar } from "@subframe/core";
import { FeatherCalendarX } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import NewAppointmentModal from "@/components/custom/NewAppointmentModal";
import { supabase } from "@/lib/supabase";

function SchedulingPage() {
  const [viewMode, setViewMode] = useState<'day' | '5days' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [modalAppointmentType, setModalAppointmentType] = useState<'appointment' | 'blocked'>('appointment');
  const [preSelectedDateTime, setPreSelectedDateTime] = useState<{date: Date, time: string} | null>(null);

  // Função para buscar appointments
  const fetchAppointments = async () => {
    try {
      const startDate = viewMode === 'day' 
        ? selectedDate 
        : viewMode === '5days' 
          ? getWeekStart(selectedDate)
          : getWeekStart(selectedDate);
      
      const endDate = viewMode === 'day' 
        ? selectedDate 
        : viewMode === '5days' 
          ? new Date(getWeekStart(selectedDate).getTime() + 4 * 24 * 60 * 60 * 1000)
          : getWeekEnd(selectedDate);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', startDate.toISOString().split('T')[0])
        .lte('appointment_date', endDate.toISOString().split('T')[0])
        .eq('status', 'scheduled');

      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // Carregar appointments quando a data ou modo de visualização mudar
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, viewMode]);

  // Função para obter o início da semana
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Função para obter o fim da semana
  const getWeekEnd = (date: Date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  // Função para formatar o período baseado no modo
  const formatPeriod = () => {
    const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (viewMode === 'day') {
      return {
        dates: selectedDate.getDate().toString(),
        monthYear: monthYear
      };
    } else if (viewMode === '5days') {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // Segunda a sexta
      return {
        dates: `${weekStart.getDate()}-${weekEnd.getDate()}`,
        monthYear: monthYear
      };
    } else {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = getWeekEnd(selectedDate);
      return {
        dates: `${weekStart.getDate()}-${weekEnd.getDate()}`,
        monthYear: monthYear
      };
    }
  };

  const period = formatPeriod();

  // Navegação baseada no modo
  const navigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      return setSelectedDate(new Date());
    }
    
    const newDate = new Date(selectedDate);
    const daysToMove = viewMode === 'day' ? 1 : 7;
    
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - daysToMove);
    } else if (direction === 'next') {
      newDate.setDate(newDate.getDate() + daysToMove);
    }
    
    setSelectedDate(newDate);
  };

  // Funções para navegação rápida
  const jumpToWeeks = (weeks: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + (weeks * 7));
    setSelectedDate(newDate);
  };

  const jumpToMonths = (months: number) => {
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + months);
    setSelectedDate(newDate);
  };

  // Gerar dias baseado no modo de visualização
  const generateDays = () => {
    const days = [];
    
    if (viewMode === 'day') {
      // Modo Day: apenas o dia selecionado
      days.push(new Date(selectedDate));
    } else if (viewMode === '5days') {
      // Modo 5 days: segunda a sexta da semana atual
      const weekStart = getWeekStart(selectedDate);
      for (let i = 0; i < 5; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        days.push(date);
      }
    } else {
      // Modo Week: semana completa
      const weekStart = getWeekStart(selectedDate);
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        days.push(date);
      }
    }
    
    return days;
  };

  const displayDays = generateDays();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Obter o nome do dia para uma data específica
  const getDayName = (date: Date) => {
    const dayIndex = date.getDay();
    // Ajustar para que segunda seja 0
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return dayNames[adjustedIndex];
  };

  // Verificar se uma data é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Função para obter appointments de um slot específico
  const getAppointmentsForSlot = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    const hourStr = hour.toString().padStart(2, '0');
    
    return appointments.filter(appointment => {
      if (appointment.appointment_date !== dateStr) return false;
      
      const appointmentHour = parseInt(appointment.start_time.split(':')[0]);
      return appointmentHour === hour;
    });
  };

  // Gerar horas do dia
  const hours = [];
  for (let i = 9; i <= 20; i++) {
    hours.push(i);
  }
  for (let i = 1; i <= 8; i++) {
    hours.push(i);
  }

  // Função para lidar com clique em um slot
  const handleSlotClick = (date: Date, hour: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    setPreSelectedDateTime({ date, time: timeString });
    setModalAppointmentType('appointment');
    setShowAppointmentModal(true);
  };

  // Função para abrir modal do botão Add
  const handleAddClick = (type: 'appointment' | 'blocked') => {
    setModalAppointmentType(type);
    setPreSelectedDateTime(null);
    setShowAppointmentModal(true);
  };

  // Função callback quando appointment é criado
  const handleAppointmentCreated = () => {
    fetchAppointments(); // Recarregar appointments
  };

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 bg-page-bg pr-3 py-3">
        <div className="flex h-10 w-full flex-none items-center justify-between px-4">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Scheduling
            </span>
          </div>
          <TextField
            className="h-10 max-w-[768px] grow shrink-0 basis-0"
            label=""
            helpText=""
            icon={<FeatherSearch />}
          >
            <TextField.Input
              placeholder="Search"
              value={searchTerm}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
            />
          </TextField>
          <div className="flex items-center gap-2">
            <Button
              disabled={false}
              variant="neutral-secondary"
              size="large"
              iconRight={null}
              loading={false}
              onClick={() => {}}
            >
              Actions
            </Button>
            <Button
              disabled={false}
              variant="brand-primary"
              size="large"
              icon={<FeatherPlus />}
              iconRight={null}
              loading={false}
              onClick={() => handleAddClick('appointment')}
            >
              Add
            </Button>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-8 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <div className="flex w-full flex-wrap items-center justify-between">
            <SegmentControl className="h-10 w-auto flex-none" variant="default">
              <SegmentControl.Item 
                active={viewMode === 'day'}
                onClick={() => setViewMode('day')}
              >
                Day
              </SegmentControl.Item>
              <SegmentControl.Item 
                active={viewMode === '5days'}
                onClick={() => setViewMode('5days')}
              >
                5 days
              </SegmentControl.Item>
              <SegmentControl.Item 
                active={viewMode === 'week'}
                onClick={() => setViewMode('week')}
              >
                Week
              </SegmentControl.Item>
            </SegmentControl>
            <SubframeCore.Popover.Root>
              <SubframeCore.Popover.Trigger asChild={true}>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="font-['Urbanist'] text-[24px] font-[400] leading-[28px] text-default-font">
                    {period.dates}
                  </span>
                  <span className="text-heading-2 font-heading-2 text-default-font">
                    {period.monthYear}
                  </span>
                  <IconButton
                    disabled={false}
                    variant="neutral-tertiary"
                    size="medium"
                    icon={<FeatherChevronDown />}
                    loading={false}
                    onClick={() => {}}
                  />
                </div>
              </SubframeCore.Popover.Trigger>
              <SubframeCore.Popover.Portal>
                <SubframeCore.Popover.Content
                  side="bottom"
                  align="center"
                  sideOffset={4}
                  asChild={true}
                >
                  <div className="flex flex-col items-start gap-4 rounded-md bg-new-white-30 px-3 py-3 shadow-lg backdrop-blur-md">
                    <div className="flex w-full grow shrink-0 basis-0 items-start justify-center gap-20 px-2 py-2">
                      <Calendar
                        className="h-auto grow shrink-0 basis-0 self-stretch"
                        mode={"single"}
                        selected={selectedDate}
                        onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                      />
                      <Calendar
                        className="h-auto grow shrink-0 basis-0 self-stretch"
                        mode={"single"}
                        selected={selectedDate}
                        onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                      />
                    </div>
                    <div className="flex items-start gap-1">
                      <Button
                        disabled={false}
                        variant="neutral-secondary"
                        size="medium"
                        icon={null}
                        iconRight={null}
                        loading={false}
                        onClick={() => jumpToWeeks(1)}
                      >
                        In 1 week
                      </Button>
                      <Button
                        disabled={false}
                        variant="neutral-secondary"
                        size="medium"
                        icon={null}
                        iconRight={null}
                        loading={false}
                        onClick={() => jumpToWeeks(2)}
                      >
                        In 2 weeks
                      </Button>
                      <Button
                        disabled={false}
                        variant="neutral-secondary"
                        size="medium"
                        icon={null}
                        iconRight={null}
                        loading={false}
                        onClick={() => jumpToWeeks(3)}
                      >
                        In 3 weeks
                      </Button>
                      <Button
                        disabled={false}
                        variant="neutral-secondary"
                        size="medium"
                        icon={null}
                        iconRight={null}
                        loading={false}
                        onClick={() => jumpToWeeks(4)}
                      >
                        In 4 weeks
                      </Button>
                      <Button
                        disabled={false}
                        variant="neutral-secondary"
                        size="medium"
                        icon={null}
                        iconRight={null}
                        loading={false}
                        onClick={() => jumpToMonths(3)}
                      >
                        In 3 months
                      </Button>
                      <Button
                        disabled={false}
                        variant="neutral-secondary"
                        size="medium"
                        icon={null}
                        iconRight={null}
                        loading={false}
                        onClick={() => jumpToMonths(6)}
                      >
                        In 6 months
                      </Button>
                    </div>
                  </div>
                </SubframeCore.Popover.Content>
              </SubframeCore.Popover.Portal>
            </SubframeCore.Popover.Root>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <SegmentControl
                className="h-10 w-auto flex-none"
                variant="default"
              >
                <SegmentControl.Item 
                  icon={<FeatherChevronLeft />} 
                  onClick={() => navigate('prev')}
                />
                <SegmentControl.Item 
                  active={true}
                  onClick={() => navigate('today')}
                >
                  Today
                </SegmentControl.Item>
                <SegmentControl.Item 
                  icon={<FeatherChevronRight />}
                  onClick={() => navigate('next')}
                />
              </SegmentControl>
              <IconButton
                disabled={false}
                variant="neutral-secondary"
                size="large"
                icon={<FeatherSettings />}
                loading={false}
                onClick={() => {}}
              />
              <IconButton
                disabled={false}
                variant="neutral-secondary"
                size="large"
                icon={<FeatherCalendar />}
                loading={false}
                onClick={() => {}}
              />
            </div>
          </div>
          <div className="flex w-full grow shrink-0 basis-0 items-start overflow-x-auto">
            <div className="flex min-w-[1200px] grow shrink-0 basis-0 items-start self-stretch rounded-rounded-xlarge border-2 border-solid border-new-white-100 bg-new-white-50">
              <div className="flex w-16 flex-none flex-col items-start self-stretch">
                <div className="flex h-16 w-full flex-none flex-col items-start gap-2 border-r border-b border-solid border-neutral-border px-2 py-2" />
                {hours.map((hour) => (
                  <div key={hour} className="flex h-20 w-full flex-none flex-col items-end gap-2 border-r border-b border-solid border-neutral-border px-2 py-1">
                    <span className="text-[14px] font-normal text-subtext-color">
                      {hour}:00
                    </span>
                  </div>
                ))}
              </div>
              {displayDays.map((date, index) => {
                const today = isToday(date);
                const isLastColumn = index === displayDays.length - 1;
                return (
                  <div key={index} className="flex w-full flex-1 flex-col items-start self-stretch" style={{ minWidth: viewMode === 'day' ? '100%' : '160px' }}>
                    <div className="flex h-16 w-full flex-none items-center justify-center gap-2 border-b-2 border-solid border-neutral-border px-2 py-2">
                      <div className="flex items-center gap-2">
                        {today ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                            <span className="text-[16px] font-semibold text-white">
                              {date.getDate()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-heading-3 font-heading-3 text-default-font">
                            {date.getDate()}
                          </span>
                        )}
                        <span className="text-[14px] font-normal text-subtext-color">
                          {getDayName(date)}
                        </span>
                      </div>
                    </div>
                    {hours.map((hour) => {
                      const slotAppointments = getAppointmentsForSlot(date, hour);
                      return (
                        <div 
                          key={hour} 
                          className={`flex h-20 w-full flex-none flex-col items-start gap-1 ${!isLastColumn ? 'border-r' : ''} border-b border-solid border-neutral-border px-2 py-1 hover:bg-neutral-50 cursor-pointer relative`}
                          onClick={() => slotAppointments.length === 0 ? handleSlotClick(date, hour) : null}
                        >
                          {slotAppointments.map((appointment, index) => (
                            <div
                              key={appointment.id}
                              className="w-full bg-blue-100 border-l-4 border-blue-500 rounded px-2 py-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Abrir modal de edição do appointment
                                console.log('Edit appointment:', appointment);
                              }}
                            >
                              <div className="font-semibold text-blue-800 truncate">
                                {appointment.patient_name}
                              </div>
                              <div className="text-blue-600 truncate">
                                {appointment.start_time} - {appointment.end_time}
                              </div>
                              <div className="text-blue-500 truncate">
                                {appointment.professional_name}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para criar appointment/blocked time */}
      <NewAppointmentModal
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
        onAppointmentCreated={handleAppointmentCreated}
        preSelectedDate={preSelectedDateTime?.date}
        preSelectedTime={preSelectedDateTime?.time}
        initialType={modalAppointmentType}
      />
    </DefaultPageLayout>
  );
}

export default SchedulingPage;