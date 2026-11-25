import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../../components/ui/button';
import { TextInput } from '../../components/ui/text-input';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    setValidationError(null);

    if (!email.trim() || !password) {
      setValidationError('Enter your email and password.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const success = await register(email.trim(), password);
    setIsSubmitting(false);

    if (success) {
      router.replace('/(tabs)' as any);
    }
  };

  const displayError = validationError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../../assets/images/anvilly-logo.png')}
              style={styles.brandLogo}
            />
          </View>
          <Text style={styles.title}>Create your account.</Text>
          <Text style={styles.subtitle}>
            Start building with isolated cloud sandboxes and AI agents.
          </Text>
        </View>

        {displayError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{displayError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <TextInput
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              if (displayError) {
                setValidationError(null);
                clearError();
              }
              setEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(text) => {
              if (displayError) {
                setValidationError(null);
                clearError();
              }
              setPassword(text);
            }}
            secureTextEntry
          />

          <TextInput
            label="Confirm password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              if (displayError) {
                setValidationError(null);
                clearError();
              }
              setConfirmPassword(text);
            }}
            secureTextEntry
          />

          <Button
            title="Create account"
            onPress={handleRegister}
            loading={isSubmitting}
            disabled={!email.trim() || !password || !confirmPassword}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  logoFrame: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  brandLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  title: {
    ...Typography.hero,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    maxWidth: 300,
  },
  errorBox: {
    backgroundColor: Colors.light.dangerBg,
    borderWidth: 1,
    borderColor: Colors.light.dangerBorder,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorBoxText: {
    ...Typography.caption,
    color: Colors.light.danger,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  linkText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
