"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  InsurancePlan, 
  Service, 
  InsurancePlanService,
  CreateInsurancePlanRequest,
  UpdateInsurancePlanRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  InsurancePlanServiceRequest
} from '@/types/insurance';

export const useInsurance = () => {
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug state changes
  useEffect(() => {
    console.log('insurancePlans state changed:', insurancePlans);
    console.log('insurancePlans state length:', insurancePlans.length);
  }, [insurancePlans]);

  // Using singleton supabase instance
  
  console.log('useInsurance hook initialized - insurancePlans length:', insurancePlans.length);

  // Fetch all insurance plans
  const fetchInsurancePlans = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching insurance plans...');

      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Fetch result - data:', data, 'error:', error);
      console.log('Raw data type:', typeof data);
      console.log('Raw data array check:', Array.isArray(data));
      console.log('Raw data content:', JSON.stringify(data, null, 2));

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }
      
      const plansArray = data || [];
      console.log('Plans array before setState:', plansArray);
      console.log('Plans array length:', plansArray.length);
      
      setInsurancePlans(plansArray);
      console.log('Set insurance plans:', plansArray.length, 'plans');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch insurance plans';
      console.error('Error fetching insurance plans:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new insurance plan
  const createInsurancePlan = async (planData: CreateInsurancePlanRequest): Promise<InsurancePlan | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating insurance plan with data:', planData);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user, 'User error:', userError);
      
      const insertData = {
        name: planData.name,
        type: planData.type || 'custom',
        description: planData.description,
        coverage_percentage: planData.coverage_percentage || 80,
        created_by: user?.id
      };
      
      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('insurance_plans')
        .insert(insertData)
        .select()
        .single();

      console.log('Insert result - data:', data, 'error:', error);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // If copying from private plan, copy procedures from the private plan
      console.log('🔍 Checking if should copy from private. copy_from_private value:', planData.copy_from_private);
      if (planData.copy_from_private && data) {
        console.log('✅ Copying procedures from private plan for new plan:', data.id);
        try {
          // First, find the private plan
          const { data: privatePlan, error: privatePlanError } = await supabase
            .from('insurance_plans')
            .select('id')
            .eq('type', 'private')
            .single();

          if (privatePlanError) {
            console.warn('Could not find private plan:', privatePlanError);
          } else if (privatePlan) {
            // Get all procedures from the private plan
            const { data: privateProcedures, error: proceduresError } = await supabase
              .from('procedures')
              .select('*')
              .eq('insurance_plan_id', privatePlan.id)
              .eq('is_active', true);

            if (proceduresError) {
              console.warn('Could not fetch private plan procedures:', proceduresError);
            } else if (privateProcedures && privateProcedures.length > 0) {
              // Copy procedures to the new plan
              const proceduresToCopy = privateProcedures.map(proc => ({
                name: proc.name,
                category: proc.category,
                price: proc.price,
                estimated_time: proc.estimated_time,
                is_active: proc.is_active,
                insurance_plan_id: data.id
              }));

              const { error: copyError } = await supabase
                .from('procedures')
                .insert(proceduresToCopy);

              if (copyError) {
                console.warn('Warning: Could not copy all procedures from private plan:', copyError);
              } else {
                console.log(`Successfully copied ${privateProcedures.length} procedures from private plan`);
              }
            } else {
              console.log('No procedures found in private plan to copy');
            }
          }
        } catch (copyErr) {
          console.warn('Error during procedure copying:', copyErr);
        }
      } else {
        console.log('❌ NOT copying from private plan. Starting from scratch.');
      }

      // Refresh insurance plans list
      console.log('🔄 Refreshing insurance plans list after creation...');
      await fetchInsurancePlans();
      console.log('✅ Insurance plans list refreshed');
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create insurance plan';
      console.error('Error creating insurance plan:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update insurance plan
  const updateInsurancePlan = async (id: string, planData: UpdateInsurancePlanRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('insurance_plans')
        .update(planData)
        .eq('id', id);

      if (error) throw error;

      // Refresh insurance plans list
      await fetchInsurancePlans();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update insurance plan');
      console.error('Error updating insurance plan:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete insurance plan and all associated procedures
  const deleteInsurancePlan = async (id: string): Promise<boolean> => {
    try {
      console.log('🗑️ Starting deletion for plan ID:', id);
      setLoading(true);
      setError(null);

      // First, check if this is the Private Plan
      const { data: planToDelete, error: fetchError } = await supabase
        .from('insurance_plans')
        .select('type, name')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Prevent deletion of Private Plan
      if (planToDelete?.type === 'private') {
        console.error('🚫 Cannot delete Private Plan - it is required for all accounts');
        setError('Private Plan cannot be deleted');
        return false;
      }

      // Delete all procedures associated with this plan
      console.log('🗑️ Deleting procedures for plan:', id);
      const { error: proceduresError } = await supabase
        .from('procedures')
        .delete()
        .eq('insurance_plan_id', id);

      if (proceduresError) {
        console.error('❌ Error deleting procedures:', proceduresError);
        throw proceduresError;
      }
      console.log('✅ Procedures deleted successfully');

      // Then soft delete the insurance plan
      const { error } = await supabase
        .from('insurance_plans')
        .update({ is_active: false })
        .eq('id', id)
        .neq('type', 'private'); // Extra safety check

      console.log('📝 Delete operation result - error:', error);

      if (error) throw error;

      console.log('✅ Insurance plan and all associated data deleted successfully');
      // Refresh insurance plans list
      await fetchInsurancePlans();
      console.log('🔄 Insurance plans list refreshed after deletion');
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete insurance plan';
      console.error('❌ Error deleting insurance plan:', err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Duplicate insurance plan
  const duplicateInsurancePlan = async (id: string, newName: string): Promise<InsurancePlan | null> => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch original plan
      const { data: originalPlan, error: fetchError } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate plan
      const { data: newPlan, error: createError } = await supabase
        .from('insurance_plans')
        .insert({
          name: newName,
          type: originalPlan.type,
          description: originalPlan.description,
          coverage_percentage: originalPlan.coverage_percentage,
          created_by: user?.id
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy all services from original plan
      const { data: originalServices, error: servicesError } = await supabase
        .from('insurance_plan_services')
        .select('*')
        .eq('insurance_plan_id', id);

      if (servicesError) throw servicesError;

      if (originalServices && originalServices.length > 0) {
        const servicesToCopy = originalServices.map(service => ({
          insurance_plan_id: newPlan.id,
          service_id: service.service_id,
          covered_price: service.covered_price,
          patient_copay: service.patient_copay,
          coverage_percentage: service.coverage_percentage,
          is_covered: service.is_covered,
          notes: service.notes
        }));

        const { error: copyError } = await supabase
          .from('insurance_plan_services')
          .insert(servicesToCopy);

        if (copyError) throw copyError;
      }

      // Refresh insurance plans list
      await fetchInsurancePlans();
      
      return newPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate insurance plan');
      console.error('Error duplicating insurance plan:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get insurance plan with services
  const getInsurancePlanWithServices = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('insurance_plan_services')
        .select(`
          *,
          service:services(*)
        `)
        .eq('insurance_plan_id', planId);

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insurance plan services');
      console.error('Error fetching insurance plan services:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    console.log('🚀 useInsurance - useEffect triggered, loading initial data');
    fetchInsurancePlans();
    fetchServices();
  }, []);


  return {
    // Data
    insurancePlans,
    services,
    loading,
    error,

    // Methods
    fetchInsurancePlans,
    fetchServices,
    createInsurancePlan,
    updateInsurancePlan,
    deleteInsurancePlan,
    duplicateInsurancePlan,
    getInsurancePlanWithServices,

    // Utils
    clearError: () => setError(null)
  };
};