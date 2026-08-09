import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CursorAura } from "@/components/cursor-aura";
import { TapFeedback } from "@/components/tap-feedback";
import { bootcampFacts, siteConfig } from "@/lib/content";
import "@fontsource-variable/dm-sans/index.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

const socialDescription = `Applications are now open for the PYS Bootcamp, ${bootcampFacts.dates} in ${bootcampFacts.city} (deadline ${bootcampFacts.deadline}). Step into the room where ideas become resolutions.`;

export const metadata: Metadata = {
  metadataBase: new URL("https://pysmun.com"),
  title: {
    default: `${siteConfig.name} | ${siteConfig.fullName}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: "A youth diplomacy platform developing future leaders through Model United Nations, public speaking and international affairs.",
  alternates: { canonical: "./" },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${siteConfig.fullName} | ${siteConfig.tagline}`,
    description: socialDescription,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Pakistan Youth Summit Model United Nations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.fullName} | ${siteConfig.tagline}`,
    description: socialDescription,
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#071426",
  colorScheme: "dark light",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.fullName,
  alternateName: siteConfig.name,
  url: "https://pysmun.com",
  logo: "https://pysmun.com/icon.png",
  email: siteConfig.email,
  sameAs: ["https://www.instagram.com/pys.mun/"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <CursorAura />
        <TapFeedback />
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
