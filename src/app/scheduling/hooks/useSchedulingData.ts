import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Appointment, BlockedTime, ViewMode, DateRange } from '../types';
import { getDateRange } from '../utils/dateUtils';

/**
 * Custom hook for managing scheduling data (appointments and blocked times)
 */
export const useSchedulingData = (selectedDate: Date, viewMode: ViewMode) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch appointments and blocked times for the current date range
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { start: startDate, end: endDate } = getDateRange(selectedDate, viewMode);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch appointments and blocked times in parallel
      const [appointmentsResult, blockedTimesResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('*')
          .gte('appointment_date', startDateStr)
          .lte('appointment_date', endDateStr)
          .eq('status', 'scheduled'), // Only show scheduled appointments

        supabase
          .from('blocked_times')
          .select('*')
          .gte('date', startDateStr)
          .lte('date', endDateStr)
      ]);

      if (appointmentsResult.error) throw appointmentsResult.error;
      if (blockedTimesResult.error) throw blockedTimesResult.error;

      setAppointments(appointmentsResult.data || []);
      setBlockedTimes(blockedTimesResult.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scheduling data';
      setError(errorMessage);
      console.error('Error fetching scheduling data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, viewMode]);

  /**
   * Refresh data after changes
   */
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    appointments,
    blockedTimes,
    loading,
    error,
    refreshData
  };
};