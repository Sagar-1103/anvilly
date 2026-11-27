import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../../components/ui/button';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings.</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.emailText}>{user?.email}</Text>
            <Text style={styles.idText}>Account ID: {user?.id?.slice(0, 8)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <Button
            title="Sign out"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
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
  title: {
    ...Typography.title,
    color: Colors.light.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.subtitle,
    color: Colors.light.primaryText,
  },
  profileInfo: {
    flex: 1,
  },
  emailText: {
    ...Typography.subtitle,
    color: Colors.light.text,
  },
  idText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  logoutButton: {
    width: '100%',
  },
});
