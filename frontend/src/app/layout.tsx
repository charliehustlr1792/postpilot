import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import './globals.css'

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postpilot.app'

export const metadata: Metadata = {
  title: {
    default: "PostPilot - AI-Powered Social Media Scheduler",
    template: "%s | PostPilot",
  },
  description:
    "Schedule, publish, and analyze content across Twitter, Instagram, LinkedIn, Facebook, TikTok, Pinterest, and Reddit - all from one AI-powered dashboard. Save 4+ hours a week.",
  keywords: [
    "social media scheduler",
    "social media management",
    "AI content tool",
    "schedule posts",
    "multi-platform posting",
    "Buffer alternative",
    "Hootsuite alternative",
    "content calendar",
    "social media automation",
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "PostPilot - AI-Powered Social Media Scheduler",
    description:
      "One post. Seven platforms. Automatically formatted. Save 4+ hours a week with PostPilot.",
    url: siteUrl,
    siteName: "PostPilot",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostPilot - AI-Powered Social Media Scheduler",
    description:
      "One post. Seven platforms. Automatically formatted. Save 4+ hours a week with PostPilot.",
    creator: "@postpilotapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/assets/favicon.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className={inter.className}>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{ style: { fontFamily: 'inherit' } }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
