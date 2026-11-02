import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { preconnect, prefetchDNS } from "react-dom";
import { Anton, Manrope } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { TimeSync } from "@/components/layout/TimeSync";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "live sports",
    "sports streaming",
    "match schedule",
    "football",
    "basketball",
    "streams",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07070A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  prefetchDNS("https://static.ppvservices.st");
  preconnect("https://static.ppvservices.st");
  prefetchDNS("https://thumbs.poocloud.in");
  preconnect("https://thumbs.poocloud.in");

  return (
    <html lang="en" className={`${anton.variable} ${manrope.variable}`}>
      <body className="pb-[calc(58px+env(safe-area-inset-bottom))] lg:pb-0">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <TimeSync />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
