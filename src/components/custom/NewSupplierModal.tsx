"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherX } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { supabase, Supplier } from "@/lib/supabase";

interface NewSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierCreated?: () => void;
}

function NewSupplierModal({ open, onOpenChange, onSupplierCreated }: NewSupplierModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    alternative_phones: [] as string[],
    email: "",
    website: "",
    products: ""
  });

  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        contact_person: "",
        phone: "",
        alternative_phones: [],
        email: "",
        website: "",
        products: ""
      });
    }
  }, [open]);

  const addAlternativePhone = () => {
    setFormData({
      ...formData,
      alternative_phones: [...formData.alternative_phones, ""]
    });
  };

  const updateAlternativePhone = (index: number, value: string) => {
    const newAlternativePhones = [...formData.alternative_phones];
    newAlternativePhones[index] = value;
    setFormData({
      ...formData,
      alternative_phones: newAlternativePhones
    });
  };

  const removeAlternativePhone = (index: number) => {
    const newAlternativePhones = formData.alternative_phones.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      alternative_phones: newAlternativePhones
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validar campos obrigatórios
      if (!formData.name) {
        alert('Por favor, preencha o nome do fornecedor.');
        return;
      }

      // Preparar dados para inserção
      const supplierData: Partial<Supplier> = {
        name: formData.name.trim(),
        contact_person: formData.contact_person.trim() || null,
        phone: formData.phone.trim() || null,
        alternative_phone: formData.alternative_phones.length > 0 
          ? formData.alternative_phones.filter(phone => phone.trim()).join(', ') || null
          : null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        products: formData.products.trim() || null
      };

      const { error } = await supabase
        .from('suppliers')
        .insert([supplierData]);

      if (error) {
        console.error('Erro ao criar supplier:', error);
        alert(`Erro ao criar fornecedor: ${error.message}`);
      } else {
        // Reset form
        setFormData({
          name: "",
          contact_person: "",
          phone: "",
          alternative_phones: [],
          email: "",
          website: "",
          products: ""
        });

        // Callback e fechar modal
        onSupplierCreated?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao criar supplier:', error);
      alert('Erro ao criar fornecedor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex w-full flex-col items-start bg-default-background mobile:h-auto mobile:w-96">
        <div className="flex w-full grow shrink-0 basis-0 items-center justify-between border-b border-solid border-neutral-border bg-default-background px-4 py-4">
          <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
            New Supplier
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        <div className="flex w-full flex-col items-start gap-8 px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
            
            {/* Supplier Name */}
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Supplier Name *
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
                  placeholder="Ex: Dental Supply Co."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </TextField>
            </div>

            {/* Contact Person */}
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Contact Person
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
                  placeholder="Ex: John Smith"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                />
              </TextField>
            </div>

            {/* Phone Number */}
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Phone Number
              </span>
              <div className="flex grow shrink-0 basis-0 items-center gap-2">
                <TextField
                  className="h-10 grow shrink-0 basis-0"
                  disabled={false}
                  error={false}
                  label=""
                  helpText=""
                  icon={null}
                >
                  <TextField.Input
                    placeholder="Ex: (11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </TextField>
                <IconButton
                  variant="neutral-tertiary"
                  size="medium"
                  icon={<FeatherPlus />}
                  onClick={addAlternativePhone}
                />
              </div>
            </div>

            {/* Alternative Phone Numbers */}
            {formData.alternative_phones.map((altPhone, index) => (
              <div key={index} className="flex h-12 w-full flex-none items-center justify-between py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Alternative Phone
                </span>
                <div className="flex grow shrink-0 basis-0 items-center gap-2">
                  <TextField
                    className="h-10 grow shrink-0 basis-0"
                    disabled={false}
                    error={false}
                    label=""
                    helpText=""
                    icon={null}
                  >
                    <TextField.Input
                      placeholder="Ex: (11) 88888-8888"
                      value={altPhone}
                      onChange={(e) => updateAlternativePhone(index, e.target.value)}
                    />
                  </TextField>
                  <IconButton
                    variant="neutral-tertiary"
                    size="medium"
                    icon={<FeatherTrash />}
                    onClick={() => removeAlternativePhone(index)}
                  />
                </div>
              </div>
            ))}

            {/* Email */}
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Email
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
                  placeholder="Ex: contact@supplier.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </TextField>
            </div>

            {/* Website */}
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Website
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
                  placeholder="Ex: www.supplier.com"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </TextField>
            </div>

            {/* Products */}
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Products
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
                  placeholder="Ex: Dental implants, crowns, materials"
                  value={formData.products}
                  onChange={(e) => setFormData({...formData, products: e.target.value})}
                />
              </TextField>
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
            {loading ? "Creating..." : "Create Supplier"}
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default NewSupplierModal;