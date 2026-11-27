import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Project } from '../../types/project';
import { Button } from '../ui/button';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

interface DeleteConfirmModalProps {
  project: Project | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteConfirmModal({
  project,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!project) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }
    setDeleting(true);
    try {
      await onConfirm(project.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      visible={!!project}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.dialog}>
          <Text style={styles.title}>Delete project?</Text>
          <Text style={styles.body}>
            “{project?.title || 'Untitled project'}” and its cloud sandbox will be permanently removed.
          </Text>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              title="Delete"
              variant="danger"
              onPress={handleConfirm}
              loading={deleting}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 9, 11, 0.45)',
  },
  dialog: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.subtitle,
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  body: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
