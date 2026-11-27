import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';
import { useProjectStore } from '../../stores/project-store';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

export default function ProjectDetailShell() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = useProjectStore((s) => s.projects.find((p) => p.id === id));

  const isMobile = project?.template === 'node_react_native_expo';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <ArrowLeft size={18} color={Colors.light.text} strokeWidth={1.8} />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {project?.title || 'Project workspace'}
          </Text>
          <Text style={styles.badge}>
            {isMobile ? 'Expo Mobile' : 'Bun React Web'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {project?.prompt ? (
          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>Initial prompt</Text>
            <Text style={styles.promptText}>{project.prompt}</Text>
          </View>
        ) : null}

        <View style={styles.placeholderCard}>
          <View style={styles.iconCircle}>
            <MessageSquare size={22} color={Colors.light.primary} strokeWidth={1.75} />
          </View>
          <Text style={styles.placeholderTitle}>Agent chat & live preview</Text>
          <Text style={styles.placeholderDesc}>
            Real-time SSE agent streaming, tool cards, and interactive Q&A arrive in Phase 3.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    ...Typography.subtitle,
    color: Colors.light.text,
  },
  badge: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  promptCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  promptText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.text,
  },
  placeholderCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
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
  placeholderTitle: {
    ...Typography.subtitle,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  placeholderDesc: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
