"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Procedure, 
  CreateProcedureRequest,
  UpdateProcedureRequest
} from '@/types/procedures';

interface UseProceduresReturn {
  procedures: Procedure[];
  loading: boolean;
  error: string | null;
  fetchProcedures: () => Promise<void>;
  createProcedure: (procedureData: CreateProcedureRequest) => Promise<Procedure | null>;
  updateProcedure: (id: string, updates: UpdateProcedureRequest) => Promise<boolean>;
  deleteProcedure: (id: string) => Promise<boolean>;
  duplicateProcedure: (id: string) => Promise<Procedure | null>;
  checkNameExists: (name: string, insurancePlanId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useProcedures = (insurancePlanId?: string): UseProceduresReturn => {
  // State management
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch procedures function
  const fetchProcedures = useCallback(async () => {
    if (!insurancePlanId) {
      setProcedures([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('procedures')
        .select('*')
        .eq('insurance_plan_id', insurancePlanId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setProcedures(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch procedures';
      setError(errorMessage);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  }, [insurancePlanId]);

  // Create procedure function  
  const createProcedure = useCallback(async (procedureData: CreateProcedureRequest): Promise<Procedure | null> => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('procedures')
        .insert(procedureData)
        .select()
        .single();

      if (createError) throw createError;

      // Simply refresh the procedures list after creation
      if (data) {
        await fetchProcedures();
      }
      
      return data;
    } catch (err) {
      let errorMessage = 'Failed to create procedure';
      
      if (err instanceof Error) {
        // Handle specific database errors
        if (err.message.includes('duplicate key value violates unique constraint')) {
          errorMessage = 'A procedure with this name already exists for this plan';
        } else if (err.message.includes('procedures_name_insurance_plan_id_key')) {
          errorMessage = 'A procedure with this name already exists for this plan';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      return null;
    }
  }, [fetchProcedures]);

  // Check if procedure name already exists
  const checkNameExists = useCallback(async (name: string, insurancePlanId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('id')
        .eq('name', name.trim())
        .eq('insurance_plan_id', insurancePlanId)
        .limit(1);

      if (error) throw error;
      
      return (data && data.length > 0);
    } catch (err) {
      console.error('Error checking procedure name:', err);
      return false;
    }
  }, []);

  // Update procedure function
  const updateProcedure = useCallback(async (id: string, updates: UpdateProcedureRequest): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('procedures')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state optimistically
      setProcedures(prev => 
        prev.map(proc => 
          proc.id === id ? { ...proc, ...updates } : proc
        )
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update procedure';
      setError(errorMessage);
      // Refresh data on error to ensure consistency
      await fetchProcedures();
      return false;
    }
  }, [fetchProcedures]);

  // Delete procedure function
  const deleteProcedure = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('procedures')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state optimistically
      setProcedures(prev => prev.filter(proc => proc.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete procedure';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Duplicate procedure function
  const duplicateProcedure = useCallback(async (id: string): Promise<Procedure | null> => {
    try {
      setError(null);

      // Find the procedure to duplicate
      const procedureToDuplicate = procedures.find(p => p.id === id);
      if (!procedureToDuplicate) {
        throw new Error('Procedure not found');
      }

      const newProcedure: CreateProcedureRequest = {
        name: `${procedureToDuplicate.name} (Copy)`,
        category: procedureToDuplicate.category,
        price: procedureToDuplicate.price,
        estimated_time: procedureToDuplicate.estimated_time,
        is_active: procedureToDuplicate.is_active,
        insurance_plan_id: procedureToDuplicate.insurance_plan_id
      };

      return await createProcedure(newProcedure);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate procedure';
      setError(errorMessage);
      return null;
    }
  }, [procedures, createProcedure]);

  // Auto-fetch procedures when insurancePlanId changes
  useEffect(() => {
    if (insurancePlanId) {
      fetchProcedures();
    }
  }, [insurancePlanId, fetchProcedures]);

  return {
    procedures,
    loading,
    error,
    fetchProcedures,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    duplicateProcedure,
    checkNameExists,
    clearError
  };
};