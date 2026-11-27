import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../../components/ui/button';
import { TextInput } from '../../components/ui/text-input';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';
import {
  Colors,
  HeaderHorizonGradient,
  Radius,
  Spacing,
  Typography,
} from '../../constants/theme';

const AUTH_HORIZON_LOCATIONS = [0, 0.16, 0.32, 0.48, 0.64, 1] as const;

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, error, clearError } = useAuthStore();

  const isLogin = mode === 'login';
  const displayError = validationError || error;

  const switchMode = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    setValidationError(null);
    clearError();
    setConfirmPassword('');
    setMode(isLogin ? 'signup' : 'login');
  };

  const handleSubmit = async () => {
    setValidationError(null);
    if (!email.trim() || !password) {
      setValidationError('Enter your email and password.');
      return;
    }

    if (!isLogin) {
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    if (isLogin) {
      await login(email.trim(), password);
    } else {
      await register(email.trim(), password);
    }
    setIsSubmitting(false);
  };

  const canSubmit = isLogin
    ? Boolean(email.trim() && password)
    : Boolean(email.trim() && password && confirmPassword);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={HeaderHorizonGradient}
        locations={AUTH_HORIZON_LOCATIONS}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Centered Squarish Black Logo + Animated Title */}
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <Image
                  source={require('../../../assets/images/anvilly-mark.png')}
                  style={styles.logoMark}
                />
              </View>
              <Animated.Text
                key={mode}
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(120)}
                style={styles.title}
              >
                {isLogin ? 'Welcome back' : 'Create account'}
              </Animated.Text>
            </View>

            {/* Unified Elevated Auth Card */}
            <Animated.View
              layout={LinearTransition.duration(220)}
              style={styles.card}
            >
              {displayError ? (
                <Animated.View
                  entering={FadeIn.duration(160)}
                  exiting={FadeOut.duration(120)}
                  style={styles.errorBox}
                >
                  <Text style={styles.errorBoxText}>{displayError}</Text>
                </Animated.View>
              ) : null}

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
                leftIcon={
                  <Mail size={16} color={Colors.dark.textMuted} strokeWidth={1.8} />
                }
              />

              <TextInput
                label="Password"
                placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                value={password}
                onChangeText={(text) => {
                  if (displayError) {
                    setValidationError(null);
                    clearError();
                  }
                  setPassword(text);
                }}
                secureTextEntry
                leftIcon={
                  <Lock size={16} color={Colors.dark.textMuted} strokeWidth={1.8} />
                }
              />

              {!isLogin && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(140)}
                >
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
                    leftIcon={
                      <Lock
                        size={16}
                        color={Colors.dark.textMuted}
                        strokeWidth={1.8}
                      />
                    }
                  />
                </Animated.View>
              )}

              <Button
                title={isLogin ? 'Sign in' : 'Create account'}
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={!canSubmit}
                style={{ marginTop: Spacing.xs }}
              />

              <SocialAuthButtons />
            </Animated.View>

            {/* Dynamic Mode Switch Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>
                {isLogin ? 'New to Anvilly? ' : 'Already have an account? '}
              </Text>
              <Pressable onPress={switchMode} hitSlop={8}>
                <Text style={styles.footerLink}>
                  {isLogin ? 'Create account' : 'Sign in'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  logoMark: {
    width: 25,
    height: 27,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  card: {
    backgroundColor: '#18181D',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  errorBox: {
    backgroundColor: Colors.dark.dangerBg,
    borderWidth: 1,
    borderColor: Colors.dark.dangerBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorBoxText: {
    ...Typography.caption,
    color: Colors.dark.danger,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  footerLabel: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  footerLink: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
});
