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

  const { textColor, backgroundColor, borderColor } = useMemo(() => {
    switch (variant) {
      case 'success':
        return {
          textColor: theme.colors.success,
          backgroundColor: theme.colors.successSurface,
          borderColor: theme.colors.success,
        };
      case 'error':
        return {
          textColor: theme.colors.danger,
          backgroundColor: theme.colors.dangerSurface,
          borderColor: theme.colors.danger,
        };
      default:
        return {
          textColor: theme.colors.info,
          backgroundColor: theme.colors.infoSurface,
          borderColor: theme.colors.info,
        };
    }
  }, [theme, variant]);

  const accessibilityRole = variant === 'info' ? 'text' : 'alert';

  return (
    <View
      style={[styles.container, { backgroundColor, borderColor }, style]}
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
