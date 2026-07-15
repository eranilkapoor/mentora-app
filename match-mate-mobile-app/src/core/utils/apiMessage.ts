import { TFunction } from 'i18next';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { ApiFailure, ApiResponse } from '@/core/types/api/api.types';

type ApiLike = Pick<ApiFailure, 'code' | 'message'>;

const codeToI18nKey = (code: string): string =>
  `api.codes.${code.toLowerCase().replace(/\./g, '_')}`;

const normalizeMessage = (message?: string | string[]): string | undefined =>
  Array.isArray(message) ? message.join('\n') : message;

const hasApiCode = (value: unknown): value is ApiLike =>
  typeof value === 'object' &&
  value !== null &&
  'code' in value &&
  typeof (value as { code?: unknown }).code === 'string';

export const getApiErrorCode = (error: unknown): string | undefined => {
  const data =
    typeof error === 'object' && error !== null && 'data' in error
      ? (error as FetchBaseQueryError).data
      : error;

  return hasApiCode(data) ? data.code : undefined;
};

export const isPlanAccessError = (error: unknown): boolean => {
  const code = getApiErrorCode(error);

  return (
    code === 'SUBSCRIPTION.REQUIRED' ||
    code === 'SUBSCRIPTION.FEATURE_NOT_AVAILABLE' ||
    code === 'CHAT.ACCESS_DENIED'
  );
};

export const getApiResponseMessage = <T>(
  t: TFunction,
  response: ApiResponse<T>,
  fallbackKey = 'common.something_went_wrong'
): string => {
  const translated = t(codeToI18nKey(response.code));
  if (translated !== codeToI18nKey(response.code)) return translated;

  return normalizeMessage(response.message) ?? t(fallbackKey);
};

export const getApiErrorMessage = (
  t: TFunction,
  error: unknown,
  fallbackKey = 'common.something_went_wrong'
): string => {
  const data =
    typeof error === 'object' && error !== null && 'data' in error
      ? (error as FetchBaseQueryError).data
      : error;

  if (hasApiCode(data)) {
    const key = codeToI18nKey(data.code);
    const translated = t(key);
    if (translated !== key) return translated;

    return normalizeMessage(data.message) ?? t(fallbackKey);
  }

  if (error instanceof Error) return error.message;

  return t(fallbackKey);
};
