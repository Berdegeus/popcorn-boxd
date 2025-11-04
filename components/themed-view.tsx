import { View, type ViewProps } from 'react-native';

import type { ThemeMode } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const overrides: Partial<Record<ThemeMode, string>> = {};

  if (lightColor) {
    overrides.light = lightColor;
  }

  if (darkColor) {
    overrides.dark = darkColor;
  }

  const backgroundColor = useThemeColor(overrides, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
