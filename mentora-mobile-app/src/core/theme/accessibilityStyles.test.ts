import { lightTheme } from './lightTheme';
import {
  applyAccessibilityToTheme,
  FONT_SCALE_BY_SIZE,
} from './accessibilityTheme';
import { applyAccessibilityToStyles } from './accessibilityStyles';

describe('accessibility presentation', () => {
  it('scales text and line height while preserving already-bold text', () => {
    const styles = {
      body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
      heading: { fontSize: 20, fontWeight: '800' as const },
      layout: { padding: 12 },
    };

    expect(applyAccessibilityToStyles(styles, 1.2, true)).toEqual({
      body: { fontSize: 17, lineHeight: 24, fontWeight: '700' },
      heading: { fontSize: 24, fontWeight: '800' },
      layout: { padding: 12 },
    });
  });

  it('applies extra-large text, high contrast, and reduced motion globally', () => {
    const theme = applyAccessibilityToTheme(
      lightTheme,
      {
        fontSize: 'extra_large',
        boldText: true,
        highContrastMode: true,
        reduceAnimations: true,
        screenReaderOptimized: true,
      },
      false
    );

    expect(FONT_SCALE_BY_SIZE.extra_large).toBe(1.22);
    expect(theme.typography.body.fontSize).toBe(
      Math.round(lightTheme.typography.body.fontSize * 1.22)
    );
    expect(theme.typography.body.fontWeight).toBe('700');
    expect(theme.colors.background).toBe('#FFFFFF');
    expect(theme.colors.textPrimary).toBe('#111111');
    expect(theme.shadows.lg.shadowOpacity).toBe(0);
    expect(theme.shadows.lg.elevation).toBe(0);
  });
});
