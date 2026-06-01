import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Env } from '../types';

// ✅ All production defaults hardcoded as safety net
// These are used ONLY if env vars are missing at runtime (should not happen in normal builds)
const DEFAULTS = {
  API_PORT: '3000',
  API_PATH: '/api/v1',
  API_BASE_URL: 'https://matchmate.webnza.com',
  ENV: 'production' as Env,
  CLIENT_VERSION: '1.0.0',
} as const;

type ExpoConstantsWithHosts = {
  expoConfig?: {
    extra?: Record<string, unknown>;
    hostUri?: string;
  };
  manifest?: {
    debuggerHost?: string;
  };
  manifest2?: {
    extra?: {
      expoGo?: {
        debuggerHost?: string;
      };
    };
  };
};

const normalizeUrl = (url: string): string => url.replace(/\/+$/, '');

const getEnvValue = (value: string | undefined): string | undefined => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return undefined;
  return trimmedValue;
};

const getPublicEnv = (key: string): string | undefined => {
  return getEnvValue((process.env as Record<string, string | undefined>)[key]);
};

const getExpoConstants = (): ExpoConstantsWithHosts =>
  Constants as unknown as ExpoConstantsWithHosts;

const isProduction = (): boolean =>
  getPublicEnv('EXPO_PUBLIC_ENV') === 'production' ||
  getPublicEnv('EXPO_PUBLIC_ENV') === 'preview' ||
  !__DEV__;

const getExpoHostUri = (): string | undefined => {
  const expoConstants = getExpoConstants();
  return (
    getEnvValue(expoConstants.expoConfig?.hostUri) ??
    getEnvValue(expoConstants.manifest2?.extra?.expoGo?.debuggerHost) ??
    getEnvValue(expoConstants.manifest?.debuggerHost)
  );
};

const getHostFromUri = (uri: string): string | undefined => {
  const withoutProtocol = uri.replace(/^[a-z]+:\/\//i, '');
  const hostWithPort = withoutProtocol.split('/')[0] ?? '';
  return getEnvValue(hostWithPort.split(':')[0]);
};

const getWebHostname = (): string | undefined => {
  if (Platform.OS !== 'web') return undefined;
  return getEnvValue(globalThis.location?.hostname);
};

const joinApiUrl = (baseUrl: string, path: string): string => {
  const normalizedBaseUrl = normalizeUrl(baseUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedBaseUrl.endsWith(normalizedPath)) return normalizedBaseUrl;
  return `${normalizedBaseUrl}${normalizedPath}`;
};

export const getApiBaseUrl = (): string => {
  const apiBaseUrl = getPublicEnv('EXPO_PUBLIC_API_BASE_URL');
  const apiPath = getPublicEnv('EXPO_PUBLIC_API_PATH') ?? DEFAULTS.API_PATH;

  if (apiBaseUrl) {
    return joinApiUrl(apiBaseUrl, apiPath);
  }

  if (isProduction()) {
    if (__DEV__) {
      console.warn(
        '[Config] EXPO_PUBLIC_API_BASE_URL missing in production build. ' +
          'Using hardcoded fallback. Check your eas.json env config.'
      );
    }
    return joinApiUrl(DEFAULTS.API_BASE_URL, apiPath);
  }

  const apiPort = getPublicEnv('EXPO_PUBLIC_API_PORT') ?? DEFAULTS.API_PORT;

  const webHostname = getWebHostname();
  if (webHostname) {
    return normalizeUrl(`http://${webHostname}:${apiPort}${apiPath}`);
  }

  const expoHostUri = getExpoHostUri();
  const host = expoHostUri ? getHostFromUri(expoHostUri) : undefined;

  return normalizeUrl(`http://${host ?? 'localhost'}:${apiPort}${apiPath}`);
};

export const getApiOrigin = (): string => {
  try {
    return new URL(getApiBaseUrl()).origin;
  } catch {
    return getApiBaseUrl().replace(/\/api\/.*$/i, '');
  }
};

export const resolveApiUrl = (url: string): string | null => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) return null;
  if (/^(file:|data:|blob:|content:|ph:|assets-library:)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    try {
      const parsedUrl = new URL(trimmedUrl);
      const uploadPath = parsedUrl.pathname.replace(
        /^\/api(?:\/v\d+)?\/uploads\//i,
        '/uploads/'
      );
      const isLocalDevUrl =
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1' ||
        /^10\./.test(parsedUrl.hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(parsedUrl.hostname) ||
        /^192\.168\./.test(parsedUrl.hostname);

      return isLocalDevUrl
        ? `${getApiOrigin()}${uploadPath}${parsedUrl.search}${parsedUrl.hash}`
        : trimmedUrl;
    } catch {
      return trimmedUrl;
    }
  }

  if (/^\/?api\/v\d+\/uploads\//i.test(trimmedUrl)) {
    const uploadPath = trimmedUrl.replace(
      /^\/?api\/v\d+\/uploads\//i,
      'uploads/'
    );
    return `${getApiOrigin()}/${uploadPath}`;
  }

  if (/^\/?(uploads|public|static)\//i.test(trimmedUrl)) {
    return `${getApiOrigin()}${
      trimmedUrl.startsWith('/') ? '' : '/'
    }${trimmedUrl}`;
  }

  return `${getApiBaseUrl()}${trimmedUrl.startsWith('/') ? '' : '/'}${trimmedUrl}`;
};

export const getClientVersion = (): string =>
  getPublicEnv('EXPO_PUBLIC_CLIENT_VERSION') ?? DEFAULTS.CLIENT_VERSION;

let _config: { env: Env; apiUrl: string } | null = null;

const getConfig = (): { env: Env; apiUrl: string } => {
  if (_config) return _config;

  const extraEnv = getExpoConstants().expoConfig?.extra?.env;
  const resolvedEnv =
    (typeof extraEnv === 'string' ? extraEnv : null) ??
    getPublicEnv('EXPO_PUBLIC_ENV') ??
    DEFAULTS.ENV;

  _config = {
    env: resolvedEnv as Env,
    apiUrl: getApiBaseUrl(),
  };

  return _config;
};

const config = new Proxy({} as { env: Env; apiUrl: string }, {
  get(_target, prop: string) {
    return getConfig()[prop as keyof typeof _config];
  },
});

export default config;
