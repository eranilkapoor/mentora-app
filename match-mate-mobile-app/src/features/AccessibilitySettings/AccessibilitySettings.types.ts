import { SettingsNavigationProp } from '@/navigation/types';

export interface AccessibilitySettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export type AccessibilityFontSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'extra_large';

export interface AccessibilitySettings {
  fontSize: AccessibilityFontSize;
  highContrastMode: boolean;
  reduceAnimations: boolean;
  screenReaderOptimized: boolean;
  boldText: boolean;
}

export interface AccessibilitySettingsResponse {
  accessibility: AccessibilitySettings;
}

export interface UpdateAccessibilitySettingsPayload extends Partial<AccessibilitySettings> {}
