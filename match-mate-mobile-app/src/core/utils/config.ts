import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Env } from '../types';

const DEFAULT_API_PORT = '3000';
const DEFAULT_API_PATH = '/api/v1';

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
  const publicEnv = process.env as Record<string, string | undefined>;
  return getEnvValue(publicEnv[key]);
};

const getExpoConstants = (): ExpoConstantsWithHosts =>
  Constants as unknown as ExpoConstantsWithHosts;

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
  const host = hostWithPort.split(':')[0]?.trim();

  if (!host) return undefined;
  return host;
};

const getWebHostname = (): string | undefined => {
  if (Platform.OS !== 'web') return undefined;

  const location = (
    globalThis as typeof globalThis & {
      location?: {
        hostname?: string;
      };
    }
  ).location;

  return getEnvValue(location?.hostname);
};

const getConfiguredApiBaseUrl = (): string | undefined => {
  const envUrl = getPublicEnv('EXPO_PUBLIC_API_BASE_URL');
  if (envUrl) return normalizeUrl(envUrl);

  const extraUrl = getExpoConstants().expoConfig?.extra?.apiUrl;
  if (typeof extraUrl === 'string') {
    const configuredExtraUrl = getEnvValue(extraUrl);
    if (configuredExtraUrl) return normalizeUrl(configuredExtraUrl);
  }

  return undefined;
};

export const getApiBaseUrl = (): string => {
  const configuredUrl = getConfiguredApiBaseUrl();
  if (configuredUrl) return configuredUrl;

  const apiPort = getPublicEnv('EXPO_PUBLIC_API_PORT') ?? DEFAULT_API_PORT;
  const apiPath = getPublicEnv('EXPO_PUBLIC_API_PATH') ?? DEFAULT_API_PATH;
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

  if (trimmedUrl.length === 0) return null;
  if (/^(file:|data:)/i.test(trimmedUrl)) return trimmedUrl;

  if (/^https?:\/\//i.test(trimmedUrl)) {
    try {
      const parsedUrl = new URL(trimmedUrl);
      const isLocalDevUrl =
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1' ||
        /^10\./.test(parsedUrl.hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(parsedUrl.hostname) ||
        /^192\.168\./.test(parsedUrl.hostname);

      return isLocalDevUrl
        ? `${getApiOrigin()}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
        : trimmedUrl;
    } catch {
      return trimmedUrl;
    }
  }

  if (/^\/?(uploads|public|static)\//i.test(trimmedUrl)) {
    return `${getApiOrigin()}${trimmedUrl.startsWith('/') ? '' : '/'}${trimmedUrl}`;
  }

  return `${getApiBaseUrl()}${trimmedUrl.startsWith('/') ? '' : '/'}${trimmedUrl}`;
};

export const getClientVersion = (): string =>
  getPublicEnv('EXPO_PUBLIC_CLIENT_VERSION') ??
  getPublicEnv('EXPO_PUBLIC_REACT_APP_CLIENT_VERSION') ??
  '1.0.0';

const extraEnv = getExpoConstants().expoConfig?.extra?.env;

const config = {
  env: (typeof extraEnv === 'string' ? extraEnv : undefined) as Env,
  apiUrl: getApiBaseUrl(),
} as const satisfies {
  env: Env;
  apiUrl: string;
};

export default config;
