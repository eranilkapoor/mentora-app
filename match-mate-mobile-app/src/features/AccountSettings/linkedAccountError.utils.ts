import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { TFunction } from 'i18next';

type LinkedProvider = 'email' | 'google' | 'facebook' | 'apple' | 'phone';

interface ErrorData {
  meta?: {
    reason?: string;
    provider?: string;
  } | null;
}

export interface LinkedAccountErrorMessage {
  title: string;
  message: string;
  visibilityTime?: number;
}

const getErrorData = (error: unknown): ErrorData | undefined => {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return undefined;
  }

  return (error as FetchBaseQueryError).data as ErrorData | undefined;
};

const normalizeProvider = (
  provider?: string,
  fallback?: LinkedProvider
): LinkedProvider => {
  const normalized = provider?.toLowerCase();
  if (
    normalized === 'email' ||
    normalized === 'google' ||
    normalized === 'facebook' ||
    normalized === 'apple' ||
    normalized === 'phone'
  ) {
    return normalized;
  }

  return fallback ?? 'email';
};

export const getLinkedAccountErrorMessage = (
  t: TFunction,
  error: unknown,
  fallbackProvider?: LinkedProvider
): LinkedAccountErrorMessage | undefined => {
  const data = getErrorData(error);
  const reason = data?.meta?.reason;
  const provider = normalizeProvider(data?.meta?.provider, fallbackProvider);
  const providerLabel = t(`settings.account.provider_${provider}`);

  if (
    reason === 'login_method_already_linked' ||
    reason === 'email_already_registered'
  ) {
    return {
      title: t('settings.account.linked_account_already_used_title', {
        provider: providerLabel,
      }),
      message: t('settings.account.linked_account_already_used_message', {
        provider: providerLabel,
      }),
      visibilityTime: 7000,
    };
  }

  if (reason === 'provider_already_connected') {
    return {
      title: t('settings.account.provider_already_connected_title', {
        provider: providerLabel,
      }),
      message: t('settings.account.provider_already_connected_message', {
        provider: providerLabel,
      }),
      visibilityTime: 6000,
    };
  }

  return undefined;
};
