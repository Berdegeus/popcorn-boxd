import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import type { Theme } from '@/constants/theme';
import { useDesignSystem } from '@/context/DesignSystemContext';

export function useAppTheme() {
  const { theme } = useDesignSystem();
  return theme;
}

export function useThemeMode() {
  const { colorScheme } = useDesignSystem();
  return colorScheme;
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const makeStyles =
  <T extends NamedStyles<T>>(styles: (theme: Theme) => T) =>
  () => {
    const theme = useAppTheme();

    return useMemo(() => StyleSheet.create(styles(theme)), [theme]);
  };
