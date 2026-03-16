import React from "react";
import { Work_Sans, Spline_Sans_Mono } from "next/font/google";
import clsx from "clsx";
import Script from "next/script";
import { LIGHT_TOKENS, DARK_TOKENS, BLOG_TITLE, BLOG_DESCRIPTION } from "@/constants";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./styles.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/site-config";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const mainFont = Work_Sans({
  subsets: ["latin"],
  display: "fallback",
  weight: "variable",
  variable: "--font-family",
});
const monoFont = Spline_Sans_Mono({
  subsets: ["latin"],
  display: "fallback",
  weight: "variable",
  variable: "--font-family-mono",
});

const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

function serializeThemeTokens(selector, tokens) {
  const cssVariables = Object.entries(tokens)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");

  return `${selector} { ${cssVariables} }`;
}

const THEME_TOKEN_STYLES = `
${serializeThemeTokens('html[data-color-theme="light"]', LIGHT_TOKENS)}
${serializeThemeTokens('html[data-color-theme="dark"]', DARK_TOKENS)}
`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BLOG_TITLE,
    template: `%s • ${BLOG_TITLE}`,
  },
  description: BLOG_DESCRIPTION,
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: SITE_URL,
    siteName: BLOG_TITLE,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    creator: "@Okayrohannn",
  },
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
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(50deg 100% 94%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(256deg 20% 4%)" },
  ],
  width: "device-width",
  initialScale: 1,
};

function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={clsx(mainFont.variable, monoFont.variable)}
      data-color-theme="dark"
    >
      <head>
        <style>{THEME_TOKEN_STYLES}</style>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics mode={"production"} />
        <SpeedInsights />
        {GOOGLE_ANALYTICS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GOOGLE_ANALYTICS_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

export default RootLayout;
