export const HorizonGradient = [
  '#2D7B95',
  '#4F7D8F',
  '#9A7976',
  '#DE8B39',
] as const;

export const HeaderHorizonGradient = [
  'rgba(45, 123, 149, 0.95)',
  'rgba(79, 125, 143, 0.78)',
  'rgba(154, 121, 118, 0.52)',
  'rgba(154, 121, 118, 0.16)',
  'rgba(17, 17, 20, 0)',
  'rgba(17, 17, 20, 0)',
] as const;

export const HeaderHorizonLocations = [
  0,
  0.18,
  0.34,
  0.52,
  0.7,
  1,
] as const;

export const Colors = {
  dark: {
    background: '#111114',
    surface: '#1A1A1E',
    surfaceElevated: '#222228',
    surfaceHover: '#27272E',
    border: '#2A2A32',
    borderFocus: '#4B6B82',
    primary: '#F4F4F5',
    primaryText: '#111114',
    secondaryButton: '#242429',
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    danger: '#F87171',
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    dangerBorder: 'rgba(239, 68, 68, 0.28)',
    success: '#4ADE80',
    successBg: 'rgba(74, 222, 128, 0.12)',
    accentBlue: '#60A5FA',
    accentAmber: '#E58D35',
  },
  // Unified dark theme across light/dark keys for seamless compatibility
  light: {
    background: '#111114',
    surface: '#1A1A1E',
    surfaceElevated: '#222228',
    surfaceHover: '#27272E',
    border: '#2A2A32',
    borderFocus: '#4B6B82',
    primary: '#F4F4F5',
    primaryText: '#111114',
    secondaryButton: '#242429',
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    danger: '#F87171',
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    dangerBorder: 'rgba(239, 68, 68, 0.28)',
    success: '#4ADE80',
    successBg: 'rgba(74, 222, 128, 0.12)',
    accentBlue: '#60A5FA',
    accentAmber: '#E58D35',
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
  xl: 18,
  full: 9999,
} as const;

export const Typography = {
  hero: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  title: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.4,
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
