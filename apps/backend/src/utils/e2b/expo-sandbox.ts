import type Sandbox from "@e2b/code-interpreter";

// Default timeout for individual sandbox commands (2 minutes).
const COMMAND_TIMEOUT_MS = 2 * 60 * 1000;

export interface ExpoTunnelDetails {
    tunnelUrl: string;
    tunnelHost: string;
    expoUrl: string;
}

async function safeRun(
    sandbox: Sandbox,
    cmd: string,
    opts?: { cwd?: string; background?: boolean; timeoutMs?: number }
) {
    try {
        return await sandbox.commands.run(cmd, {
            timeoutMs: COMMAND_TIMEOUT_MS,
            ...opts,
        });
    } catch (err) {
        console.warn(`[expo-sandbox] Command failed: "${cmd}"`, (err as Error).message);
        return null;
    }
}

export async function waitForPattern(
    sandbox: Sandbox,
    logFile: string,
    pattern: RegExp,
    maxAttempts = 30,
    delayMs = 1500
): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        const result = await safeRun(sandbox, `cat ${logFile} 2>/dev/null || true`);
        if (result) {
            const match = result.stdout.match(pattern);
            if (match) return match[0];
        }
        await new Promise((r) => setTimeout(r, delayMs));
    }
    throw new Error(`Timed out waiting for pattern in ${logFile}`);
}

export async function startExpoTunnel(sandbox: Sandbox): Promise<string> {
    // Kill any stale cloudflared processes (ignore errors)
    await safeRun(sandbox, "pkill -f cloudflared || true");
    await safeRun(sandbox, "rm -f /home/user/.cloudflared.log");

    // Small delay to let the sandbox stabilize after killing processes
    await new Promise((r) => setTimeout(r, 500));

    // Start cloudflared tunnel
    await safeRun(
        sandbox,
        "cloudflared tunnel --url http://localhost:443 > /home/user/.cloudflared.log 2>&1 &",
        { background: true }
    );

    // Extract dynamic trycloudflare tunnel URL
    const tunnelUrl = await waitForPattern(
        sandbox,
        "/home/user/.cloudflared.log",
        /https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i,
        40,  // increased attempts for slow sandbox resumes
        2000 // slightly longer delay between polls
    );

    return tunnelUrl;
}

export async function startExpoMetro(sandbox: Sandbox, tunnelUrl: string): Promise<void> {
    // Kill any stale metro processes (ignore errors)
    await safeRun(sandbox, "pkill -f 'expo start' || true");

    // Small delay to let old processes fully exit
    await new Promise((r) => setTimeout(r, 500));

    // Launch Expo Metro with the public proxy tunnel URL configured
    await safeRun(
        sandbox,
        `EXPO_PACKAGER_PROXY_URL=${tunnelUrl} npx expo start --port 443 > /home/user/app/.expo.log 2>&1 &`,
        { cwd: "/home/user/app", background: true }
    );
}

export async function waitForMetroReady(
    tunnelUrl: string,
    maxAttempts = 30,
    delayMs = 2000
): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${tunnelUrl}/status`, {
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.status === 200) {
                return true;
            }
        } catch {
            // Tunnel or server not yet ready
        }
        await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
}

export async function initializeExpoSandbox(sandbox: Sandbox): Promise<ExpoTunnelDetails> {
    const tunnelUrl = await startExpoTunnel(sandbox);
    const tunnelHost = tunnelUrl.replace("https://", "");
    const expoUrl = `exps://${tunnelHost}`;

    await startExpoMetro(sandbox, tunnelUrl);
    
    // Fire-and-forget readiness check — don't block the response
    waitForMetroReady(tunnelUrl, 20, 1500).catch((err) => {
        console.warn("Metro status check completed with warning:", err);
    });

    return {
        tunnelUrl,
        tunnelHost,
        expoUrl,
    };
}

export async function ensureExpoRunning(
    sandbox: Sandbox,
    currentTunnelUrl?: string | null
): Promise<ExpoTunnelDetails> {
    // First, try the existing tunnel URL if available
    if (currentTunnelUrl) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${currentTunnelUrl}/status`, {
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.status === 200) {
                const tunnelHost = currentTunnelUrl.replace("https://", "");
                return {
                    tunnelUrl: currentTunnelUrl,
                    tunnelHost,
                    expoUrl: `exps://${tunnelHost}`,
                };
            }
        } catch {
            console.log("[expo-sandbox] Old tunnel unreachable, reinitializing...");
        }
    }

    // Old tunnel is dead or no URL stored, reinitialize
    return await initializeExpoSandbox(sandbox);
}
