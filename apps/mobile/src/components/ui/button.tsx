import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Typography, Spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress();
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        isPrimary && (isDisabled ? styles.primaryDisabled : styles.primary),
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        isDanger && styles.danger,
        pressed && !isDisabled && styles.pressed,
        !isPrimary && isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? Colors.dark.primaryText : Colors.dark.text}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textBase,
              isPrimary && (isDisabled ? styles.textPrimaryDisabled : styles.textPrimary),
              isSecondary && styles.textSecondary,
              isGhost && styles.textGhost,
              isDanger && styles.textDanger,
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              icon ? { marginLeft: Spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  lg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  primary: {
    backgroundColor: Colors.dark.primary,
  },
  primaryDisabled: {
    backgroundColor: '#202026',
    borderWidth: 1,
    borderColor: '#2A2A32',
  },
  secondary: {
    backgroundColor: Colors.dark.secondaryButton,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.dark.dangerBg,
    borderWidth: 1,
    borderColor: Colors.dark.dangerBorder,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  textBase: {
    ...Typography.subtitle,
    fontSize: 15,
    fontWeight: '600',
  },
  textPrimary: {
    color: Colors.dark.primaryText,
  },
  textPrimaryDisabled: {
    color: Colors.dark.textMuted,
  },
  textSecondary: {
    color: Colors.dark.text,
  },
  textGhost: {
    color: Colors.dark.textSecondary,
  },
  textDanger: {
    color: Colors.dark.danger,
  },
  textSm: {
    fontSize: 13,
  },
  textLg: {
    fontSize: 16,
  },
});
