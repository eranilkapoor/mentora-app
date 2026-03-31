import { Dimensions, Platform } from 'react-native';
import Constants from 'expo-constants';
import { Storage } from './store';

export const { width: windowWidth, height: windowHeight } =
  Dimensions.get('window');
export const { version, ios, android } = Constants?.expoConfig ?? {};

// ✅ Universal iOS check
export const isIos = Platform.OS === 'ios';

// ✅ Universal Android check
export const isAndroid = Platform.OS === 'android';

// ✅ Universal web check
export const isWeb = Platform.OS === 'web';

// ✅ Universal mobile check
export const isMobile = isIos || isAndroid;

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
