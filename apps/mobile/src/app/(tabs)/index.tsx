import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Folder } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth-store';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

export default function ProjectsDashboardScreen() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoFrame}>
              <Image
                source={require('../../../assets/images/anvilly-logo.png')}
                style={styles.logo}
              />
            </View>
            <View>
              <Text style={styles.title}>Projects.</Text>
              <Text style={styles.greeting}>
                {user?.email || 'Workspace'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <Folder size={22} color={Colors.light.primary} strokeWidth={1.75} />
          </View>
          <Text style={styles.emptyTitle}>No projects yet.</Text>
          <Text style={styles.emptyDescription}>
            Authentication and session storage are active. Project creation and listing arrive in Phase 2.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoFrame: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  title: {
    ...Typography.title,
    color: Colors.light.text,
  },
  greeting: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.subtitle,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  emptyDescription: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
