import { Text, type TextProps } from 'react-native';

import type { ThemeMode } from '@/constants/theme';
import { makeStyles, useAppTheme } from '@/hooks/useAppTheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useAppTheme();
  const colorOverrides: Partial<Record<ThemeMode, string>> = {};

  if (lightColor) {
    colorOverrides.light = lightColor;
  }

  if (darkColor) {
    colorOverrides.dark = darkColor;
  }

  const baseColor = useThemeColor(colorOverrides, 'text');
  const textColor = type === 'link' ? theme.colors.tint : baseColor;
  const styles = useStyles();

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  default: {
    ...theme.typography.body,
  },
  defaultSemiBold: {
    ...theme.typography.bodyStrong,
  },
  title: {
    ...theme.typography.display,
  },
  subtitle: {
    ...theme.typography.subtitle,
  },
  link: {
    ...theme.typography.link,
  },
}));
