import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { BlurEvent, FocusEvent, StyleProp, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { makeStyles, useAppTheme } from '@/hooks/useAppTheme';

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
    const theme = useAppTheme();
    const styles = useStyles();
    const inputId = nativeID ?? generatedId.current;
    const labelId = `${inputId}-label`;

    const [isFocused, setIsFocused] = useState(false);

    const borderColor = theme.colors.inputBorder;
    const focusBorderColor = theme.colors.tint;
    const errorColor = theme.colors.danger;
    const helperColor = theme.colors.textMuted;
    const backgroundColor = theme.colors.inputBackground;
    const fallbackPlaceholderColor = theme.colors.inputPlaceholder;

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
          style={[
            styles.input,
            {
              borderColor: resolvedBorderColor,
              backgroundColor,
            },
            style,
          ]}
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

const useStyles = makeStyles((theme) => ({
  container: {
    gap: theme.spacing.xxs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.nano,
  },
  label: {
    ...theme.typography.bodyStrong,
  },
  requiredMark: {
    ...theme.typography.bodyStrong,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.components.textField.radius,
    paddingHorizontal: theme.components.textField.paddingHorizontal,
    paddingVertical: theme.components.textField.paddingVertical,
    minHeight: theme.components.textField.minHeight,
    ...theme.typography.body,
  },
  feedbackText: {
    ...theme.typography.caption,
  },
}));
