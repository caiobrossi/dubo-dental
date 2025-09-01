import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, LabOrder } from "@/lib/supabase";
import { SortingState } from '@tanstack/react-table';

interface UseInfiniteLabOrdersOptions {
  pageSize?: number;
  sorting?: SortingState;
  globalFilter?: string;
  professionalFilter?: string;
}

interface LabOrdersPage {
  data: LabOrder[];
  nextCursor: number | null;
  hasMore: boolean;
}

export function useInfiniteLabOrders({
  pageSize = 50,
  sorting = [],
  globalFilter = '',
  professionalFilter = 'all'
}: UseInfiniteLabOrdersOptions = {}) {
  // State
  const [allLabOrders, setAllLabOrders] = useState<LabOrder[]>([]);
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
  const fetchPage = useCallback(async (page: number): Promise<LabOrdersPage> => {
    try {
      // Build query
      let query = supabase
        .from('lab_orders')
        .select('*', { count: 'exact' });

      // Apply professional filter
      if (professionalFilter && professionalFilter !== 'all') {
        query = query.eq('professional_id', professionalFilter);
      }

      // Apply global search filter
      if (globalFilter.trim()) {
        const searchTerm = globalFilter.toLowerCase().trim();
        // Search in multiple fields: order_name, patient_name, lab_name
        query = query.or(`order_name.ilike.%${searchTerm}%,patient_name.ilike.%${searchTerm}%,lab_name.ilike.%${searchTerm}%`);
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
        // Default sort by created_at desc (newest first)
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

      // Data is already in correct format
      const transformedData = data || [];

      const totalCount = count || 0;
      const fetchedCount = transformedData.length;
      const hasMore = from + fetchedCount < totalCount;

      return {
        data: transformedData,
        nextCursor: hasMore ? page + 1 : null,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching lab orders page:', error);
      throw error;
    }
  }, [sorting, globalFilter, professionalFilter, pageSize]);

  // Reset and fetch first page when filters change
  const resetAndFetch = useCallback(async () => {
    try {
      setError(null);
      setInitialLoading(true);
      setAllLabOrders([]);
      setCurrentPage(0);
      setHasMore(true);

      const firstPage = await fetchPage(0);
      setAllLabOrders(firstPage.data);
      setHasMore(firstPage.hasMore);
      setCurrentPage(1);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch lab orders');
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
      setAllLabOrders(prev => {
        const existingIds = new Set(prev.map(order => order.id));
        const newOrders = nextPage.data.filter(order => !existingIds.has(order.id));
        return [...prev, ...newOrders];
      });

      setHasMore(nextPage.hasMore);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load more lab orders');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, fetchPage]);

  // Reset when filters change
  useEffect(() => {
    resetAndFetch();
  }, [queryKey]);

  return {
    data: allLabOrders,
    loading,
    initialLoading,
    hasMore,
    error,
    loadMore,
    refetch: resetAndFetch,
    // Statistics
    totalLoaded: allLabOrders.length,
    currentPage,
  };
}

// Helper function to map column IDs to Supabase fields
function mapColumnToSupabaseField(columnId: string): string | null {
  const mapping: Record<string, string> = {
    orderName: 'order_name',
    patientName: 'patient_name',
    professional: 'professional_id',
    labName: 'lab_name',
    services: 'services',
    dueDate: 'due_date',
    totalPrice: 'total_price',
    status: 'status',
    createdAt: 'created_at',
  };

  return mapping[columnId] || null;
}