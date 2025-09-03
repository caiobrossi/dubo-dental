"use client";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { RolesAndPermissionsCard } from "@/ui/components/RolesAndPermissionsCard";
import NewInsurancePlanModal from "@/components/custom/NewInsurancePlanModal";
import { useInsurance } from "@/hooks/useInsurance";
import { FeatherCopy } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { useRouter } from "next/navigation";

function InsuranceSettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { insurancePlans, loading, error, deleteInsurancePlan, duplicateInsurancePlan, fetchInsurancePlans } = useInsurance();
  const router = useRouter();

  const handleModalClose = (open: boolean, refresh = false) => {
    setIsModalOpen(open);
    if (!open && refresh) {
      console.log('🔄 Forcing refresh after plan creation');
      fetchInsurancePlans();
    }
  };

  // Debug logging
  console.log('InsuranceSettingsPage - insurancePlans:', insurancePlans);
  console.log('InsuranceSettingsPage - loading:', loading);
  console.log('InsuranceSettingsPage - error:', error);


  const handleEdit = (planId: string) => {
    console.log('🔧 Edit plan clicked:', planId);
    
    // Find the plan to check if it's the Private Plan
    const plan = insurancePlans.find(p => p.id === planId);
    console.log('📋 Plan found:', plan);
    console.log('📝 Plan type:', plan?.type);
    
    if (plan?.type === 'private') {
      console.log('🚀 Navigating to Private Plan page...');
      // Navigate to the Private Plan detailed page
      router.push('/settings/insurance/private-plan');
    } else {
      // TODO: Implement edit functionality for other plans
      console.log('⚠️ Edit functionality for custom plans coming soon');
    }
  };

  const handleDuplicate = async (planId: string, planName: string) => {
    const newName = `${planName} (Copy)`;
    await duplicateInsurancePlan(planId, newName);
  };

  const handleDelete = async (planId: string) => {
    console.log('🗑️ Delete requested for plan:', planId);
    if (window.confirm('Are you sure you want to delete this insurance plan?')) {
      console.log('✅ User confirmed deletion');
      const result = await deleteInsurancePlan(planId);
      console.log('📝 Delete result:', result);
      
      if (result) {
        console.log('🔄 Refreshing insurance plans list after deletion');
        await fetchInsurancePlans();
      }
    } else {
      console.log('❌ User cancelled deletion');
    }
  };
  return (
    <div className="flex grow shrink-0 basis-0 flex-col items-center gap-6 lg:gap-8 self-stretch px-4 lg:px-0 py-4 lg:py-0">
      
      {/* Desktop Title */}
      <div className="hidden lg:flex w-full items-center gap-2">
        <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
          Service list and Insurance
        </span>
        <Button
          disabled={false}
          size="medium"
          icon={<FeatherPlus />}
          iconRight={null}
          loading={false}
          onClick={() => setIsModalOpen(true)}
        >
          Add New plan
        </Button>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex flex-col w-full gap-4">
        <span className="text-heading-3 font-heading-3 text-default-font text-center">
          Service list and Insurance
        </span>
        <Button
          disabled={false}
          size="medium"
          icon={<FeatherPlus />}
          iconRight={null}
          loading={false}
          onClick={() => setIsModalOpen(true)}
          className="w-full"
        >
          Add New plan
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-subtext-color">Loading insurance plans...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}


      {/* Insurance Plans Grid */}
      <div className="w-full items-start gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-subtext-color">
            Loading insurance plans...
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12 text-red-600">
            Error: {error}
          </div>
        ) : insurancePlans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-subtext-color">
            No insurance plans found. Create your first plan to get started.
          </div>
        ) : (
          insurancePlans.map((plan) => (
            <RolesAndPermissionsCard
              key={plan.id}
              title={plan.name}
              menuActions={
                <DropdownMenu>
                  <DropdownMenu.DropdownItem 
                    icon={<FeatherEdit2 />}
                    onClick={() => handleEdit(plan.id)}
                  >
                    Edit plan
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem 
                    icon={<FeatherCopy />}
                    onClick={() => handleDuplicate(plan.id, plan.name)}
                  >
                    Duplicate plan
                  </DropdownMenu.DropdownItem>
                  {plan.type !== 'private' && (
                    <DropdownMenu.DropdownItem 
                      icon={<FeatherTrash />}
                      onClick={() => handleDelete(plan.id)}
                    >
                      Delete
                    </DropdownMenu.DropdownItem>
                  )}
                </DropdownMenu>
              }
            />
          ))
        )}
      </div>

      {/* New Insurance Plan Modal */}
      <NewInsurancePlanModal 
        open={isModalOpen} 
        onOpenChange={handleModalClose} 
      />
    </div>
  );
}

export default InsuranceSettingsPage;