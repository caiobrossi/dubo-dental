"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherX } from "@subframe/core";
import { supabase } from "@/lib/supabase";

interface Professional {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
  insurance?: string;
}

interface NewTreatmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTreatmentCreated?: () => void;
  patientId?: string; // Pre-filled patient ID if coming from patient page
  patientName?: string; // Patient name to display
}

function NewTreatmentModal({ open, onOpenChange, onTreatmentCreated, patientId, patientName }: NewTreatmentModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    professional_id: "",
    expire_date: "",
    expire_option: "never",
    patient_insurance: ""
  });

  console.log("NewTreatmentModal render:", { open, patientId, professional_id: formData.professional_id });

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [patientInsurance, setPatientInsurance] = useState<string>("");
  const [loading, setLoading] = useState(false);


  // Calculate expire date based on selected option
  const calculateExpireDate = (option: string): string | null => {
    if (option === "never") return null;
    
    const today = new Date();
    let expireDate = new Date(today);
    
    switch (option) {
      case "1week":
        expireDate.setDate(today.getDate() + 7);
        break;
      case "1month":
        expireDate.setMonth(today.getMonth() + 1);
        break;
      case "3months":
        expireDate.setMonth(today.getMonth() + 3);
        break;
      case "6months":
        expireDate.setMonth(today.getMonth() + 6);
        break;
      case "1year":
        expireDate.setFullYear(today.getFullYear() + 1);
        break;
      default:
        return null;
    }
    
    return expireDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Handle expire option change
  const handleExpireOptionChange = (option: string) => {
    const calculatedDate = calculateExpireDate(option);
    console.log(`Expire option selected: ${option}, calculated date: ${calculatedDate}`);
    setFormData({
      ...formData,
      expire_option: option,
      expire_date: calculatedDate || ""
    });
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        code: "",
        name: "",
        professional_id: "",
        expire_date: "",
        expire_option: "never",
        patient_insurance: ""
      });
    }
  }, [open]);

  // Generate code when modal opens
  useEffect(() => {
    if (open && !formData.code) {
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      setFormData(prev => ({ ...prev, code }));
    }
  }, [open, formData.code]);

  // Load professionals and patient data when modal opens
  useEffect(() => {
    if (open && patientId) {
      const loadData = async () => {
        await fetchProfessionals();
        await fetchPatientInsurance();
      };
      loadData();
    }
  }, [open, patientId]);

  const fetchProfessionals = async () => {
    try {
      const { data: professionalsData, error } = await supabase
        .from('professionals')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching professionals:', error);
      } else {
        console.log('Professionals loaded:', professionalsData);
        setProfessionals(professionalsData || []);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const fetchPatientInsurance = async () => {
    if (!patientId) return;

    try {
      const { data: patientData, error } = await supabase
        .from('patients')
        .select('professional_id, professionals:professional_id(id, name)')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error fetching patient data:', error);
      } else {
        console.log('Patient data loaded:', patientData);
        
        // Set default professional in form if patient has one assigned
        if (patientData?.professional_id) {
          console.log('Setting default professional:', patientData.professional_id);
          console.log('Professional name:', patientData.professionals?.name);
          console.log('Current form professional_id before setting:', formData.professional_id);
          
          setFormData(prev => {
            console.log('Previous form data:', prev);
            const newData = { 
              ...prev, 
              professional_id: patientData.professional_id 
            };
            console.log('New form data:', newData);
            return newData;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name || !formData.professional_id) {
        alert('Please fill in all required fields.');
        return;
      }

      if (!patientId) {
        alert('Patient ID is required.');
        return;
      }

      const treatmentData = {
        code: formData.code,
        name: formData.name,
        patient_id: patientId,
        professional_id: formData.professional_id,
        expire_date: formData.expire_date || null,
        patient_insurance: formData.patient_insurance || null,
        status: 'pending',
        total_procedures: 0,
        completed_procedures: 0
      };

      console.log('Creating treatment with data:', treatmentData);
      console.log('Linking treatment to patient ID:', patientId);

      const { data, error } = await supabase
        .from('treatments')
        .insert([treatmentData])
        .select();

      if (error) {
        console.error('Error creating treatment:', error);
        console.error('Error details:', error.message);
        alert(`Error creating treatment: ${error.message}`);
      } else {
        console.log('Treatment created successfully:', data);
        
        // Reset form
        setFormData({
          code: "",
          name: "",
          professional_id: "",
          expire_date: "",
          expire_option: "never",
          patient_insurance: ""
        });

        // Call callback and close modal
        onTreatmentCreated?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating treatment:', error);
      alert(`Error creating treatment: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex w-144 flex-col items-start bg-new-white-50 mobile:h-auto mobile:w-96">
        <div className="flex w-full grow shrink-0 basis-0 items-center justify-between border-b border-solid border-neutral-border px-4 py-4">
          <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
            New Treatment plan
          </span>
          <IconButton
            disabled={false}
            variant="neutral-primary"
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        <div className="flex w-full flex-col items-start gap-8 px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
            
            {/* Code */}
            <div className="flex w-full items-center justify-between" style={{ minHeight: "56px" }}>
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Code
              </span>
              <div className="flex grow shrink-0 basis-0 items-center justify-between">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  {formData.code}
                </span>
              </div>
            </div>
            
            {/* Patient Name */}
            {patientName && (
              <div className="flex w-full items-center justify-between" style={{ minHeight: "56px" }}>
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Patient
                </span>
                <div className="flex grow shrink-0 basis-0 items-center justify-between">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-default-font">
                    {patientName}
                  </span>
                </div>
              </div>
            )}
            
            {/* Treatment name */}
            <div className="flex w-full items-center justify-between" style={{ minHeight: "56px" }}>
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Treatment name *
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                variant="filled"
                label=""
                helpText=""
                icon={null}
              >
                <TextField.Input
                  placeholder="Enter treatment name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </TextField>
            </div>
            
            {/* Professional */}
            <div className="flex w-full items-center justify-between" style={{ minHeight: "56px" }}>
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Professional *
              </span>
              <Select
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                variant="filled"
                label=""
                placeholder="Select"
                helpText=""
                icon={null}
                value={formData.professional_id}
                onValueChange={(value) => {
                  console.log('Professional selected:', value);
                  setFormData({...formData, professional_id: value});
                }}
              >
                {professionals.map((professional) => (
                  <Select.Item key={professional.id} value={professional.id}>
                    {professional.name}
                  </Select.Item>
                ))}
              </Select>
            </div>
            
            {/* Expire date */}
            <div className="flex w-full items-center justify-between" style={{ minHeight: "56px" }}>
              <div className="w-52 flex-none">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Expire date
                </span>
                <div className="text-xs text-neutral-400 mt-1">
                  optional
                </div>
              </div>
              <Select
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                variant="filled"
                label=""
                placeholder="Never expire"
                helpText=""
                icon={null}
                value={formData.expire_option}
                onValueChange={handleExpireOptionChange}
              >
                <Select.Item value="never">Never expire</Select.Item>
                <Select.Item value="1week">1 week</Select.Item>
                <Select.Item value="1month">1 month</Select.Item>
                <Select.Item value="3months">3 months</Select.Item>
                <Select.Item value="6months">6 months</Select.Item>
                <Select.Item value="1year">1 year</Select.Item>
              </Select>
            </div>
            
            {/* Patient insurance */}
            <div className="flex w-full items-center justify-between" style={{ minHeight: "56px" }}>
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Patient insurance
              </span>
              <Select
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                variant="filled"
                label=""
                placeholder="Select insurance"
                helpText=""
                icon={null}
                value={formData.patient_insurance}
                onValueChange={(value) => setFormData({...formData, patient_insurance: value})}
              >
                <Select.Item value="Private">Private</Select.Item>
              </Select>
            </div>
          </div>
          
          <Button
            className="h-10 w-full flex-none"
            disabled={loading}
            variant="brand-primary"
            size="large"
            icon={null}
            iconRight={null}
            loading={loading}
            onClick={handleSubmit}
          >
            {loading ? "Creating..." : "Start treatment plan"}
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default NewTreatmentModal;