"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { Switch } from "@/ui/components/Switch";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherX } from "@subframe/core";
import { supabase } from "@/lib/supabase";

interface NewProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated?: () => void;
}

export default function NewProductModal({ open, onOpenChange, onProductCreated }: NewProductModalProps) {
  console.log('NewProductModal render:', { open });
  
  const [formData, setFormData] = useState({
    product_name: "",
    supplier: "",
    category: "",
    unit_price: "",
    minimum_stock: "",
    maximum_stock: "",
    current_stock: "",
    description: "",
    sku: "",
    location: "",
    low_stock_notification: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        product_name: "",
        supplier: "",
        category: "",
        unit_price: "",
        minimum_stock: "",
        maximum_stock: "",
        current_stock: "",
        description: "",
        sku: "",
        location: "",
        low_stock_notification: true
      });
      setErrors({});
    }
  }, [open]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = "Product name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.unit_price.trim()) {
      newErrors.unit_price = "Unit price is required";
    } else if (isNaN(Number(formData.unit_price)) || Number(formData.unit_price) < 0) {
      newErrors.unit_price = "Please enter a valid price";
    }

    if (!formData.minimum_stock.trim()) {
      newErrors.minimum_stock = "Minimum stock is required";
    } else if (isNaN(Number(formData.minimum_stock)) || Number(formData.minimum_stock) < 0) {
      newErrors.minimum_stock = "Please enter a valid number";
    }

    if (!formData.maximum_stock.trim()) {
      newErrors.maximum_stock = "Maximum stock is required";
    } else if (isNaN(Number(formData.maximum_stock)) || Number(formData.maximum_stock) < 0) {
      newErrors.maximum_stock = "Please enter a valid number";
    }

    if (!formData.current_stock.trim()) {
      newErrors.current_stock = "Current stock is required";
    } else if (isNaN(Number(formData.current_stock)) || Number(formData.current_stock) < 0) {
      newErrors.current_stock = "Please enter a valid number";
    }

    // Check if minimum <= maximum
    if (formData.minimum_stock && formData.maximum_stock) {
      const min = Number(formData.minimum_stock);
      const max = Number(formData.maximum_stock);
      if (min > max) {
        newErrors.maximum_stock = "Maximum stock must be greater than minimum stock";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Generate SKU if not provided
      const sku = formData.sku.trim() || `SKU-${Date.now()}`;

      const productData = {
        product_name: formData.product_name.trim(),
        supplier: formData.supplier.trim() || null,
        category: formData.category,
        unit_price: Number(formData.unit_price),
        minimum_stock: Number(formData.minimum_stock),
        maximum_stock: Number(formData.maximum_stock),
        current_stock: Number(formData.current_stock),
        description: formData.description.trim() || null,
        sku: sku,
        location: formData.location.trim() || null,
        is_favorite: false
      };

      const { error } = await supabase
        .from('inventory')
        .insert([productData]);

      if (error) {
        console.error('Error creating product:', error);
        // Handle specific database errors
        if (error.code === '23505' && error.message.includes('sku')) {
          setErrors({ sku: "SKU already exists. Please use a different SKU." });
          return;
        }
        throw error;
      }

      console.log('Product created successfully');
      onOpenChange(false);
      if (onProductCreated) {
        onProductCreated();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ general: "Failed to create product. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex w-full flex-col items-start bg-default-background mobile:h-auto mobile:w-96">
        <div className="flex w-full grow shrink-0 basis-0 items-center justify-between border-b border-solid border-neutral-border bg-default-background px-4 py-4">
          <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
            Add product
          </span>
          <IconButton
            disabled={loading}
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        
        <div className="flex w-full flex-col items-start gap-4 px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
          {errors.general && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Product name *
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={loading}
                error={!!errors.product_name}
                variant="filled"
                label=""
                helpText={errors.product_name}
                icon={null}
                iconRight={null}
              >
                <TextField.Input
                  placeholder="Enter product name"
                  value={formData.product_name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                    handleInputChange("product_name", event.target.value)}
                />
              </TextField>
            </div>

            <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Category *
              </span>
              <Select
                className="h-auto grow shrink-0 basis-0 self-stretch"
                disabled={loading}
                error={!!errors.category}
                variant="filled"
                label=""
                placeholder="Select category"
                helpText={errors.category}
                icon={null}
                value={formData.category}
                onValueChange={(value: string) => handleInputChange("category", value)}
              >
                <Select.Item value="Equipment">Equipment</Select.Item>
                <Select.Item value="Consumables">Consumables</Select.Item>
                <Select.Item value="Materials">Materials</Select.Item>
                <Select.Item value="Instruments">Instruments</Select.Item>
              </Select>
            </div>
            
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Unit price *
              </span>
              <TextField
                className="h-10 grow shrink-0 basis-0"
                disabled={loading}
                error={!!errors.unit_price}
                variant="filled"
                label=""
                helpText={errors.unit_price}
                icon={null}
                iconRight={null}
              >
                <TextField.Input
                  placeholder="€0.00"
                  value={formData.unit_price}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const value = event.target.value;
                    // Allow only numbers, dots, and commas for monetary values
                    const sanitizedValue = value.replace(/[^0-9.,]/g, '');
                    // Convert comma to dot for decimal separator
                    const normalizedValue = sanitizedValue.replace(',', '.');
                    // Prevent multiple dots
                    const parts = normalizedValue.split('.');
                    let finalValue = parts[0];
                    if (parts.length > 1) {
                      // Keep only first dot and limit to 2 decimal places
                      finalValue += '.' + parts[1].substring(0, 2);
                    }
                    handleInputChange("unit_price", finalValue);
                  }}
                />
              </TextField>
            </div>
          </div>
          
          <div className="flex w-full items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-6">
            <TextField
              className="h-auto grow shrink-0 basis-0"
              disabled={loading}
              error={!!errors.minimum_stock}
              variant="filled"
              label="Min value *"
              helpText={errors.minimum_stock}
              icon={null}
              iconRight={null}
            >
              <TextField.Input
                placeholder="0"
                value={formData.minimum_stock}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange("minimum_stock", event.target.value)}
              />
            </TextField>
            <TextField
              className="h-auto grow shrink-0 basis-0"
              disabled={loading}
              error={!!errors.maximum_stock}
              variant="filled"
              label="Max value *"
              helpText={errors.maximum_stock}
              icon={null}
              iconRight={null}
            >
              <TextField.Input
                placeholder="0"
                value={formData.maximum_stock}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange("maximum_stock", event.target.value)}
              />
            </TextField>
            <TextField
              className="h-auto grow shrink-0 basis-0"
              disabled={loading}
              error={!!errors.current_stock}
              variant="filled"
              label="Current in stock *"
              helpText={errors.current_stock}
              icon={null}
              iconRight={null}
            >
              <TextField.Input
                placeholder="0"
                value={formData.current_stock}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange("current_stock", event.target.value)}
              />
            </TextField>
          </div>
          
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-col items-start gap-2">
              <span className="font-body-medium-/-bold text-default-font">
                Receive low stock notification
              </span>
              <span className="line-clamp-2 text-body-medium font-body-medium text-default-font">
                Dubo will automatically notify you when the stock gets low 
              </span>
            </div>
            <Switch
              checked={formData.low_stock_notification}
              onCheckedChange={(checked: boolean) => 
                handleInputChange("low_stock_notification", checked)}
            />
          </div>
          
          <div className="flex w-full items-start gap-4">
            <Button
              className="h-10 grow shrink-0 basis-0"
              disabled={loading}
              variant="brand-tertiary"
              size="large"
              icon={null}
              iconRight={null}
              loading={loading}
              onClick={() => console.log('Add another clicked')}
            >
              Add another product
            </Button>
            <Button
              className="h-10 grow shrink-0 basis-0"
              disabled={loading}
              variant="brand-primary"
              size="large"
              icon={null}
              iconRight={null}
              loading={loading}
              onClick={handleSubmit}
            >
              Add product
            </Button>
          </div>
        </div>
      </div>
    </DialogLayout>
  );
}