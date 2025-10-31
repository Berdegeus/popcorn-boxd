import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type FormMessageVariant = 'info' | 'success' | 'error';

type FormMessageProps = ViewProps & {
  message: string;
  variant?: FormMessageVariant;
};

export function FormMessage({ message, variant = 'info', style, ...rest }: FormMessageProps) {
  const infoColor = useThemeColor({ light: '#2563EB', dark: '#60A5FA' }, 'tint');
  const successColor = useThemeColor({ light: '#15803D', dark: '#4ADE80' }, 'tint');
  const errorColor = useThemeColor({ light: '#B91C1C', dark: '#F87171' }, 'tint');
  const infoBackground = useThemeColor({ light: '#DBEAFE', dark: '#1E3A8A' }, 'background');
  const successBackground = useThemeColor({ light: '#DCFCE7', dark: '#14532D' }, 'background');
  const errorBackground = useThemeColor({ light: '#FEE2E2', dark: '#7F1D1D' }, 'background');

  const textColor = variant === 'success' ? successColor : variant === 'error' ? errorColor : infoColor;
  const backgroundColor =
    variant === 'success' ? successBackground : variant === 'error' ? errorBackground : infoBackground;
  const accessibilityRole = variant === 'info' ? 'text' : 'alert';

  return (
    <View
      style={[styles.container, { backgroundColor, borderColor: textColor }, style]}
      accessibilityRole={accessibilityRole}
      accessibilityLiveRegion={variant === 'info' ? undefined : 'polite'}
      {...rest}
    >
      <ThemedText style={[styles.text, { color: textColor }]}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
