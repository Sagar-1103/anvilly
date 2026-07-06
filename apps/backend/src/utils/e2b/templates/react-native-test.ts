import "dotenv/config";
import { Sandbox } from "e2b";

async function waitForPattern(
    sandbox: Sandbox,
    logFile: string,
    pattern: RegExp,
    maxAttempts = 30,
    delayMs = 2000
): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        const result = await sandbox.commands.run(`cat ${logFile} 2>/dev/null || true`);
        const match = result.stdout.match(pattern);
        if (match) return match[0];
        await new Promise((r) => setTimeout(r, delayMs));
    }
    throw new Error(`Timed out waiting for pattern in ${logFile}`);
}

const main = async () => {
    const sandbox = await Sandbox.create("node-react-native-expo", {
        timeoutMs: 10 * 60 * 1000, 
    });
    console.log("Sandbox ID:", sandbox.sandboxId);

    // using cloudflare to create a tunnel
    await sandbox.commands.run(
        "cloudflared tunnel --url http://localhost:443 > /home/user/.cloudflared.log 2>&1 &",
        { background: true }
    );

    // find the tunnel url from the cloudflare logs
    const tunnelUrl = await waitForPattern(
        sandbox,
        "/home/user/.cloudflared.log",
        /https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i
    );
    const tunnelHost = tunnelUrl.replace("https://", "");
    console.log("Tunnel URL:", tunnelUrl);

    await sandbox.commands.run(
        `EXPO_PACKAGER_PROXY_URL=${tunnelUrl} npx expo start --port 443 > /home/user/app/.expo.log 2>&1 &`,
        { cwd: "/home/user/app", background: true }
    );

    let ready = false;
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch(`${tunnelUrl}/status`);
            if (res.status === 200) {
                ready = true;
                break;
            }
        } catch {}
        await new Promise((r) => setTimeout(r, 2000));
    }

    if (!ready) {
        const log = await sandbox.commands.run("cat /home/user/app/.expo.log 2>/dev/null || true");
        console.log("Expo log:", log.stdout);
        throw new Error("Metro never became ready through the tunnel");
    }

    console.log("\n✅ Ready! Open this in Expo Go:");
    console.log(`exps://${tunnelHost}`);
    console.log("\nOr paste this directly (also works):");
    console.log(tunnelUrl);

};

main().catch(console.error);