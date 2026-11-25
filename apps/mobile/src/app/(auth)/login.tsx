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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return;
    }
    setIsSubmitting(true);
    const success = await login(email.trim(), password);
    setIsSubmitting(false);

    if (success) {
      router.replace('/(tabs)' as any);
    }
  };

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
          <Text style={styles.title}>Sign in to Anvilly.</Text>
          <Text style={styles.subtitle}>
            Manage sandboxes, stream agent builds, and preview on device.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <TextInput
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              if (error) clearError();
              setEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              if (error) clearError();
              setPassword(text);
            }}
            secureTextEntry
          />

          <Button
            title="Sign in"
            onPress={handleLogin}
            loading={isSubmitting}
            disabled={!email.trim() || !password}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Anvilly? </Text>
          <Pressable onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={styles.linkText}>Create account</Text>
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
