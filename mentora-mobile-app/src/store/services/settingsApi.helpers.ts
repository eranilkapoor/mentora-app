import { ApiResponse } from '@/core/types';

export function unwrapApiResponse<T>(response: T | ApiResponse<T>): T {
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    'data' in response
  ) {
    return (response as ApiResponse<T>).data as T;
  }

  return response as T;
}

export function wrapSettingsResponse<K extends string, T>(
  key: K,
  response: T | ApiResponse<T>
): Record<K, T> {
  return {
    [key]: unwrapApiResponse(response),
  } as Record<K, T>;
}
