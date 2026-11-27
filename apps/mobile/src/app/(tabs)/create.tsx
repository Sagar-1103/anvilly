import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput as NativeTextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Globe,
  Smartphone,
  ChevronDown,
  Check,
  Sparkles,
  ArrowUp,
} from 'lucide-react-native';
import { useProjectStore } from '../../stores/project-store';
import type { Template, UserCredential } from '../../types/project';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

export default function CreateProjectScreen() {
  const { credentials, fetchCredentials, createProject } = useProjectStore();

  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState<Template>('bun_react_shadcn');
  const [selectedCred, setSelectedCred] = useState<UserCredential | null>(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  useEffect(() => {
    if (!selectedCred && credentials.length > 0) {
      setSelectedCred(credentials[0]);
    }
  }, [credentials, selectedCred]);

  const handleCreate = async () => {
    if (!prompt.trim() || creating) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    setCreating(true);
    setError(null);

    try {
      const project = await createProject({
        userPrompt: prompt.trim(),
        template,
        ...(selectedCred
          ? {
              provider: selectedCred.provider,
              credentialId: selectedCred.id,
              model: selectedCred.model || undefined,
            }
          : {}),
      });

      setPrompt('');
      router.push(`/project/${project.id}` as any);
    } catch (err: any) {
      setError(err.message || 'Could not create project.');
    } finally {
      setCreating(false);
    }
  };

  const canSend = prompt.trim().length > 0 && !creating;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Prompt</Text>
            <Text style={styles.subtitle}>
              Describe your app to spin up an isolated sandbox.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Lightbox-style Dark Command Prompt Box */}
          <View style={styles.promptBox}>
            {/* Top Context / Platform Pills */}
            <View style={styles.contextRow}>
              <Pressable
                onPress={() => setTemplate('bun_react_shadcn')}
                style={[
                  styles.contextPill,
                  template === 'bun_react_shadcn' && styles.contextPillActive,
                ]}
              >
                <Globe
                  size={12}
                  color={
                    template === 'bun_react_shadcn'
                      ? Colors.dark.text
                      : Colors.dark.textMuted
                  }
                />
                <Text
                  style={[
                    styles.contextPillText,
                    template === 'bun_react_shadcn' && {
                      color: Colors.dark.text,
                    },
                  ]}
                >
                  @ web
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTemplate('node_react_native_expo')}
                style={[
                  styles.contextPill,
                  template === 'node_react_native_expo' &&
                    styles.contextPillActive,
                ]}
              >
                <Smartphone
                  size={12}
                  color={
                    template === 'node_react_native_expo'
                      ? Colors.dark.text
                      : Colors.dark.textMuted
                  }
                />
                <Text
                  style={[
                    styles.contextPillText,
                    template === 'node_react_native_expo' && {
                      color: Colors.dark.text,
                    },
                  ]}
                >
                  @ expo
                </Text>
              </Pressable>
            </View>

            {/* Prompt Text Area */}
            <NativeTextInput
              value={prompt}
              onChangeText={(t) => {
                if (error) setError(null);
                setPrompt(t);
              }}
              placeholder="Plan, search, build anything..."
              placeholderTextColor={Colors.dark.textMuted}
              multiline
              style={styles.promptInput}
            />

            {/* Bottom Toolbar Inside Prompt Box */}
            <View style={styles.toolbar}>
              <Pressable
                onPress={() => setShowModelModal(true)}
                style={({ pressed }) => [
                  styles.agentChip,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Sparkles size={13} color={Colors.dark.textSecondary} />
                <Text style={styles.agentChipText} numberOfLines={1}>
                  {selectedCred
                    ? selectedCred.model || selectedCred.provider
                    : 'Agent'}
                </Text>
                <ChevronDown size={13} color={Colors.dark.textSecondary} />
              </Pressable>

              <Pressable
                onPress={handleCreate}
                disabled={!canSend}
                style={({ pressed }) => [
                  styles.sendBtn,
                  !canSend && styles.sendBtnDisabled,
                  pressed && canSend && { opacity: 0.85, transform: [{ scale: 0.96 }] },
                ]}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={Colors.dark.primaryText} />
                ) : (
                  <ArrowUp
                    size={18}
                    color={canSend ? Colors.dark.primaryText : Colors.dark.textMuted}
                    strokeWidth={2.2}
                  />
                )}
              </Pressable>
            </View>
          </View>

          <Text style={styles.helperNote}>
            {template === 'bun_react_shadcn'
              ? 'Target: React 19 + Bun + Tailwind CSS + shadcn/ui'
              : 'Target: React Native + Expo SDK 54 + Expo Router'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Model Selector Modal */}
      <Modal
        visible={showModelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowModelModal(false)}
          />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select API key & model</Text>
            {credentials.length === 0 ? (
              <Text style={styles.emptyCredsText}>
                No active API keys found. Configure an API key in Account Settings on the web app.
              </Text>
            ) : (
              credentials.map((cred) => {
                const isSelected = selectedCred?.id === cred.id;
                return (
                  <Pressable
                    key={cred.id}
                    onPress={() => {
                      setSelectedCred(cred);
                      setShowModelModal(false);
                    }}
                    style={[
                      styles.credRow,
                      isSelected && styles.credRowActive,
                    ]}
                  >
                    <View>
                      <Text style={styles.credProvider}>
                        {cred.provider}
                        {cred.label ? ` (${cred.label})` : ''}
                      </Text>
                      <Text style={styles.credModel}>
                        {cred.model || 'Default model'} · {cred.keyPreview}
                      </Text>
                    </View>
                    {isSelected && (
                      <Check size={16} color={Colors.dark.primary} strokeWidth={2.2} />
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.title,
    color: Colors.dark.text,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: Colors.dark.dangerBg,
    borderWidth: 1,
    borderColor: Colors.dark.dangerBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.dark.danger,
  },
  promptBox: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.borderFocus,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  contextRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  contextPillActive: {
    borderColor: Colors.dark.borderFocus,
    backgroundColor: Colors.dark.surfaceHover,
  },
  contextPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.textMuted,
  },
  promptInput: {
    ...Typography.body,
    color: Colors.dark.text,
    minHeight: 88,
    textAlignVertical: 'top',
    marginVertical: Spacing.xs,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  agentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    maxWidth: 210,
  },
  agentChipText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  helperNote: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalSheet: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: Colors.dark.border,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.lg,
    gap: Spacing.sm,
  },
  modalTitle: {
    ...Typography.subtitle,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  emptyCredsText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    paddingVertical: Spacing.md,
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  credRowActive: {
    borderColor: Colors.dark.borderFocus,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  credProvider: {
    ...Typography.subtitle,
    fontSize: 14.5,
    color: Colors.dark.text,
    textTransform: 'capitalize',
  },
  credModel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
