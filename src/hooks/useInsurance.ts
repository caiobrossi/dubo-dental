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

      // If copying from private plan, call the stored procedure (if it exists)
      if (planData.copy_from_private && data) {
        console.log('Copying services from private plan for:', data.id);
        try {
          const { error: copyError } = await supabase
            .rpc('copy_private_plan_services', { new_plan_id: data.id });
          
          if (copyError) {
            console.warn('Warning: Could not copy services from private plan (function may not exist):', copyError);
          } else {
            console.log('Successfully copied services from private plan');
          }
        } catch (copyErr) {
          console.warn('Copy function not available, skipping...', copyErr);
        }
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

  // Delete insurance plan (soft delete)
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

      const { error } = await supabase
        .from('insurance_plans')
        .update({ is_active: false })
        .eq('id', id)
        .neq('type', 'private'); // Extra safety check

      console.log('📝 Delete operation result - error:', error);

      if (error) throw error;

      console.log('✅ Insurance plan deleted successfully');
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