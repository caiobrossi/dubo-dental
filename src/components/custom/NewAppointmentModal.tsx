"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { Select } from "@/ui/components/Select";
import { Switch } from "@/ui/components/Switch";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherSearch } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { supabase, Patient, Professional } from "@/lib/supabase";
import { SearchableSelect } from "./SearchableSelect";
import { preparePatientNameForStorage } from "@/app/scheduling/utils/nameUtils";
import { Appointment, BlockedTime } from "@/app/scheduling/types";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentCreated?: () => void;
  preSelectedDate?: Date;
  preSelectedTime?: string;
  initialType?: 'appointment' | 'blocked';
  editingAppointment?: Appointment | null;
  editingBlockedTime?: BlockedTime | null;
}

function NewAppointmentModal({ 
  open, 
  onOpenChange, 
  onAppointmentCreated,
  preSelectedDate,
  preSelectedTime,
  initialType = 'appointment',
  editingAppointment,
  editingBlockedTime
}: NewAppointmentModalProps) {
  const [appointmentType, setAppointmentType] = useState<'appointment' | 'blocked'>(initialType);
  const [formData, setFormData] = useState({
    patient_id: "",
    professional_id: "",
    room: "",
    procedure_type: "first_time",
    duration_minutes: "30",
    appointment_date: preSelectedDate ? preSelectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    start_time: preSelectedTime || "14:00",
    end_time: "15:00",
    notes: "",
    send_reminders: true,
    notify_cancellation: false,
    // Campos específicos para blocked time
    reason: "",
    repeat: false
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAppointmentType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (open) {
      fetchPatientsAndProfessionals();
      
      // If editing an appointment, populate form with existing data
      if (editingAppointment) {
        // Calculate duration from start and end times
        const startTime = editingAppointment.start_time;
        const endTime = editingAppointment.end_time;
        const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        const duration = endMinutes - startMinutes;
        
        setAppointmentType('appointment');
        setFormData({
          patient_id: editingAppointment.patient_id || "",
          professional_id: editingAppointment.professional_id || "",
          room: "", // Appointment type doesn't have a room field
          procedure_type: editingAppointment.appointment_type || "first_time",
          duration_minutes: duration.toString(),
          appointment_date: editingAppointment.appointment_date,
          start_time: editingAppointment.start_time,
          end_time: editingAppointment.end_time,
          notes: editingAppointment.notes || "",
          send_reminders: true,
          notify_cancellation: false,
          // Campos específicos para blocked time
          reason: "",
          repeat: false
        });
      } else if (editingBlockedTime) {
        // If editing a blocked time, populate form with blocked time data
        setAppointmentType('blocked');
        setFormData({
          patient_id: "",
          professional_id: editingBlockedTime.professional_id || "",
          room: "",
          procedure_type: "first_time",
          duration_minutes: "30",
          appointment_date: editingBlockedTime.date,
          start_time: editingBlockedTime.start_time,
          end_time: editingBlockedTime.end_time,
          notes: "",
          send_reminders: false,
          notify_cancellation: false,
          // Campos específicos para blocked time
          reason: editingBlockedTime.reason || "",
          repeat: false
        });
      } else {
        // Reset form data para limpar seleções anteriores
        setFormData({
          patient_id: "",
          professional_id: "",
          room: "",
          procedure_type: "first_time",
          duration_minutes: "30",
          appointment_date: preSelectedDate ? preSelectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          start_time: preSelectedTime || "14:00",
          end_time: preSelectedTime ? calculateEndTime(preSelectedTime, "30") : "15:00",
          notes: "",
          send_reminders: true,
          notify_cancellation: false,
          // Campos específicos para blocked time
          reason: "",
          repeat: false
        });
      }
    }
  }, [open, preSelectedDate, preSelectedTime, editingAppointment, editingBlockedTime]);

  const fetchPatientsAndProfessionals = async () => {
    try {
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, name')
        .order('name');
      
      const { data: professionalsData } = await supabase
        .from('professionals')
        .select('id, name')
        .order('name');

      setPatients(patientsData || []);
      setProfessionals(professionalsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const durationMinutes = parseInt(duration);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    
    // Handle day overflow - if result is >= 24:00, wrap to next day
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleDeleteBlockedTime = async () => {
    if (!editingBlockedTime) return;
    
    if (!window.confirm(`Are you sure you want to delete this blocked time?`)) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('blocked_times')
        .delete()
        .eq('id', editingBlockedTime.id);

      if (error) {
        console.error('Error deleting blocked time:', error);
        alert('Error deleting blocked time. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Blocked time deleted successfully');
      
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting blocked time:', error);
      alert('Error deleting blocked time. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('Starting appointment creation...', { appointmentType, formData });

      if (appointmentType === 'blocked') {
        // Validate required fields for blocked time
        if (!formData.professional_id) {
          console.error('Validation failed: missing professional');
          alert('Please select a professional');
          setLoading(false);
          return;
        }

        // Validate required fields more thoroughly
        if (!formData.appointment_date || !formData.start_time) {
          console.error('Validation failed: missing date or start time');
          alert('Please fill in all required fields (date and start time)');
          setLoading(false);
          return;
        }

        // Find the selected professional
        const selectedProfessional = professionals.find(p => p.id === formData.professional_id);
        if (!selectedProfessional) {
          console.error('Selected professional not found');
          alert('Selected professional not found');
          setLoading(false);
          return;
        }

        // Ensure end_time is set
        const endTime = formData.end_time || calculateEndTime(formData.start_time, "60");
        
        console.log(editingBlockedTime ? 'Updating blocked time with data:' : 'Creating blocked time with data:', {
          professional_id: formData.professional_id,
          professional_name: selectedProfessional.name,
          date: formData.appointment_date,
          start_time: formData.start_time,
          end_time: endTime,
          reason: formData.reason || 'Blocked time'
        });

        // Create or update blocked time
        let error, data;
        if (editingBlockedTime) {
          // Update existing blocked time
          const result = await supabase
            .from('blocked_times')
            .update({
              professional_id: formData.professional_id,
              professional_name: selectedProfessional.name,
              date: formData.appointment_date,
              start_time: formData.start_time,
              end_time: endTime,
              reason: formData.reason || 'Blocked time'
            })
            .eq('id', editingBlockedTime.id)
            .select();
          
          error = result.error;
          data = result.data;
        } else {
          // Create new blocked time
          const result = await supabase
            .from('blocked_times')
            .insert([{
              professional_id: formData.professional_id,
              professional_name: selectedProfessional.name,
              date: formData.appointment_date,
              start_time: formData.start_time,
              end_time: endTime,
              reason: formData.reason || 'Blocked time'
            }])
            .select();
          
          error = result.error;
          data = result.data;
        }

        if (error) {
          console.error(editingBlockedTime ? 'Error updating blocked time:' : 'Error creating blocked time:', error);
          
          // Provide specific error messages
          if (error.message?.includes('Conflito de horário')) {
            alert('Time conflict: There is already an appointment or blocked time in this period.');
          } else if (error.message?.includes('violates foreign key constraint')) {
            alert('Invalid professional selected. Please try refreshing the page.');
          } else {
            alert(`Error ${editingBlockedTime ? 'updating' : 'creating'} blocked time: ${error.message || 'Unknown error'}`);
          }
          
          setLoading(false);
          return;
        }
        
        console.log(editingBlockedTime ? 'Blocked time updated successfully:' : 'Blocked time created successfully:', data);
      } else {
        // Validate required fields for appointment
        if (!formData.patient_id || !formData.professional_id) {
          console.error('Validation failed: missing patient or professional');
          alert('Please select a patient and professional');
          return;
        }

        console.log('Validation passed, creating appointment...');

        // Create appointment
        const selectedPatient = patients.find(p => p.id === formData.patient_id);
        const selectedProfessional = professionals.find(p => p.id === formData.professional_id);

        console.log('Selected patient:', selectedPatient);
        console.log('Selected professional:', selectedProfessional);

        const appointmentData = {
          patient_id: formData.patient_id,
          patient_name: preparePatientNameForStorage(selectedPatient?.name || ''),
          professional_id: formData.professional_id,
          professional_name: selectedProfessional?.name,
          appointment_date: formData.appointment_date,
          start_time: formData.start_time,
          end_time: calculateEndTime(formData.start_time, formData.duration_minutes),
          duration_minutes: parseInt(formData.duration_minutes),
          appointment_type: formData.procedure_type,
          status: 'scheduled',
          notes: formData.notes
        };

        console.log('Appointment data:', appointmentData);

        let error;
        if (editingAppointment) {
          // Update existing appointment
          const updateResult = await supabase
            .from('appointments')
            .update(appointmentData)
            .eq('id', editingAppointment.id);
          error = updateResult.error;
          console.log('Appointment updated successfully');
        } else {
          // Create new appointment
          const insertResult = await supabase
            .from('appointments')
            .insert([appointmentData]);
          error = insertResult.error;
          console.log('Appointment created successfully');
        }

        if (error) {
          console.error(`Error ${editingAppointment ? 'updating' : 'creating'} appointment:`, error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
      }

      onAppointmentCreated?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        patient_id: "",
        professional_id: "",
        room: "",
        procedure_type: "first_time",
        duration_minutes: "30",
        appointment_date: new Date().toISOString().split('T')[0],
        start_time: "14:00",
        end_time: "15:00",
        notes: "",
        send_reminders: true,
        notify_cancellation: false,
        reason: "",
        repeat: false
      });
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      let errorMessage = error?.message || error?.details || 'Unknown error occurred';
      
      // Check for specific database constraint errors
      if (errorMessage.includes('Conflito de horário')) {
        if (errorMessage.includes('já existe um agendamento')) {
          errorMessage = 'This professional already has an appointment at this time. Please select a different time or professional.';
        } else if (errorMessage.includes('período está bloqueado')) {
          errorMessage = 'This time period is blocked for the selected professional. Please choose another time.';
        }
      }
      
      alert(`Error creating appointment:\n\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate time options
  const timeOptions = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      const time24 = `${hour}:${minute}`;
      const hour12 = h > 12 ? h - 12 : h;
      const period = h >= 12 ? 'pm' : 'am';
      const label = `${hour12}:${minute}${period}`;
      timeOptions.push({ value: time24, label });
    }
  }

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex w-full flex-col items-start mobile:h-auto mobile:w-96">
        <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background px-4 py-4">
          <div className="flex w-full items-center justify-between">
            {editingAppointment ? (
              <h2 className="text-heading-2 font-heading-2 text-default-font">
                Edit Appointment
              </h2>
            ) : (
              <SegmentControl
                className="h-10 w-auto flex-none"
                variant="default"
              >
                <SegmentControl.Item 
                  active={appointmentType === 'appointment'}
                  onClick={() => setAppointmentType('appointment')}
                >
                  Appointment
                </SegmentControl.Item>
                <SegmentControl.Item 
                  active={appointmentType === 'blocked'}
                  onClick={() => setAppointmentType('blocked')}
                >
                  Blocked time
                </SegmentControl.Item>
              </SegmentControl>
            )}
            <IconButton
              disabled={false}
              icon={<FeatherX />}
              onClick={() => onOpenChange(false)}
            />
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-8 bg-default-background px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
          
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
            
            {/* Campos para Appointment */}
            {appointmentType === 'appointment' && (
              <>
                <div className="flex h-12 w-full flex-none items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Patient name
                  </span>
                  <SearchableSelect
                    options={patients.map(p => ({ id: p.id!, name: p.name! }))}
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({...formData, patient_id: value})}
                    placeholder="Search patient..."
                    disabled={false}
                    className="grow shrink-0 basis-0"
                  />
                </div>
              </>
            )}

            {/* Campos para Blocked Time */}
            {appointmentType === 'blocked' && (
              <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Reason
                </span>
                <TextField
                  className="h-10 grow shrink-0 basis-0"
                  variant="filled"
                  disabled={false}
                  error={false}
                  label=""
                  helpText=""
                  icon={null}
                >
                  <TextField.Input
                    placeholder="Enter reason for blocking time"
                    value={formData.reason}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({...formData, reason: event.target.value})
                    }
                  />
                </TextField>
              </div>
            )}
            
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
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
                icon={null}
                value={formData.professional_id}
                onValueChange={(value: string) => setFormData({...formData, professional_id: value})}
              >
                {professionals.map((prof) => (
                  <Select.Item key={prof.id} value={prof.id!}>
                    {prof.name}
                  </Select.Item>
                ))}
              </Select>
            </div>
            
            {/* Campos específicos para Appointment */}
            {appointmentType === 'appointment' && (
              <>
                <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Room
                  </span>
                  <Select
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    placeholder="Select room"
                    helpText=""
                    icon={null}
                    value={formData.room}
                    onValueChange={(value: string) => setFormData({...formData, room: value})}
                  >
                    <Select.Item value="room1">Room 1</Select.Item>
                    <Select.Item value="room2">Room 2</Select.Item>
                    <Select.Item value="room3">Room 3</Select.Item>
                    <Select.Item value="room4">Room 4</Select.Item>
                  </Select>
                </div>
                
                <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Procedure type
                  </span>
                  <Select
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    placeholder="First time"
                    helpText=""
                    icon={null}
                    value={formData.procedure_type}
                    onValueChange={(value: string) => setFormData({...formData, procedure_type: value})}
                  >
                    <Select.Item value="first_time">First time</Select.Item>
                    <Select.Item value="consultation">Consultation</Select.Item>
                    <Select.Item value="cleaning">Cleaning</Select.Item>
                    <Select.Item value="treatment">Treatment</Select.Item>
                    <Select.Item value="follow_up">Follow up</Select.Item>
                  </Select>
                </div>
                
                <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Duration
                  </span>
                  <Select
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    placeholder="30 min"
                    helpText=""
                    icon={null}
                    value={formData.duration_minutes}
                    onValueChange={(value: string) => setFormData({...formData, duration_minutes: value})}
                  >
                    <Select.Item value="15">15 min</Select.Item>
                    <Select.Item value="30">30 min</Select.Item>
                    <Select.Item value="45">45 min</Select.Item>
                    <Select.Item value="60">1 hour</Select.Item>
                    <Select.Item value="90">1h 30min</Select.Item>
                    <Select.Item value="120">2 hours</Select.Item>
                  </Select>
                </div>
              </>
            )}
            
            {/* Campos para Appointment: Date e Starts on */}
            {appointmentType === 'appointment' && (
              <>
                <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Date
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={null}
                  >
                    <TextField.Input
                      type="date"
                      placeholder=""
                      value={formData.appointment_date}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData({...formData, appointment_date: event.target.value})
                      }
                    />
                  </TextField>
                </div>
                
                <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Starts on
                  </span>
                  <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 self-stretch">
                    <Select
                      className="h-10 w-full flex-none"
                      variant="filled"
                      disabled={false}
                      error={false}
                      label=""
                      placeholder="2:00pm"
                      helpText=""
                      icon={null}
                      value={formData.start_time}
                      onValueChange={(value: string) => setFormData({...formData, start_time: value})}
                    >
                      {timeOptions.map((time) => (
                        <Select.Item key={time.value} value={time.value}>
                          {time.label}
                        </Select.Item>
                      ))}
                    </Select>
                    <LinkButton
                      disabled={false}
                      variant="brand"
                      size="medium"
                      icon={null}
                      iconRight={null}
                      onClick={() => console.log('Find available time')}
                    >
                      Find available time
                    </LinkButton>
                  </div>
                </div>
              </>
            )}

            {/* Campos específicos para Blocked Time */}
            {appointmentType === 'blocked' && (
              <>
                <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Starts on
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={null}
                  >
                    <TextField.Input
                      type="datetime-local"
                      placeholder=""
                      value={`${formData.appointment_date}T${formData.start_time}`}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const [date, time] = event.target.value.split('T');
                        setFormData({...formData, appointment_date: date, start_time: time});
                      }}
                    />
                  </TextField>
                </div>
                
                <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    Finish on
                  </span>
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    variant="filled"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={null}
                  >
                    <TextField.Input
                      type="datetime-local"
                      placeholder=""
                      value={`${formData.appointment_date}T${formData.end_time}`}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const [date, time] = event.target.value.split('T');
                        setFormData({...formData, end_time: time});
                      }}
                    />
                  </TextField>
                </div>
                
                <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                  <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                    Repeat
                  </span>
                  <Switch
                    checked={formData.repeat}
                    onCheckedChange={(checked: boolean) => 
                      setFormData({...formData, repeat: checked})
                    }
                  />
                </div>
              </>
            )}
            
            {/* Add notes apenas para appointments */}
            {appointmentType === 'appointment' && (
              <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Add notes (optional)
                </span>
                <TextField
                  className="h-10 grow shrink-0 basis-0"
                  variant="filled"
                  disabled={false}
                  error={false}
                  label=""
                  helpText=""
                  icon={null}
                >
                  <TextField.Input
                    placeholder=""
                    value={formData.notes}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({...formData, notes: event.target.value})
                    }
                  />
                </TextField>
              </div>
            )}
            
            {appointmentType === 'appointment' && (
              <>
                <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                  <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                    Send automatic appointment confirmation and reminders
                  </span>
                  <Switch
                    checked={formData.send_reminders}
                    onCheckedChange={(checked: boolean) => 
                      setFormData({...formData, send_reminders: checked})
                    }
                  />
                </div>
                <div className="flex h-14 w-full flex-none items-center justify-between py-2">
                  <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-subtext-color">
                    Notify if a cancellation frees up this slot
                  </span>
                  <Switch
                    checked={formData.notify_cancellation}
                    onCheckedChange={(checked: boolean) => 
                      setFormData({...formData, notify_cancellation: checked})
                    }
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex w-full gap-2">
            {editingBlockedTime && (
              <Button
                className="h-10 flex-1"
                disabled={loading}
                variant="destructive-primary"
                size="large"
                onClick={handleDeleteBlockedTime}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            )}
            <Button
              className={`h-10 ${editingBlockedTime ? 'flex-1' : 'w-full'} flex-none`}
              disabled={loading}
              variant="brand-primary"
              size="large"
              icon={null}
              iconRight={null}
              loading={loading}
              onClick={handleSubmit}
            >
              {loading 
                ? (editingAppointment ? "Updating..." : editingBlockedTime ? "Updating..." : "Creating...")
                : appointmentType === 'blocked' 
                  ? (editingBlockedTime ? "Update blocked time" : "Block time") 
                  : (editingAppointment ? "Update appointment" : "Create appointment")
              }
            </Button>
          </div>
        </div>
      </div>
    </DialogLayout>
  );
}

export default NewAppointmentModal;