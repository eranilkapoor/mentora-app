import { getPublicEnv } from './config';

type ErrorContext = Record<string, unknown>;

const isEnabled = (): boolean =>
  getPublicEnv('EXPO_PUBLIC_ERROR_REPORTING_ENABLED') === 'true';

const getProvider = (): string =>
  getPublicEnv('EXPO_PUBLIC_ERROR_REPORTING_PROVIDER') ?? 'none';

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : JSON.stringify(error));
};

export const isErrorReportingEnabled = (): boolean => isEnabled();

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
    // Sentry is intentionally not imported until the package is installed and
    // configured. This keeps production builds stable while credentials are pending.
    if (__DEV__) {
      console.warn(
        '[ErrorReporter] Sentry provider selected, but @sentry/react-native is not wired yet.',
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

export const setErrorReporterUser = (
  user: { id?: string; email?: string; phone?: string } | null
): void => {
  if (!isEnabled() || getProvider() !== 'sentry') return;

  if (__DEV__) {
    console.warn('[ErrorReporter] user context updated', user?.id ?? 'guest');
  }
};
