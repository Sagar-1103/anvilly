import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PlusSquare } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

export default function CreatePlaceholderScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>New project.</Text>
          <Text style={styles.subtitle}>
            Describe an application to scaffold in an isolated sandbox.
          </Text>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <PlusSquare size={22} color={Colors.light.primary} strokeWidth={1.75} />
          </View>
          <Text style={styles.emptyTitle}>Prompt builder</Text>
          <Text style={styles.emptyDescription}>
            Natural-language prompt generation for Web and Expo apps arrives in Phase 2.
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
  title: {
    ...Typography.title,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
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
