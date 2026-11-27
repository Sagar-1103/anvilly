import React, { useState } from 'react';
import {
  View,
  TextInput as NativeTextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, Radius, Typography, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function TextInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <NativeTextInput
          placeholderTextColor={Colors.dark.textMuted}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, style]}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            hitSlop={8}
            style={styles.rightButton}
          >
            {isSecure ? (
              <EyeOff size={17} color={Colors.dark.textMuted} strokeWidth={1.8} />
            ) : (
              <Eye size={17} color={Colors.dark.textSecondary} strokeWidth={1.8} />
            )}
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs + 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111114',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.md,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  leftIcon: {
    marginRight: Spacing.sm + 2,
  },
  inputWrapperFocused: {
    borderColor: Colors.dark.borderFocus,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  inputWrapperError: {
    borderColor: Colors.dark.danger,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    ...Typography.body,
    paddingVertical: 10,
  },
  rightButton: {
    paddingLeft: Spacing.sm,
    paddingVertical: 4,
  },
  rightIcon: {
    paddingLeft: Spacing.sm,
  },
  toggleText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.dark.danger,
    marginTop: Spacing.xs,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.dark.textMuted,
    marginTop: Spacing.xs,
  },
});
