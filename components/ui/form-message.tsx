import React, { useMemo } from 'react';
import { View, ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { makeStyles, useAppTheme } from '@/hooks/useAppTheme';

type FormMessageVariant = 'info' | 'success' | 'error';

type FormMessageProps = ViewProps & {
  message: string;
  variant?: FormMessageVariant;
};

export function FormMessage({ message, variant = 'info', style, ...rest }: FormMessageProps) {
  const theme = useAppTheme();
  const styles = useStyles();

  const { textColor, backgroundColor } = useMemo(() => {
    switch (variant) {
      case 'success':
        return {
          textColor: theme.colors.success,
          backgroundColor: theme.mode === 'dark' ? 'rgba(74, 222, 128, 0.18)' : 'rgba(21, 128, 61, 0.12)',
        };
      case 'error':
        return {
          textColor: theme.colors.danger,
          backgroundColor: theme.mode === 'dark' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(185, 28, 28, 0.12)',
        };
      default:
        return {
          textColor: theme.colors.info,
          backgroundColor: theme.mode === 'dark' ? 'rgba(96, 165, 250, 0.18)' : 'rgba(29, 78, 216, 0.12)',
        };
    }
  }, [theme, variant]);

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

const useStyles = makeStyles((theme) => ({
  container: {
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
  },
  text: {
    ...theme.typography.captionStrong,
    textAlign: 'center',
  },
}));
