import { supabase } from './supabase';

export interface DataFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

export async function fetchData<T>(
  query: Promise<{ data: T | null; error: any }>,
  options?: DataFetchOptions<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await query;

    if (error) {
      const errorObj = new Error(error.message || 'An error occurred');
      options?.onError?.(errorObj);
      return { data: null, error: errorObj };
    }

    options?.onSuccess?.(data as T);
    return { data, error: null };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error');
    options?.onError?.(errorObj);
    return { data: null, error: errorObj };
  } finally {
    options?.onFinally?.();
  }
}

export function buildSchoolQuery<T extends Record<string, any>>(
  tableName: string,
  schoolId: string,
  columns = '*'
) {
  return supabase.from(tableName).select(columns).eq('school_id', schoolId);
}

export function buildUserQuery<T extends Record<string, any>>(
  tableName: string,
  userId: string,
  columns = '*'
) {
  return supabase.from(tableName).select(columns).eq('user_id', userId);
}

export async function ensureSchoolIsolation(
  schoolId: string,
  row: Record<string, any>
): Promise<boolean> {
  if (!row.school_id) {
    return false;
  }

  return row.school_id === schoolId;
}

export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of fields) {
    if (data[field] === null || data[field] === undefined || data[field] === '') {
      missingFields.push(String(field));
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}
