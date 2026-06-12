import { Dimensions, Platform } from 'react-native';
import Constants from 'expo-constants';
import { Storage } from './storage';

export const { width: windowWidth, height: windowHeight } =
  Dimensions.get('window');
export const { version, ios, android } = Constants?.expoConfig ?? {};

export const BREAKPOINTS = {
  compact: 480,
  tablet: 768,
  desktop: 1024,
} as const;

export const CONTENT_WIDTH = {
  phone: 430,
  tablet: 720,
  desktop: 960,
} as const;

// ✅ Universal iOS check
export const isIos = Platform.OS === 'ios';

// ✅ Universal Android check
export const isAndroid = Platform.OS === 'android';

// ✅ Universal web check
export const isWeb = Platform.OS === 'web';

// ✅ Universal mobile check
export const isMobile = isIos || isAndroid;

export const isTabletWidth = (width: number): boolean =>
  width >= BREAKPOINTS.tablet;

export const getResponsiveContentWidth = (
  width: number,
  maxWidth = CONTENT_WIDTH.tablet
): number => Math.min(width, maxWidth);

export const getResponsiveMediaWidth = (
  width: number,
  horizontalInset = 0,
  maxWidth = CONTENT_WIDTH.phone
): number => Math.max(0, Math.min(width - horizontalInset, maxWidth));

// ✅ Universal UUID generator (no crypto dependency)
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/* ================= Device ID ================= */
let cachedDeviceId: string | null = null;

export const getDeviceId = async (): Promise<string> => {
  if (cachedDeviceId) return cachedDeviceId;

  try {
    if (isWeb) {
      let deviceId: string | null = localStorage.getItem('deviceId');

      if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem('deviceId', deviceId);
      }

      return deviceId;
    }

    // 📱 Mobile
    let deviceId: string | null = await Storage.getItem('deviceId');

    if (!deviceId) {
      deviceId = generateUUID();
      await Storage.setItem('deviceId', deviceId);
    }

    cachedDeviceId = deviceId;

    return deviceId;
  } catch {
    return generateUUID();
  }
};
