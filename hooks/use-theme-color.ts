/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import type { Theme, ThemeMode } from '@/constants/theme';
import { useDesignSystem } from '@/context/DesignSystemContext';

type ThemeColorOverrides = Partial<Record<ThemeMode, string>>;

export function useThemeColor(props: ThemeColorOverrides, colorName: keyof Theme['colors']) {
  const { colorScheme, theme } = useDesignSystem();
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return theme.colors[colorName];
}
