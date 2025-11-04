import React, { forwardRef, useMemo } from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { makeStyles, useAppTheme } from '@/hooks/useAppTheme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonTone = 'default' | 'danger';

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

type PressableRef = React.ElementRef<typeof Pressable>;

export const Button = forwardRef<PressableRef, ButtonProps>(
  (
    {
      label,
      variant = 'primary',
      tone = 'default',
      loading = false,
      disabled,
      fullWidth = true,
      style,
      accessibilityRole = 'button',
      accessibilityState,
      ...rest
    },
    ref,
  ) => {
    const theme = useAppTheme();
    const styles = useStyles();
    const palette = theme.colors;
    const isDisabled = disabled ?? loading;

    const { backgroundColor, borderColor, textColor } = useMemo(() => {
      if (variant === 'ghost') {
        if (tone === 'danger') {
          return {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            textColor: palette.danger,
          };
        }

        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: palette.text,
        };
      }

      if (variant === 'secondary') {
        return {
          backgroundColor: 'transparent',
          borderColor: tone === 'danger' ? palette.danger : palette.border,
          textColor: tone === 'danger' ? palette.danger : palette.text,
        };
      }

      if (isDisabled) {
        return {
          backgroundColor: palette.border,
          borderColor: 'transparent',
          textColor: palette.textMuted,
        };
      }

      if (tone === 'danger') {
        return {
          backgroundColor: palette.danger,
          borderColor: 'transparent',
          textColor: palette.dangerOn,
        };
      }

      return {
        backgroundColor: palette.primary,
        borderColor: 'transparent',
        textColor: palette.primaryOn,
      };
    }, [isDisabled, palette, tone, variant]);

    const indicatorColor = textColor;

    return (
      <Pressable
        accessible={true}
        ref={ref}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled: isDisabled, busy: loading, ...accessibilityState }}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          fullWidth ? styles.fullWidth : undefined,
          variant === 'ghost' ? styles.ghost : undefined,
          {
            backgroundColor: variant === 'ghost' ? 'transparent' : backgroundColor,
            borderColor,
            opacity: pressed && !isDisabled ? 0.9 : 1,
          },
          style,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={indicatorColor} />
        ) : (
          <ThemedText
            style={[
              styles.label,
              { color: textColor },
              variant === 'ghost' ? styles.ghostLabel : undefined,
            ]}
          >
            {label}
          </ThemedText>
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';

const useStyles = makeStyles((theme) => ({
  base: {
    borderRadius: theme.components.button.radius,
    paddingVertical: theme.components.button.paddingVertical,
    paddingHorizontal: theme.components.button.paddingHorizontal,
    minHeight: theme.components.button.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  label: {
    ...theme.typography.button,
  },
  ghostLabel: {
    fontWeight: '500',
  },
}));
