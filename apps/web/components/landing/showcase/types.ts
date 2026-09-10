export interface BackendProject {
  id: string;
  title: string | null;
  prompt: string;
  sandboxId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const SHOWCASE_TABS = ["All Projects", "My Projects", "Shared Projects"] as const;
export type ShowcaseTabType = (typeof SHOWCASE_TABS)[number];
