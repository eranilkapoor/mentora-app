import { StyleSheet } from 'react-native';

type StyleValue = Record<string, unknown>;

const scaleFontValue = (value: unknown, scale: number): unknown =>
  typeof value === 'number' ? Math.round(value * scale) : value;

const shouldBoldWeight = (value: unknown): boolean => {
  if (value === undefined || value === 'normal' || value === '400') return true;
  if (typeof value === 'number') return value < 700;
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric < 700 : value !== 'bold';
  }
  return false;
};

const applyAccessibilityToStyleObject = (
  style: StyleValue,
  fontScale: number,
  boldText: boolean
): StyleValue => {
  const next: StyleValue = { ...style };

  if ('fontSize' in next) {
    next.fontSize = scaleFontValue(next.fontSize, fontScale);

    if (boldText && shouldBoldWeight(next.fontWeight)) {
      next.fontWeight = '700';
    }
  }

  if ('lineHeight' in next) {
    next.lineHeight = scaleFontValue(next.lineHeight, fontScale);
  }

  return next;
};

export const applyAccessibilityToStyles = <T extends StyleSheet.NamedStyles<T>>(
  styles: T,
  fontScale: number,
  boldText: boolean
): T => {
  if (fontScale === 1 && !boldText) return styles;

  return Object.fromEntries(
    Object.entries(styles).map(([key, value]) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return [key, value];
      }

      return [
        key,
        applyAccessibilityToStyleObject(
          value as StyleValue,
          fontScale,
          boldText
        ),
      ];
    })
  ) as T;
};
