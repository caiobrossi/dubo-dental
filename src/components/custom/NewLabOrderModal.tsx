"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { Switch } from "@/ui/components/Switch";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherSearch } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { supabase, Patient, Professional, LabOrder } from "@/lib/supabase";
import { SearchableSelect } from "./SearchableSelect";

interface NewLabOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLabOrderCreated?: () => void;
  editingOrder?: LabOrder | null;
}

function NewLabOrderModal({ open, onOpenChange, onLabOrderCreated, editingOrder }: NewLabOrderModalProps) {
  const [formData, setFormData] = useState({
    order_name: "",
    patient_id: "",
    professional_id: "",
    lab_name: "",
    services: "",
    due_date: "",
    total_price: 0,
    description: "",
    book_return_appointment: false
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      fetchPatientsAndProfessionals();
    }
  }, [open]);

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingOrder && open) {
      setFormData({
        order_name: editingOrder.order_name || "",
        patient_id: editingOrder.patient_id || "",
        professional_id: editingOrder.professional_id || "",
        lab_name: editingOrder.lab_name || "",
        services: editingOrder.services || "",
        due_date: editingOrder.due_date || "",
        total_price: editingOrder.total_price || 0,
        description: "",
        book_return_appointment: false
      });
    } else if (!editingOrder && open) {
      // Reset form when creating new order
      setFormData({
        order_name: "",
        patient_id: "",
        professional_id: "",
        lab_name: "",
        services: "",
        due_date: "",
        total_price: 0,
        description: "",
        book_return_appointment: false
      });
    }
  }, [editingOrder, open]);

  const fetchPatientsAndProfessionals = async () => {
    try {
      // Buscar pacientes
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, name')
        .order('name');

      if (patientsError) {
        console.error('Erro ao buscar pacientes:', patientsError);
      } else {
        setPatients(patientsData || []);
      }

      // Buscar profissionais
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('professionals')
        .select('id, name')
        .order('name');

      if (professionalsError) {
        console.error('Erro ao buscar profissionais:', professionalsError);
      } else {
        setProfessionals(professionalsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validar campos obrigatórios
      if (!formData.order_name || !formData.patient_id || !formData.professional_id || 
          !formData.lab_name || !formData.services || !formData.due_date) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Buscar nomes para armazenar desnormalizados
      const selectedPatient = patients.find(p => p.id === formData.patient_id);
      const selectedProfessional = professionals.find(p => p.id === formData.professional_id);

      const labOrderData = {
        order_name: formData.order_name,
        patient_id: formData.patient_id,
        patient_name: selectedPatient?.name,
        professional_id: formData.professional_id,
        professional_name: selectedProfessional?.name,
        lab_name: formData.lab_name,
        services: formData.services,
        due_date: formData.due_date,
        total_price: formData.total_price,
        ...(editingOrder ? {} : { status: 'order_created' }) // Só define status se for criação
      };

      let error;
      if (editingOrder) {
        // Atualizar lab order existente
        const result = await supabase
          .from('lab_orders')
          .update(labOrderData)
          .eq('id', editingOrder.id);
        error = result.error;
      } else {
        // Criar novo lab order
        const result = await supabase
          .from('lab_orders')
          .insert([labOrderData]);
        error = result.error;
      }

      if (error) {
        console.error('Erro ao salvar lab order:', error);
        alert(`Erro ao ${editingOrder ? 'atualizar' : 'criar'} pedido. Tente novamente.`);
      } else {
        // Resetar formulário
        setFormData({
          order_name: "",
          patient_id: "",
          professional_id: "",
          lab_name: "",
          services: "",
          due_date: "",
          total_price: 0,
          description: "",
          book_return_appointment: false
        });

        // Chamar callback e fechar modal
        onLabOrderCreated?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao criar lab order:', error);
      alert('Erro ao criar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex w-full flex-col items-start bg-default-background mobile:h-auto mobile:w-96">
        <div className="flex w-full grow shrink-0 basis-0 items-center justify-between border-b border-solid border-neutral-border bg-default-background px-4 py-4">
          <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
            {editingOrder ? 'Edit Lab Order' : 'New Lab Order'}
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        <div className="flex w-full flex-col items-start gap-8 px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
            
            {/* Order Name */}
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Order Name *
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                label=""
                helpText=""
                icon={null}
              >
                <TextField.Input
                  placeholder="Ex: Crown Q4-23"
                  value={formData.order_name}
                  onChange={(e) => setFormData({...formData, order_name: e.target.value})}
                />
              </TextField>
            </div>

            {/* Patient Select with Search */}
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Patient *
              </span>
              <SearchableSelect
                options={patients.map(p => ({ id: p.id!, name: p.name! }))}
                value={formData.patient_id}
                onValueChange={(value) => setFormData({...formData, patient_id: value})}
                placeholder="Search and select patient..."
                disabled={false}
              />
            </div>

            {/* Professional */}
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Professional *
              </span>
              <Select
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                label=""
                placeholder="Select professional"
                helpText=""
                icon={null}
                value={formData.professional_id}
                onValueChange={(value) => setFormData({...formData, professional_id: value})}
              >
                {professionals.map((professional) => (
                  <Select.Item key={professional.id} value={professional.id}>
                    {professional.name}
                  </Select.Item>
                ))}
              </Select>
            </div>

            {/* Lab */}
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Lab *
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                label=""
                helpText=""
                icon={null}
              >
                <TextField.Input
                  placeholder="Ex: Affilion Lab"
                  value={formData.lab_name}
                  onChange={(e) => setFormData({...formData, lab_name: e.target.value})}
                />
              </TextField>
            </div>

            {/* Lab Service */}
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Lab Service *
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                label=""
                helpText=""
                icon={null}
              >
                <TextField.Input
                  placeholder="Ex: Crown, Bridge, etc."
                  value={formData.services}
                  onChange={(e) => setFormData({...formData, services: e.target.value})}
                />
              </TextField>
            </div>

            {/* Due Date */}
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Due Date *
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                label=""
                helpText=""
                icon={null}
              >
                <TextField.Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </TextField>
            </div>

            {/* Total Price */}
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Total Price
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                label=""
                helpText=""
                icon={null}
              >
                <TextField.Input
                  type="number"
                  placeholder="0.00"
                  value={formData.total_price.toString()}
                  onChange={(e) => setFormData({...formData, total_price: parseFloat(e.target.value) || 0})}
                />
              </TextField>
            </div>

            {/* Description */}
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Description (optional)
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={false}
                error={false}
                label=""
                helpText=""
                icon={null}
              >
                <TextField.Input
                  placeholder="Additional notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </TextField>
            </div>

            {/* Book return appointment */}
            <div className="flex h-14 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Book return appointment
              </span>
              <Switch
                checked={formData.book_return_appointment}
                onCheckedChange={(checked) => setFormData({...formData, book_return_appointment: checked})}
              />
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
            {loading 
              ? (editingOrder ? "Updating..." : "Creating...") 
              : (editingOrder ? "Update" : "Confirm")
            }
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default NewLabOrderModal;