import type { FileTreeNode } from "./types";

/**
 * Detect the Monaco Editor language from a file path extension.
 */
export function getLanguageFromPath(filePath: string): string {
  const fileName = filePath.split("/").pop() || "";
  const ext = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() || "" : "";

  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    mts: "typescript",
    cts: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    json: "json",
    css: "css",
    scss: "scss",
    less: "less",
    html: "html",
    htm: "html",
    md: "markdown",
    mdx: "markdown",
    yaml: "yaml",
    yml: "yaml",
    toml: "ini",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    py: "python",
    prisma: "graphql",
    sql: "sql",
    graphql: "graphql",
    gql: "graphql",
    svg: "xml",
    xml: "xml",
    env: "plaintext",
    txt: "plaintext",
    log: "plaintext",
    lock: "json",
  };

  // Handle dotfiles like .gitignore, .eslintrc, .env.local
  if (fileName.startsWith(".") && !ext) {
    return "plaintext";
  }

  return languageMap[ext] || "plaintext";
}

/**
 * Build a tree structure from a flat list of file paths.
 * Paths are relative (e.g., "app/page.tsx", "components/ui/button.tsx").
 */
export function buildTreeFromPaths(paths: string[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const filePath of paths) {
    const parts = filePath.split("/");
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      let existing = currentLevel.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          isDirectory: !isLast,
          children: isLast ? undefined : [],
        };
        currentLevel.push(existing);
      } else if (!isLast && !existing.children) {
        existing.children = [];
        existing.isDirectory = true;
      }

      if (!isLast) {
        currentLevel = existing.children!;
      }
    }
  }

  // Sort: directories first, then alphabetically
  const sortTree = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sortTree(node.children);
    }
  };
  sortTree(root);

  return root;
}
