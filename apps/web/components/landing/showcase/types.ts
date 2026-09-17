export interface BackendProject {
  id: string;
  title: string | null;
  prompt: string;
  sandboxId: string;
  template?: string;
  tunnelUrl?: string | null;
  previewImage?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const SHOWCASE_TABS = ["All Projects", "Web Apps", "Mobile Apps"] as const;
export type ShowcaseTabType = (typeof SHOWCASE_TABS)[number];
