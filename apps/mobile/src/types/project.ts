export type Template = 'bun_react_shadcn' | 'node_react_native_expo';

export interface Project {
  id: string;
  title: string | null;
  description: string | null;
  prompt: string;
  sandboxId: string;
  template: Template;
  tunnelUrl: string | null;
  previewImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserCredential {
  id: string;
  provider: string;
  model: string | null;
  label: string | null;
  keyPreview: string;
  isActive: boolean;
}

export interface CreateProjectPayload {
  userPrompt: string;
  template: Template;
  provider?: string;
  credentialId?: string;
  model?: string;
}
