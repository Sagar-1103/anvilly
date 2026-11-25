export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F7F7F8',
    surfaceHover: '#EFEFF1',
    border: '#E4E4E7',
    borderSubtle: '#F4F4F5',
    primary: '#09090B',
    primaryText: '#FFFFFF',
    text: '#09090B',
    textSecondary: '#71717A',
    textMuted: '#A1A1AA',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',
    success: '#16A34A',
    darkSurface: '#09090B',
  },
  // Kept for compatibility; app uses crisp monochrome editorial palette
  dark: {
    background: '#FFFFFF',
    surface: '#F7F7F8',
    surfaceHover: '#EFEFF1',
    border: '#E4E4E7',
    borderSubtle: '#F4F4F5',
    primary: '#09090B',
    primaryText: '#FFFFFF',
    text: '#09090B',
    textSecondary: '#71717A',
    textMuted: '#A1A1AA',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',
    success: '#16A34A',
    darkSurface: '#09090B',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const Typography = {
  hero: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 33,
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 27,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
} as const;
