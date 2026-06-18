import * as Sentry from '@sentry/react-native';
import type { ComponentType } from 'react';
import { getPublicEnv } from './config';

type ErrorContext = Record<string, unknown>;
type ErrorReporterUser = { id?: string; email?: string; phone?: string };

let initialized = false;

const isEnabled = (): boolean =>
  getPublicEnv('EXPO_PUBLIC_ERROR_REPORTING_ENABLED') === 'true';

const getProvider = (): string =>
  getPublicEnv('EXPO_PUBLIC_ERROR_REPORTING_PROVIDER') ?? 'none';

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : JSON.stringify(error));
};

export const isErrorReportingEnabled = (): boolean => isEnabled();

export const initErrorReporting = (): void => {
  if (initialized || !isEnabled() || getProvider() !== 'sentry') {
    return;
  }

  const dsn = getPublicEnv('EXPO_PUBLIC_SENTRY_DSN');
  if (!dsn) {
    if (__DEV__) {
      console.warn(
        '[ErrorReporter] Sentry provider selected, but EXPO_PUBLIC_SENTRY_DSN is empty.'
      );
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: getPublicEnv('EXPO_PUBLIC_ENV') ?? 'development',
    tracesSampleRate: Number(
      getPublicEnv('EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE') ?? '0'
    ),
    enableNative: true,
    debug: __DEV__,
  });

  initialized = true;
};

export const wrapWithErrorReporter = <P extends object>(
  Component: ComponentType<P>
): ComponentType<P> => {
  if (!isEnabled() || getProvider() !== 'sentry') {
    return Component;
  }

  return Sentry.wrap(
    Component as ComponentType<Record<string, unknown>>
  ) as ComponentType<P>;
};

export const reportError = (
  error: unknown,
  context: ErrorContext = {}
): void => {
  const normalizedError = normalizeError(error);

  if (!isEnabled()) {
    if (__DEV__) {
      console.error('[ErrorReporter]', normalizedError, context);
    }
    return;
  }

  const provider = getProvider();

  if (provider === 'sentry') {
    if (initialized) {
      Sentry.captureException(normalizedError, { extra: context });
    } else if (__DEV__) {
      console.warn(
        '[ErrorReporter] Sentry provider selected, but Sentry is not initialized.',
        normalizedError,
        context
      );
    }
    return;
  }

  if (__DEV__) {
    console.error('[ErrorReporter]', normalizedError, context);
  }
};

export const setErrorReporterUser = (user: ErrorReporterUser | null): void => {
  if (!isEnabled() || getProvider() !== 'sentry') return;

  if (initialized) {
    Sentry.setUser(user);
  } else if (__DEV__) {
    console.warn(
      '[ErrorReporter] Sentry user context skipped before initialization',
      user?.id ?? 'guest'
    );
  }
};
