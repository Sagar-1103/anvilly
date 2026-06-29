import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Anvilly - Forge Stunning Apps with AI",
  description:
    "Anvilly transforms your words into production-ready applications. No coding required. Just describe your vision and watch it come to life. The AI-powered app builder that forges ideas into reality.",
  keywords: [
    "AI app builder",
    "no-code",
    "website builder",
    "AI development",
    "Anvilly",
  ],
  openGraph: {
    title: "Anvilly - Forge Stunning Apps with AI",
    description:
      "Transform your ideas into production-ready applications. No coding required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
