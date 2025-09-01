import { supabase, Patient } from "@/lib/supabase";
import { SortingState, PaginationState } from '@tanstack/react-table';

export interface FetchPatientsParams {
  sorting?: SortingState;
  pagination?: PaginationState;
  globalFilter?: string;
  professionalFilter?: string;
}

export interface FetchPatientsResult {
  data: Patient[];
  totalCount: number;
  pageCount: number;
}

/**
 * Fetches patients with server-side sorting, pagination, and filtering
 * This function demonstrates how to integrate TanStack Table with Supabase
 */
export async function fetchPatients(params: FetchPatientsParams = {}): Promise<FetchPatientsResult> {
  const {
    sorting = [],
    pagination = { pageIndex: 0, pageSize: 25 },
    globalFilter = '',
    professionalFilter = 'all'
  } = params;

  try {
    // Build the base query
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
      query = query.or(`name.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
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
    const { pageIndex, pageSize } = pagination;
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }

    const totalCount = count || 0;
    const pageCount = Math.ceil(totalCount / pageSize);

    return {
      data: data || [],
      totalCount,
      pageCount,
    };
  } catch (error) {
    console.error('Error in fetchPatients:', error);
    throw error;
  }
}

/**
 * Maps TanStack Table column IDs to Supabase field names
 */
function mapColumnToSupabaseField(columnId: string): string | null {
  const mapping: Record<string, string> = {
    patient: 'name',
    name: 'name',
    dateOfBirth: 'date_of_birth',
    lastVisit: 'last_visit',
    professional: 'professional_id', // Note: This might need special handling for professional names
    created_at: 'created_at',
  };

  return mapping[columnId] || null;
}

/**
 * Client-side filtering function for when using client-side table
 * This mimics server-side filtering logic but works on already fetched data
 */
export function filterPatientsClientSide(
  patients: Patient[],
  globalFilter: string,
  professionalFilter: string
): Patient[] {
  let filtered = patients;

  // Apply professional filter
  if (professionalFilter && professionalFilter !== 'all') {
    filtered = filtered.filter(patient => patient.professional_id === professionalFilter);
  }

  // Apply global search filter
  if (globalFilter.trim()) {
    const term = globalFilter.toLowerCase().trim();
    filtered = filtered.filter(patient => {
      // Filter by name
      if (patient.name?.toLowerCase().includes(term)) return true;
      
      // Filter by ID
      if (patient.id?.toLowerCase().includes(term)) return true;
      
      // Filter by date of birth
      if (patient.date_of_birth) {
        const dob = new Date(patient.date_of_birth).toLocaleDateString('pt-BR');
        if (dob.includes(term)) return true;
      }
      
      return false;
    });
  }

  return filtered;
}

/**
 * Example of how to wire up server-side operations with TanStack Table
 * This would be called from your table component when sorting/pagination changes
 */
export function createServerSideTableHandlers(
  refetch: (params: FetchPatientsParams) => void,
  currentParams: FetchPatientsParams
) {
  return {
    onSortingChange: (updaterOrValue: any) => {
      const newSorting = typeof updaterOrValue === 'function' 
        ? updaterOrValue(currentParams.sorting || [])
        : updaterOrValue;
      
      refetch({
        ...currentParams,
        sorting: newSorting,
        pagination: { ...currentParams.pagination!, pageIndex: 0 }, // Reset to first page
      });
    },
    
    onPaginationChange: (updaterOrValue: any) => {
      const newPagination = typeof updaterOrValue === 'function'
        ? updaterOrValue(currentParams.pagination || { pageIndex: 0, pageSize: 25 })
        : updaterOrValue;
      
      refetch({
        ...currentParams,
        pagination: newPagination,
      });
    },
    
    onGlobalFilterChange: (updaterOrValue: any) => {
      const newFilter = typeof updaterOrValue === 'function'
        ? updaterOrValue(currentParams.globalFilter || '')
        : updaterOrValue;
      
      refetch({
        ...currentParams,
        globalFilter: newFilter,
        pagination: { ...currentParams.pagination!, pageIndex: 0 }, // Reset to first page
      });
    },
  };
}