import type { Message, AiToolCallMessage } from "./types";

export interface ToolReceipt {
    name: string;
    target?: string;
    status: string;
}

export interface HistorySummary {
    turnsCovered: number;
    summary: string;
    keyDecisions: string[];
}

export interface DialogueTurn {
    turn: number;
    userPrompt: string;
    aiResponse: string;
}

export interface CompactedStatePayload {
    version: 1;
    updatedAt: number;
    rootGoal: string;
    workspace: {
        files: string[];
        deleted?: string[];
        packages?: string[];
        buildPassing?: boolean;
        serverRunning?: boolean;
    };
    historySummary?: HistorySummary;
    recentDialogue: DialogueTurn[];
    toolReceipts?: ToolReceipt[];
}

// Guess file purpose from its path
function inferFileRole(filePath: string): string {
    const lower = filePath.toLowerCase();
    const fileName = filePath.split("/").pop() || "";

    if (fileName === "App.tsx" || fileName === "App.jsx" || fileName === "index.tsx") {
        return "Main entry / application layout";
    }
    if (fileName === "index.css" || fileName === "globals.css" || fileName === "app.css") {
        return "Tailwind global theme & styles";
    }
    if (fileName === "index.html") {
        return "HTML document root";
    }
    if (fileName === "package.json") {
        return "Project dependencies & scripts";
    }
    if (fileName.includes("bunfig") || fileName.includes("tsconfig") || fileName.includes("components.json")) {
        return "Build & environment config";
    }
    if (lower.includes("components/ui/")) {
        return "shadcn UI primitive";
    }
    if (lower.includes("components/")) {
        const componentName = fileName.replace(/\.(tsx|jsx|ts|js)$/, "");
        return `${componentName} component`;
    }
    if (lower.includes("hooks/")) {
        return "React custom hook";
    }
    if (lower.includes("lib/utils") || lower.includes("utils")) {
        return "Helper & utility functions";
    }
    if (lower.endsWith(".json")) {
        return "Configuration / mock data";
    }
    return "Source module";
}

// Render project file tree
function renderAsciiTree(files: string[]): string {
    if (files.length === 0) {
        return "/home/user/app/\n└── src/ (Initial workspace state)";
    }

    interface DirNode {
        dirs: Map<string, DirNode>;
        files: string[];
    }

    const root: DirNode = { dirs: new Map(), files: [] };

    for (const file of files) {
        const cleanPath = file.replace(/^\//, "").replace(/^home\/user\/app\//, "");
        const parts = cleanPath.split("/").filter(Boolean);
        let current = root;
        for (let i = 0; i < parts.length - 1; i++) {
            const dir = parts[i]!;
            if (!current.dirs.has(dir)) {
                current.dirs.set(dir, { dirs: new Map(), files: [] });
            }
            current = current.dirs.get(dir)!;
        }
        if (parts.length > 0) {
            current.files.push(parts[parts.length - 1]!);
        }
    }

    const lines: string[] = ["/home/user/app/"];

    function walk(node: DirNode, prefix: string, currentPath: string) {
        const dirEntries = Array.from(node.dirs.entries());
        const totalEntries = dirEntries.length + node.files.length;
        let index = 0;

        for (const [dirName, childNode] of dirEntries) {
            index++;
            const isLast = index === totalEntries;
            const branch = isLast ? "└── " : "├── ";
            lines.push(`${prefix}${branch}${dirName}/`);
            walk(childNode, prefix + (isLast ? "    " : "│   "), currentPath ? `${currentPath}/${dirName}` : dirName);
        }

        for (const fileName of node.files) {
            index++;
            const isLast = index === totalEntries;
            const branch = isLast ? "└── " : "├── ";
            const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
            const role = inferFileRole(fullPath);
            lines.push(`${prefix}${branch}${fileName.padEnd(22)} ← ${role}`);
        }
    }

    walk(root, "", "");
    return lines.join("\n");
}

// Shrink tool results into short summaries
export function evictToolResults(tools: AiToolCallMessage[]): ToolReceipt[] {
    return tools.map((tc) => {
        const name = tc.name || "";
        const args = (tc.arguments || {}) as any;
        let target = "";
        let status = "executed";

        if (name === "write_file_tool") {
            target = args.location || "";
            status = "file written";
        } else if (name === "read_file_tool") {
            target = args.location || "";
            status = "file inspected";
        } else if (name === "delete_file_tool") {
            target = args.location || "";
            status = "file deleted";
        } else if (name === "bash_tool") {
            target = args.command ? String(args.command).slice(0, 80) : "";
            const res = tc.result as any;
            status = res?.exitCode !== undefined ? `exit ${res.exitCode}` : "completed";
        } else if (name === "build_project_tool") {
            target = "build check";
            const res = tc.result as any;
            status = res?.error ? "failed" : "passed";
        } else if (name === "run_project_tool") {
            target = "dev server";
            status = "running";
        } else if (name === "qna_tool") {
            target = args.question ? String(args.question).slice(0, 80) : "";
            status = `answered: ${String(tc.result || "").slice(0, 40)}`;
        }

        return {
            name,
            ...(target ? { target } : {}),
            status,
        };
    });
}

// Summarize older conversation turns with an LLM
export async function summarizeOlderTurns(
    existingSummary: HistorySummary | undefined,
    turnsToSummarize: DialogueTurn[],
    llmProvider?: any,
    modelName?: string
): Promise<HistorySummary> {
    if (turnsToSummarize.length === 0) {
        return existingSummary || { turnsCovered: 0, summary: "", keyDecisions: [] };
    }

    if (!llmProvider) {
        const fallbackLines = turnsToSummarize.map((t) => `Turn ${t.turn}: "${t.userPrompt}" -> ${t.aiResponse.slice(0, 80)}...`);
        const newTurnsCovered = (existingSummary?.turnsCovered || 0) + turnsToSummarize.length;
        return {
            turnsCovered: newTurnsCovered,
            summary: (existingSummary?.summary ? `${existingSummary.summary}\n` : "") + fallbackLines.join("\n"),
            keyDecisions: existingSummary?.keyDecisions || [],
        };
    }

    const turnsText = turnsToSummarize
        .map((t) => `Turn ${t.turn}:\nUser: ${t.userPrompt}\nAssistant: ${t.aiResponse}`)
        .join("\n\n");

    const previousContext = existingSummary && existingSummary.summary
        ? `Existing Summary (Turns 1 to ${existingSummary.turnsCovered}):\n${existingSummary.summary}\n\nKey Decisions Established So Far:\n${existingSummary.keyDecisions.map((d) => `- ${d}`).join("\n")}`
        : "No previous summary (these are the earliest turns of the project).";

    const prompt = `You are an expert AI software architect creating a dense, structured context summary of past development turns for an AI coding agent.
Your goal is to compress older conversation history into a high-density, loss-resistant architectural brief.

${previousContext}

New Historical Turns to Fold In:
${turnsText}

Instructions:
1. "summary": Provide a concise 1-2 paragraph summary covering what the user requested, what features were built, and what code changes occurred.
2. "keyDecisions": Provide a bulleted list (array of strings) of critical architectural, styling, and framework decisions established (e.g., color tokens, hooks, components, libraries used).

Respond strictly in valid JSON with this exact schema:
{
  "summary": "dense paragraph here",
  "keyDecisions": ["decision 1", "decision 2"]
}`;

    try {
        const effectiveModel = modelName || llmProvider?.defaultModel || "deepseek-chat";
        const rawResponse = await llmProvider.generateText({
            model: effectiveModel,
            prompt,
        });

        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const newTurnsCovered = (existingSummary?.turnsCovered || 0) + turnsToSummarize.length;
            return {
                turnsCovered: newTurnsCovered,
                summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
                keyDecisions: Array.isArray(parsed.keyDecisions)
                    ? parsed.keyDecisions.map((d: any) => String(d).trim()).filter(Boolean)
                    : (existingSummary?.keyDecisions || []),
            };
        }
    } catch (e) {
        console.error("Error in summarizeOlderTurns LLM call:", e);
    }

    // Fallback summary if LLM fails
    const fallbackLines = turnsToSummarize.map((t) => `Turn ${t.turn}: "${t.userPrompt}" -> ${t.aiResponse.slice(0, 80)}...`);
    const newTurnsCovered = (existingSummary?.turnsCovered || 0) + turnsToSummarize.length;
    return {
        turnsCovered: newTurnsCovered,
        summary: (existingSummary?.summary ? `${existingSummary.summary}\n` : "") + fallbackLines.join("\n"),
        keyDecisions: existingSummary?.keyDecisions || [],
    };
}

export interface PipelineParams {
    previousState: CompactedStatePayload | null;
    turnNumber: number;
    userPrompt: string;
    aiResponseText: string;
    currentTurnTools: AiToolCallMessage[];
    llmProvider?: any;
    modelName?: string;
}

// Run compaction after each turn
export async function runCompactionPipeline(params: PipelineParams): Promise<CompactedStatePayload> {
    const { previousState, turnNumber, userPrompt, aiResponseText, currentTurnTools, llmProvider, modelName } = params;

    // 1. Simplify tool results
    const toolReceipts = evictToolResults(currentTurnTools);

    // 2. Track file and package changes
    const activeFiles = new Set<string>(previousState?.workspace?.files || []);
    const deletedFiles = new Set<string>(previousState?.workspace?.deleted || []);
    const installedPackages = new Set<string>(previousState?.workspace?.packages || []);
    let buildPassing = previousState?.workspace?.buildPassing;
    let serverRunning = previousState?.workspace?.serverRunning;

    for (const tc of currentTurnTools) {
        const name = tc.name?.toLowerCase() || "";
        const args = (tc.arguments || {}) as any;

        if (name === "write_file_tool" && args?.location) {
            const loc = String(args.location).replace("/home/user/app/", "").replace(/^\//, "");
            activeFiles.add(loc);
            deletedFiles.delete(loc);
        } else if (name === "delete_file_tool" && args?.location) {
            const loc = String(args.location).replace("/home/user/app/", "").replace(/^\//, "");
            deletedFiles.add(loc);
            activeFiles.delete(loc);
        } else if (name === "bash_tool" && args?.command) {
            const cmd = String(args.command).trim();
            const addMatch = cmd.match(
                /(?:bun\s+add|npm\s+(?:i|install)|pnpm\s+add|yarn\s+add|npx\s+expo\s+install)\s+([a-zA-Z0-9@/_\-\s]+)/
            );
            if (addMatch && addMatch[1]) {
                const pkgs = addMatch[1].split(/\s+/).filter((p) => !p.startsWith("-") && p.length > 0);
                for (const p of pkgs) installedPackages.add(p);
            }
        } else if (name === "build_project_tool") {
            const res = tc.result as any;
            if (res && !res.error && (res.exitCode === 0 || !res.stderr || res.stderr.length === 0)) {
                buildPassing = true;
            } else if (res && (res.error || res.exitCode !== 0)) {
                buildPassing = false;
            }
        } else if (name === "run_project_tool") {
            serverRunning = true;
        }
    }

    const workspace: CompactedStatePayload["workspace"] = {
        files: Array.from(activeFiles),
    };
    if (deletedFiles.size > 0) workspace.deleted = Array.from(deletedFiles);
    if (installedPackages.size > 0) workspace.packages = Array.from(installedPackages);
    if (buildPassing !== undefined) workspace.buildPassing = buildPassing;
    if (serverRunning !== undefined) workspace.serverRunning = serverRunning;

    // 3. Keep original project goal
    const rootGoal = previousState?.rootGoal || userPrompt;

    // 4. Keep last 2 turns, summarize older ones
    const existingRecent = previousState?.recentDialogue || [];
    const newTurn: DialogueTurn = {
        turn: turnNumber,
        userPrompt,
        aiResponse: aiResponseText,
    };

    const allDialogueTurns = [...existingRecent, newTurn];

    let historySummary = previousState?.historySummary;
    let recentDialogue: DialogueTurn[] = [];

    if (allDialogueTurns.length <= 2) {
        // Fits in window, no summary needed yet
        recentDialogue = allDialogueTurns;
    } else {
        // Keep last 2 turns verbatim
        recentDialogue = allDialogueTurns.slice(-2);
        // Summarize turns older than last 2
        const turnsToSummarize = allDialogueTurns.slice(0, -2);
        historySummary = await summarizeOlderTurns(previousState?.historySummary, turnsToSummarize, llmProvider, modelName);
    }

    // 5. Build final compacted state
    return {
        version: 1,
        updatedAt: Date.now(),
        rootGoal,
        workspace,
        ...(historySummary ? { historySummary } : {}),
        recentDialogue,
        ...(toolReceipts.length > 0 ? { toolReceipts } : {}),
    };
}

// Format state into prompt text for the AI
export function formatProjectStateManifest(manifest: CompactedStatePayload, template?: string): string {
    const sections: string[] = [
        "## Project Architecture & Context Blueprint",
    ];

    // 1. Project Goal
    if (manifest.rootGoal) {
        sections.push(`### 1. Root Project Intent\n${manifest.rootGoal}`);
    }

    // 2. File tree
    const files = manifest.workspace?.files || [];
    const treeDisplay = renderAsciiTree(files);
    sections.push(`### 2. Workspace Structure & Component Roles\n\`\`\`\n${treeDisplay}\n\`\`\``);

    // 3. Build & server status
    const runtimeLines: string[] = [];
    if (template) {
        runtimeLines.push(`- Template: ${template}`);
    }
    if (manifest.workspace?.packages && manifest.workspace.packages.length > 0) {
        runtimeLines.push(`- Installed Dependencies: ${manifest.workspace.packages.join(", ")}`);
    }
    if (manifest.workspace?.buildPassing !== undefined) {
        runtimeLines.push(`- Build Status: ${manifest.workspace.buildPassing ? "Passing (Clean)" : "Failed"}`);
    }
    if (manifest.workspace?.serverRunning) {
        runtimeLines.push("- Dev Server: Running on port 3000");
    }
    if (runtimeLines.length > 0) {
        sections.push(`### 3. Runtime & Build Status\n${runtimeLines.join("\n")}`);
    }

    // 4. Past turns summary
    if (manifest.historySummary && manifest.historySummary.summary) {
        const decisionLines = (manifest.historySummary.keyDecisions || []).map((d) => `- ${d}`).join("\n");
        sections.push(
            `### 4. Historical Architectural Summary (Turns 1 to ${manifest.historySummary.turnsCovered})\n${manifest.historySummary.summary}${decisionLines ? `\n\nKey Decisions Established:\n${decisionLines}` : ""}`
        );
    }

    // 5. Guidelines
    sections.push(`### 5. Critical Architecture & Styling Guidelines
- Design Consistency: Strictly respect and preserve styling conventions (color palette, border radius, animations, dark mode) established in earlier user turns. Do NOT regress or overwrite previous styling unless explicitly asked.
- File Verification: All active code resides in the sandbox filesystem at /home/user/app. Always use \`read_file_tool\` to inspect existing implementations before modifying. Do not guess component props or structures.`);

    return sections.join("\n\n");
}
