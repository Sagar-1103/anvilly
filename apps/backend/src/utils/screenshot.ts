import puppeteer from "puppeteer";
import { prisma } from "@repo/db/client";

export async function captureProjectScreenshot(
    projectId: string,
    url: string
): Promise<string | null> {
    if (!url || !url.startsWith("http")) {
        return null;
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-first-run",
                "--no-zygote",
            ],
        });

        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
        });

        // Navigate with fallback timeouts
        await page.goto(url, {
            waitUntil: ["domcontentloaded"],
            timeout: 15000,
        });

        // Wait a short duration for fonts and Tailwind to render
        await new Promise((r) => setTimeout(r, 2000));

        const buffer = await page.screenshot({
            type: "webp",
            quality: 75,
        });

        const base64Image = `data:image/webp;base64,${Buffer.from(buffer).toString("base64")}`;

        // Save to PostgreSQL database
        await prisma.project.update({
            where: { id: projectId },
            data: { previewImage: base64Image },
        });

        return base64Image;
    } catch (error) {
        console.warn(`[Screenshot] Failed to capture screenshot for project ${projectId} at ${url}:`, error);
        return null;
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                // Ignore close errors
            }
        }
    }
}
