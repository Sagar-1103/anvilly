import type { Metadata } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const headingFont = Outfit({
  variable: "--font-heading-family",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jakartaFont = Plus_Jakarta_Sans({
  variable: "--font-jakarta-family",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
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
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/anvilly-logo.png",
  },
  openGraph: {
    title: "Anvilly - Forge Stunning Apps with AI",
    description:
      "Transform your ideas into production-ready applications.",
    type: "website",
    images: [
      {
        url: "/anvilly-logo.png",
        width: 2000,
        height: 2000,
        alt: "Anvilly Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anvilly - Forge Stunning Apps with AI",
    description:
      "Transform your ideas into production-ready applications.",
    images: ["/anvilly-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${headingFont.variable} ${jakartaFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><Providers>{children}</Providers></body>
    </html>
  );
}
