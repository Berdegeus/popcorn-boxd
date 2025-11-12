import { Platform, type TextStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export const spacing = {
  none: 0,
  hairline: 1,
  quark: 2,
  nano: 4,
  xxxs: 6,
  xxs: 8,
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
  full: 9999,
} as const;

export const durations = {
  swift: 120,
  fast: 180,
  normal: 240,
  deliberate: 320,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
}) as Record<'sans' | 'serif' | 'rounded' | 'mono', string>;

type TypographyStyle = {
  fontFamily: string;
  fontWeight: TextStyle['fontWeight'];
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
};

export const typography = {
  display: {
    fontFamily: Fonts.sans,
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: Fonts.sans,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.1,
  },
  heading: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 26,
  },
  body: {
    fontFamily: Fonts.sans,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyStrong: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: Fonts.sans,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
  },
  captionStrong: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  footnote: {
    fontFamily: Fonts.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
  },
  link: {
    fontFamily: Fonts.sans,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
} as const satisfies Record<string, TypographyStyle>;

export const components = {
  button: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
    radius: radii.lg,
  },
  textField: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    radius: radii.md,
  },
  card: {
    padding: spacing.lg,
    radius: radii.lg,
  },
  list: {
    gap: spacing.sm,
  },
} as const;

type ThemeColors = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  tint: string;
  primary: string;
  primaryOn: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  success: string;
  successOn: string;
  successSurface: string;
  danger: string;
  dangerOn: string;
  dangerSurface: string;
  dangerSurfaceStrong: string;
  warning: string;
  warningOn: string;
  warningSurface: string;
  info: string;
  infoOn: string;
  infoSurface: string;
  border: string;
  borderStrong: string;
  divider: string;
  overlay: string;
  shadow: string;
  elevatedShadow: string;
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  skeleton: string;
};

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  tint: '#0A7EA4',
  primary: '#0A7EA4',
  primaryOn: '#FFFFFF',
  icon: '#475569',
  tabIconDefault: '#64748B',
  tabIconSelected: '#0A7EA4',
  success: '#15803D',
  successOn: '#FFFFFF',
  successSurface: '#DCFCE7',
  danger: '#B91C1C',
  dangerOn: '#FFFFFF',
  dangerSurface: '#FEE2E2',
  dangerSurfaceStrong: '#FBD5D5',
  warning: '#B45309',
  warningOn: '#FFFFFF',
  warningSurface: '#FEF3C7',
  info: '#1D4ED8',
  infoOn: '#FFFFFF',
  infoSurface: '#DBEAFE',
  border: '#CBD5F5',
  borderStrong: '#94A3B8',
  divider: '#E2E8F0',
  overlay: 'rgba(15, 23, 42, 0.08)',
  shadow: 'rgba(15, 23, 42, 0.08)',
  elevatedShadow: 'rgba(15, 23, 42, 0.15)',
  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5F5',
  inputPlaceholder: '#6B7280',
  skeleton: '#E2E8F0',
};

const darkColors: ThemeColors = {
  background: '#0B1120',
  backgroundAlt: '#0F172A',
  surface: '#111827',
  surfaceAlt: '#1E293B',
  text: '#E2E8F0',
  textSecondary: '#A1AEC7',
  textMuted: '#94A3B8',
  tint: '#1D9BF0',
  primary: '#38BDF8',
  primaryOn: '#0B1120',
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: '#1D9BF0',
  success: '#4ADE80',
  successOn: '#0B1120',
  successSurface: '#12291C',
  danger: '#F87171',
  dangerOn: '#0B1120',
  dangerSurface: '#2C1517',
  dangerSurfaceStrong: '#3A1B1D',
  warning: '#FBBF24',
  warningOn: '#0B1120',
  warningSurface: '#2C2413',
  info: '#60A5FA',
  infoOn: '#0B1120',
  infoSurface: '#14273D',
  border: '#2A3444',
  borderStrong: '#1F2937',
  divider: '#1F2937',
  overlay: 'rgba(15, 23, 42, 0.45)',
  shadow: 'rgba(1, 8, 23, 0.45)',
  elevatedShadow: 'rgba(2, 6, 23, 0.65)',
  inputBackground: '#111827',
  inputBorder: '#64748B',
  inputPlaceholder: '#94A3B8',
  skeleton: '#1F2937',
};

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  durations: typeof durations;
  typography: typeof typography;
  components: typeof components;
};

const baseTokens = {
  spacing,
  radii,
  durations,
  typography,
  components,
} as const;

export const themes: Record<ThemeMode, Theme> = {
  light: {
    mode: 'light',
    colors: lightColors,
    ...baseTokens,
  },
  dark: {
    mode: 'dark',
    colors: darkColors,
    ...baseTokens,
  },
} as const;

export const Colors = {
  light: themes.light.colors,
  dark: themes.dark.colors,
} as const;

export const Tokens = {
  spacing,
  radii,
  durations,
  typography,
  components,
} as const;
