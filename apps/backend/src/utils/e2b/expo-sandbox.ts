import type Sandbox from "@e2b/code-interpreter";

export interface ExpoTunnelDetails {
    tunnelUrl: string;
    tunnelHost: string;
    expoUrl: string;
}

export async function waitForPattern(
    sandbox: Sandbox,
    logFile: string,
    pattern: RegExp,
    maxAttempts = 30,
    delayMs = 1500
): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        const result = await sandbox.commands.run(`cat ${logFile} 2>/dev/null || true`);
        const match = result.stdout.match(pattern);
        if (match) return match[0];
        await new Promise((r) => setTimeout(r, delayMs));
    }
    throw new Error(`Timed out waiting for pattern in ${logFile}`);
}

export async function startExpoTunnel(sandbox: Sandbox): Promise<string> {
    // Kill any stale cloudflared processes
    await sandbox.commands.run("pkill -f cloudflared || true");
    await sandbox.commands.run("rm -f /home/user/.cloudflared.log");

    // Start cloudflared tunnel
    await sandbox.commands.run(
        "cloudflared tunnel --url http://localhost:443 > /home/user/.cloudflared.log 2>&1 &",
        { background: true }
    );

    // Extract dynamic trycloudflare tunnel URL
    const tunnelUrl = await waitForPattern(
        sandbox,
        "/home/user/.cloudflared.log",
        /https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i,
        30,
        1500
    );

    return tunnelUrl;
}

export async function startExpoMetro(sandbox: Sandbox, tunnelUrl: string): Promise<void> {
    // Kill any stale metro processes
    await sandbox.commands.run("pkill -f 'expo start' || true");

    // Launch Expo Metro with the public proxy tunnel URL configured
    await sandbox.commands.run(
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
            const res = await fetch(`${tunnelUrl}/status`);
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
    
    // We don't block forever if status check takes a few seconds, but do a quick check
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
    if (currentTunnelUrl) {
        try {
            const res = await fetch(`${currentTunnelUrl}/status`);
            if (res.status === 200) {
                const tunnelHost = currentTunnelUrl.replace("https://", "");
                return {
                    tunnelUrl: currentTunnelUrl,
                    tunnelHost,
                    expoUrl: `exps://${tunnelHost}`,
                };
            }
        } catch {
            // Fallthrough to restart if tunnel unreachable
        }
    }

    return await initializeExpoSandbox(sandbox);
}
