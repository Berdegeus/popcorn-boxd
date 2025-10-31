import React, { forwardRef, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

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
    const primaryColor = useThemeColor({ light: '#0A7EA4', dark: '#1D9BF0' }, 'tint');
    const primaryTextColor = '#FFFFFF';
    const outlineColor = useThemeColor({ light: '#D1D5DB', dark: '#374151' }, 'background');
    const secondaryTextColor = useThemeColor({}, 'text');
    const dangerColor = useThemeColor({ light: '#B91C1C', dark: '#F87171' }, 'tint');
    const disabledBackground = useThemeColor({ light: '#9CA3AF', dark: '#4B5563' }, 'icon');

    const isDisabled = disabled ?? loading;

    const { backgroundColor, borderColor, textColor } = useMemo(() => {
      if (variant === 'ghost') {
        if (tone === 'danger') {
          return { backgroundColor: 'transparent', borderColor: 'transparent', textColor: dangerColor };
        }

        return { backgroundColor: 'transparent', borderColor: 'transparent', textColor: secondaryTextColor };
      }

      if (variant === 'secondary') {
        const toneColor = tone === 'danger' ? dangerColor : secondaryTextColor;
        return {
          backgroundColor: 'transparent',
          borderColor: tone === 'danger' ? dangerColor : outlineColor,
          textColor: toneColor,
        };
      }

      if (isDisabled) {
        return { backgroundColor: disabledBackground, borderColor: 'transparent', textColor: primaryTextColor };
      }

      const toneBackground = tone === 'danger' ? dangerColor : primaryColor;
      return { backgroundColor: toneBackground, borderColor: 'transparent', textColor: primaryTextColor };
    }, [dangerColor, disabledBackground, isDisabled, outlineColor, primaryColor, primaryTextColor, secondaryTextColor, tone, variant]);

    const indicatorColor = variant === 'secondary' || variant === 'ghost' ? textColor : primaryTextColor;

    return (
      <Pressable
        ref={ref}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled: isDisabled, busy: loading, ...accessibilityState }}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          fullWidth ? styles.fullWidth : undefined,
          variant === 'secondary' ? styles.secondary : undefined,
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

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  ghostLabel: {
    fontWeight: '500',
  },
});
