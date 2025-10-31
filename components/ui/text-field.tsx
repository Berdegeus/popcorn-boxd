import React, { forwardRef, useMemo, useRef, useState } from 'react';
import {
  BlurEvent,
  FocusEvent,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type TextFieldProps = TextInputProps & {
  label: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  required?: boolean;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    {
      label,
      helperText,
      errorText,
      containerStyle,
      required = false,
      style,
      nativeID,
      accessibilityLabel,
      onFocus,
      onBlur,
      placeholderTextColor,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useRef(`text-field-${Math.random().toString(36).slice(2, 10)}`);
    const inputId = nativeID ?? generatedId.current;
    const labelId = `${inputId}-label`;

    const [isFocused, setIsFocused] = useState(false);

    const borderColor = useThemeColor({ light: '#D1D5DB', dark: '#374151' }, 'background');
    const focusBorderColor = useThemeColor({ light: '#0A7EA4', dark: '#1D9BF0' }, 'tint');
    const errorColor = useThemeColor({ light: '#DC2626', dark: '#FCA5A5' }, 'tint');
    const helperColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');
    const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#111827' }, 'background');
    const fallbackPlaceholderColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'icon');

    const resolvedPlaceholderColor = placeholderTextColor ?? fallbackPlaceholderColor;
    const resolvedBorderColor = useMemo(() => {
      if (errorText) {
        return errorColor;
      }

      if (isFocused) {
        return focusBorderColor;
      }

      return borderColor;
    }, [borderColor, errorColor, errorText, focusBorderColor, isFocused]);

    const handleFocus = (event: FocusEvent) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: BlurEvent) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const accessibilityState = rest.editable === false ? { disabled: true } : undefined;

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.labelRow}>
          <ThemedText nativeID={labelId} style={styles.label} type="defaultSemiBold">
            {label}
          </ThemedText>
          {required ? (
            <ThemedText
              style={[styles.requiredMark, { color: errorColor }]}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              *
            </ThemedText>
          ) : null}
        </View>

        <TextInput
          ref={ref}
          nativeID={inputId}
          style={[styles.input, { borderColor: resolvedBorderColor, backgroundColor }, style]}
          accessibilityLabel={accessibilityLabel}
          accessibilityLabelledBy={accessibilityLabel ? undefined : labelId}
          accessibilityState={accessibilityState}
          placeholderTextColor={resolvedPlaceholderColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {errorText ? (
          <ThemedText
            style={[styles.feedbackText, { color: errorColor }]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {errorText}
          </ThemedText>
        ) : helperText ? (
          <ThemedText style={[styles.feedbackText, { color: helperColor }]}>{helperText}</ThemedText>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 16,
  },
  requiredMark: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  feedbackText: {
    fontSize: 14,
  },
});
