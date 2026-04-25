// caption.color removed — consumers should use theme.colors.textMuted directly
// so it responds to dark mode correctly

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  },
  h1: { fontSize: 28, fontWeight: '900' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  button: { fontSize: 16, fontWeight: '600' },
};

export const COMPONENTS = {
  button: { height: 48, borderRadius: 10 },
  input: { height: 48, borderRadius: 10, borderWidth: 1 },
  avatar: { size: 48, radius: 24 },
};
