import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Appointment } from '../types';

/**
 * Hook for fetching ALL appointments from today onwards for search functionality
 * This is separate from useSchedulingData which only loads the visible period
 */
export const useAllAppointments = () => {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get today's date as the minimum date
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Fetch all appointments from today onwards
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', todayStr)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      console.log(`Loaded ${data?.length || 0} appointments for search from ${todayStr}`);
      setAllAppointments(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointments';
      setError(errorMessage);
      console.error('Error fetching all appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  const refreshAllAppointments = useCallback(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  return {
    allAppointments,
    loading,
    error,
    refreshAllAppointments
  };
};