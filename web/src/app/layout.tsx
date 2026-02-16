import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Finance Dashboard | Stock Analysis & Market Intelligence",
    template: "%s | Finance Dashboard",
  },
  description:
    "Comprehensive stock analysis and market intelligence dashboard. Track Indonesian stocks, global indices, commodities, and currencies with real-time technical indicators and fundamental analysis.",
  keywords: [
    "stock analysis",
    "finance dashboard",
    "Indonesian stocks",
    "IHSG",
    "technical analysis",
    "fundamental analysis",
    "market intelligence",
  ],
  authors: [{ name: "Finance Dashboard" }],
  creator: "Finance Dashboard",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Finance Dashboard",
    title: "Finance Dashboard | Stock Analysis & Market Intelligence",
    description:
      "Comprehensive stock analysis and market intelligence dashboard with technical and fundamental analysis.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance Dashboard | Stock Analysis & Market Intelligence",
    description:
      "Comprehensive stock analysis and market intelligence dashboard with technical and fundamental analysis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
