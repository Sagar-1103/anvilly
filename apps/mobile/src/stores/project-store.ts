import { create } from 'zustand';
import { request, config } from '../lib/api';
import type {
  Project,
  Template,
  UserCredential,
  CreateProjectPayload,
} from '../types/project';

interface ProjectState {
  projects: Project[];
  credentials: UserCredential[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  templateFilter: Template | 'all';

  fetchProjects: (refresh?: boolean) => Promise<void>;
  fetchCredentials: () => Promise<void>;
  createProject: (payload: CreateProjectPayload) => Promise<Project>;
  updateProjectMetadata: (
    id: string,
    title: string,
    description: string
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setTemplateFilter: (f: Template | 'all') => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  credentials: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  searchQuery: '',
  templateFilter: 'all',

  fetchProjects: async (refresh = false) => {
    set({
      ...(refresh ? { isRefreshing: true } : { isLoading: get().projects.length === 0 }),
      error: null,
    });

    try {
      const { data } = await request<{ success: boolean; projects: Project[] }>({
        endpoint: '/projects',
        baseUrl: config.backendUrl,
        method: 'GET',
      });

      set({
        projects: data.projects || [],
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Could not load projects',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  fetchCredentials: async () => {
    try {
      const { data } = await request<{
        success: boolean;
        credentials: UserCredential[];
      }>({
        endpoint: '/api/user/credentials',
        baseUrl: config.webUrl,
        method: 'GET',
      });

      if (data.success) {
        set({ credentials: (data.credentials || []).filter((c) => c.isActive) });
      }
    } catch {
      // Non-blocking: create screen handles missing credentials gracefully
    }
  },

  createProject: async (payload: CreateProjectPayload) => {
    const { data } = await request<{ success: boolean; project: Project }>({
      endpoint: '/projects',
      baseUrl: config.backendUrl,
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const newProject = data.project;
    set((state) => ({
      projects: [newProject, ...state.projects],
    }));

    return newProject;
  },

  updateProjectMetadata: async (id: string, title: string, description: string) => {
    const { data } = await request<{ success: boolean; project: Project }>({
      endpoint: `/projects/${id}`,
      baseUrl: config.backendUrl,
      method: 'PATCH',
      body: JSON.stringify({ title, description }),
    });

    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? data.project : p)),
    }));
  },

  deleteProject: async (id: string) => {
    const previous = get().projects;
    set({ projects: previous.filter((p) => p.id !== id) });

    try {
      await request({
        endpoint: `/projects/${id}`,
        baseUrl: config.backendUrl,
        method: 'DELETE',
      });
    } catch (err) {
      set({ projects: previous });
      throw err;
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTemplateFilter: (templateFilter) => set({ templateFilter }),
}));
