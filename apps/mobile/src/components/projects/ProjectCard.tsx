import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Globe, Smartphone, MoreHorizontal } from 'lucide-react-native';
import type { Project } from '../../types/project';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onMenuPress: () => void;
}

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function ProjectCard({ project, onPress, onMenuPress }: ProjectCardProps) {
  const isMobile = project.template === 'node_react_native_expo';

  const handleMenu = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onMenuPress();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleMenu}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Preview Thumbnail */}
      <View style={styles.thumbnailWrap}>
        {project.previewImage ? (
          <Image
            source={{ uri: project.previewImage }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIcon}>
              {isMobile ? (
                <Smartphone size={20} color={Colors.dark.textSecondary} strokeWidth={1.6} />
              ) : (
                <Globe size={20} color={Colors.dark.textSecondary} strokeWidth={1.6} />
              )}
            </View>
          </View>
        )}

        <View style={styles.templatePill}>
          {isMobile ? (
            <Smartphone size={11} color={Colors.dark.text} strokeWidth={2} />
          ) : (
            <Globe size={11} color={Colors.dark.text} strokeWidth={2} />
          )}
          <Text style={styles.templateText}>{isMobile ? 'Expo' : 'Web'}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {project.title || 'Untitled project'}
          </Text>
          <Pressable
            onPress={handleMenu}
            hitSlop={10}
            style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.5 }]}
          >
            <MoreHorizontal size={16} color={Colors.light.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {project.description || project.prompt}
        </Text>

        <Text style={styles.timestamp}>
          {formatRelativeTime(project.updatedAt || project.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  cardPressed: {
    backgroundColor: Colors.light.surface,
    transform: [{ scale: 0.992 }],
  },
  thumbnailWrap: {
    height: 136,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surfaceElevated,
  },
  placeholderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templatePill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17, 17, 20, 0.85)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  templateText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  body: {
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.subtitle,
    fontSize: 15.5,
    color: Colors.light.text,
    flex: 1,
  },
  menuBtn: {
    padding: 4,
  },
  description: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11.5,
    color: Colors.light.textMuted,
    marginTop: 10,
    fontWeight: '500',
  },
});
