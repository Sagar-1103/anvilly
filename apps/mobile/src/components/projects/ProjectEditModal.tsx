import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import type { Project } from '../../types/project';
import { Button } from '../ui/button';
import { TextInput } from '../ui/text-input';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

interface ProjectEditModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (id: string, title: string, description: string) => Promise<void>;
}

export function ProjectEditModal({
  project,
  onClose,
  onSave,
}: ProjectEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      setError(null);
    }
  }, [project]);

  const handleSave = async () => {
    if (!project) return;
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(project.id, title.trim(), description.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={!!project}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit project</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color={Colors.light.textSecondary} />
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            label="Title"
            placeholder="Project name"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <TextInput
            label="Description"
            placeholder="Short summary of your app"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              title="Save changes"
              onPress={handleSave}
              loading={saving}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 9, 11, 0.45)',
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.subtitle,
    fontSize: 18,
    color: Colors.light.text,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.light.danger,
    marginBottom: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
