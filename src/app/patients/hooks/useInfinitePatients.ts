import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, Patient } from "@/lib/supabase";
import { SortingState } from '@tanstack/react-table';

interface UseInfinitePatientsOptions {
  pageSize?: number;
  sorting?: SortingState;
  globalFilter?: string;
  professionalFilter?: string;
}

interface PatientsPage {
  data: Patient[];
  nextCursor: number | null;
  hasMore: boolean;
}

export function useInfinitePatients({
  pageSize = 50,
  sorting = [],
  globalFilter = '',
  professionalFilter = 'all'
}: UseInfinitePatientsOptions = {}) {
  // State
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Create a stable key for queries based on filters
  const queryKey = useMemo(() => 
    JSON.stringify({
      sorting,
      globalFilter,
      professionalFilter,
      pageSize
    }), 
    [sorting, globalFilter, professionalFilter, pageSize]
  );

  // Fetch a specific page
  const fetchPage = useCallback(async (page: number): Promise<PatientsPage> => {
    try {
      // Build query
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });

      // Apply professional filter
      if (professionalFilter && professionalFilter !== 'all') {
        query = query.eq('professional_id', professionalFilter);
      }

      // Apply global search filter
      if (globalFilter.trim()) {
        const searchTerm = globalFilter.toLowerCase().trim();
        // Search in multiple fields: name, email, phone
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      if (sorting.length > 0) {
        sorting.forEach((sort) => {
          const column = mapColumnToSupabaseField(sort.id);
          if (column) {
            query = query.order(column, { ascending: !sort.desc });
          }
        });
      } else {
        // Default sort by created_at desc
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const totalCount = count || 0;
      const fetchedCount = (data?.length || 0);
      const hasMore = from + fetchedCount < totalCount;

      return {
        data: data || [],
        nextCursor: hasMore ? page + 1 : null,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching patients page:', error);
      throw error;
    }
  }, [sorting, globalFilter, professionalFilter, pageSize]);

  // Reset and fetch first page when filters change
  const resetAndFetch = useCallback(async () => {
    try {
      setError(null);
      setInitialLoading(true);
      setAllPatients([]);
      setCurrentPage(0);
      setHasMore(true);

      const firstPage = await fetchPage(0);
      setAllPatients(firstPage.data);
      setHasMore(firstPage.hasMore);
      setCurrentPage(1);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch patients');
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage]);

  // Load next page (for infinite scroll)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const nextPage = await fetchPage(currentPage);
      
      // Append new data (avoiding duplicates)
      setAllPatients(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPatients = nextPage.data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPatients];
      });

      setHasMore(nextPage.hasMore);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load more patients');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, fetchPage]);

  // Reset when filters change
  useEffect(() => {
    resetAndFetch();
  }, [queryKey]);

  return {
    data: allPatients,
    loading,
    initialLoading,
    hasMore,
    error,
    loadMore,
    refetch: resetAndFetch,
    // Statistics
    totalLoaded: allPatients.length,
    currentPage,
  };
}

// Helper function to map column IDs to Supabase fields
function mapColumnToSupabaseField(columnId: string): string | null {
  const mapping: Record<string, string> = {
    patient: 'name',
    name: 'name',
    dateOfBirth: 'date_of_birth',
    lastVisit: 'last_visit',
    professional: 'professional_id',
    createdAt: 'created_at',
  };

  return mapping[columnId] || null;
}