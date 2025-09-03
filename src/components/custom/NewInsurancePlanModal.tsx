"use client";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { RadioGroup } from "@/ui/components/RadioGroup";
import { TextField } from "@/ui/components/TextField";
import { Dialog } from "@/ui/components/Dialog";
import { FeatherX } from "@subframe/core";
import { useInsurance } from "@/hooks/useInsurance";
import { CreateInsurancePlanRequest } from "@/types/insurance";

interface NewInsurancePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean, refresh?: boolean) => void;
}

function NewInsurancePlanModal({ open, onOpenChange }: NewInsurancePlanModalProps) {
  const [insuranceName, setInsuranceName] = useState("");
  const [startOption, setStartOption] = useState("copy_private");
  const [isCreating, setIsCreating] = useState(false);

  const { createInsurancePlan, loading, error } = useInsurance();

  const handleCreate = async () => {
    if (!insuranceName.trim()) return;

    setIsCreating(true);
    
    // Capitalize the insurance name
    const capitalizedName = insuranceName.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    console.log('🆕 Creating new insurance plan:', capitalizedName);
    
    const planData: CreateInsurancePlanRequest = {
      name: capitalizedName,
      type: 'custom',
      copy_from_private: startOption === "copy_private"
    };

    const result = await createInsurancePlan(planData);
    console.log('✅ Insurance plan creation result:', result);
    
    if (result) {
      console.log('🎉 Plan created successfully, closing modal and forcing refresh');
      // Success - close modal and reset form
      setInsuranceName("");
      setStartOption("copy_private");
      onOpenChange(false, true); // Close modal and trigger refresh
    }
    
    setIsCreating(false);
  };

  const handleClose = () => {
    onOpenChange(false, false);
    setInsuranceName("");
    setStartOption("copy_private");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => onOpenChange(open, false)}>
      <Dialog.Content className="h-auto w-full max-w-md flex-none mobile:max-w-[90vw]">
        <div className="flex w-full flex-col items-start bg-default-background rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-4 py-4 rounded-t-lg">
            <span className="text-heading-2 font-heading-2 text-default-font">
              New Insurance Plan
            </span>
            <IconButton
              disabled={false}
              icon={<FeatherX />}
              onClick={handleClose}
            />
          </div>
          
          {/* Content */}
          <div className="flex w-full flex-col items-start gap-6 px-4 py-4">
            {/* Insurance Name Field */}
            <div className="flex w-full flex-col items-start">
              <TextField
                className="h-auto w-full"
                disabled={false}
                error={false}
                label="Insurance name"
                helpText=""
                icon={null}
              >
                <TextField.Input
                  placeholder="Enter insurance plan name"
                  value={insuranceName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInsuranceName(event.target.value)}
                />
              </TextField>
            </div>

            {/* Radio Options */}
            <RadioGroup
              label=""
              helpText=""
              error={false}
              horizontal={false}
              value={startOption}
              onValueChange={setStartOption}
            >
              <RadioGroup.Option
                label="Copy procedures from private plan"
                value="copy_private"
              />
              <RadioGroup.Option 
                label="Start from Scratch" 
                value="from_scratch" 
              />
            </RadioGroup>

            {/* Error Message */}
            {error && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Create Button */}
            <Button
              className="h-10 w-full flex-none"
              disabled={!insuranceName.trim() || isCreating || loading}
              variant="brand-primary"
              size="large"
              icon={null}
              iconRight={null}
              loading={isCreating || loading}
              onClick={handleCreate}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

export default NewInsurancePlanModal;