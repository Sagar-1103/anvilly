import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { ActivityIndicator, View, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/auth-store';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isAuthenticated, isLoading, hasCompletedOnboarding, hydrate } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    hydrate().then(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;

    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inAuthGroup = segments[0] === '(auth)';

    if (!hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace('/(onboarding)' as any);
    } else if (hasCompletedOnboarding && inOnboardingGroup) {
      if (isAuthenticated) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    } else if (hasCompletedOnboarding && !isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (hasCompletedOnboarding && isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, segments]);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={styles.splashLogo}
        />
        <ActivityIndicator
          size="small"
          color={Colors.light.primary}
          style={styles.splashSpinner}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.light.background },
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  splashSpinner: {
    marginTop: 8,
  },
});
