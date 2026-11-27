import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Image,
  TextInput as NativeTextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Search, X, Folder, Plus, Pencil, Trash2 } from 'lucide-react-native';
import { useProjectStore } from '../../stores/project-store';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectEditModal } from '../../components/projects/ProjectEditModal';
import { DeleteConfirmModal } from '../../components/projects/DeleteConfirmModal';
import { Button } from '../../components/ui/button';
import type { Project, Template } from '../../types/project';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

const FILTERS: Array<{ label: string; value: Template | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Web', value: 'bun_react_shadcn' },
  { label: 'Expo', value: 'node_react_native_expo' },
];

export default function ProjectsDashboardScreen() {
  const {
    projects,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    templateFilter,
    fetchProjects,
    updateProjectMetadata,
    deleteProject,
    setSearchQuery,
    setTemplateFilter,
  } = useProjectStore();

  const [showSearch, setShowSearch] = useState(false);
  const [actionProject, setActionProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (templateFilter !== 'all' && p.template !== templateFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const promptMatch = p.prompt.toLowerCase().includes(q);
        return titleMatch || descMatch || promptMatch;
      }
      return true;
    });
  }, [projects, templateFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../../assets/images/anvilly-logo.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>Projects.</Text>
        </View>

        <Pressable
          onPress={() => {
            if (showSearch) setSearchQuery('');
            setShowSearch(!showSearch);
          }}
          hitSlop={10}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          {showSearch ? (
            <X size={18} color={Colors.light.text} strokeWidth={1.8} />
          ) : (
            <Search size={18} color={Colors.light.text} strokeWidth={1.8} />
          )}
        </Pressable>
      </View>

      {/* Search Input */}
      {showSearch && (
        <View style={styles.searchWrap}>
          <Search size={15} color={Colors.light.textMuted} />
          <NativeTextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search projects..."
            placeholderTextColor={Colors.light.textMuted}
            autoFocus
            style={styles.searchInput}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={15} color={Colors.light.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      )}

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = templateFilter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setTemplateFilter(f.value)}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {isLoading && projects.length === 0 ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonThumb} />
              <View style={styles.skeletonBody}>
                <View style={[styles.skeletonLine, { width: '55%' }]} />
                <View style={[styles.skeletonLine, { width: '85%', height: 12 }]} />
              </View>
            </View>
          ))}
        </View>
      ) : error && projects.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Unable to load projects</Text>
          <Text style={styles.stateDesc}>{error}</Text>
          <Button
            title="Retry"
            variant="secondary"
            size="sm"
            onPress={() => fetchProjects()}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchProjects(true)}
              tintColor={Colors.light.primary}
            />
          }
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => router.push(`/project/${item.id}` as any)}
              onMenuPress={() => setActionProject(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.iconCircle}>
                <Folder size={22} color={Colors.light.primary} strokeWidth={1.75} />
              </View>
              <Text style={styles.stateTitle}>
                {searchQuery || templateFilter !== 'all'
                  ? 'No matching projects'
                  : 'No projects yet'}
              </Text>
              <Text style={styles.stateDesc}>
                {searchQuery || templateFilter !== 'all'
                  ? 'Try clearing your search or template filter.'
                  : 'Describe an app to generate your first cloud sandbox.'}
              </Text>
              {!searchQuery && templateFilter === 'all' && (
                <Button
                  title="Create project"
                  size="sm"
                  icon={<Plus size={15} color="#111114" strokeWidth={2.2} />}
                  onPress={() => router.push('/(tabs)/create' as any)}
                  style={{ marginTop: Spacing.md }}
                />
              )}
            </View>
          }
        />
      )}

      {/* Action Sheet Modal */}
      <Modal
        visible={!!actionProject}
        transparent
        animationType="fade"
        onRequestClose={() => setActionProject(null)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setActionProject(null)}
          />
          <View style={styles.actionSheet}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {actionProject?.title || 'Untitled project'}
            </Text>

            <Pressable
              onPress={() => {
                const target = actionProject;
                setActionProject(null);
                if (target) setEditingProject(target);
              }}
              style={({ pressed }) => [
                styles.sheetItem,
                pressed && { backgroundColor: Colors.light.surface },
              ]}
            >
              <Pencil size={17} color={Colors.light.text} strokeWidth={1.75} />
              <Text style={styles.sheetItemText}>Edit details</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                const target = actionProject;
                setActionProject(null);
                if (target) setDeletingProject(target);
              }}
              style={({ pressed }) => [
                styles.sheetItem,
                pressed && { backgroundColor: Colors.light.dangerBg },
              ]}
            >
              <Trash2 size={17} color={Colors.light.danger} strokeWidth={1.75} />
              <Text style={[styles.sheetItemText, { color: Colors.light.danger }]}>
                Delete project
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ProjectEditModal
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={updateProjectMetadata}
      />

      <DeleteConfirmModal
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={deleteProject}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoFrame: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  title: {
    ...Typography.title,
    color: Colors.light.text,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterPillActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  filterTextActive: {
    color: Colors.light.primaryText,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  skeletonCard: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  skeletonThumb: {
    height: 120,
    backgroundColor: Colors.light.surface,
  },
  skeletonBody: {
    padding: Spacing.md,
    gap: 8,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 4,
    backgroundColor: Colors.light.surfaceHover,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
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
  stateTitle: {
    ...Typography.subtitle,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  stateDesc: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 9, 11, 0.45)',
  },
  actionSheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.lg,
  },
  sheetTitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  sheetItemText: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.light.text,
  },
});
