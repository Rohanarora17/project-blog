import React from "react";
import { Work_Sans, Spline_Sans_Mono } from "next/font/google";
import clsx from "clsx";
import Script from "next/script";
import { LIGHT_TOKENS, DARK_TOKENS } from "@/constants";
import RespectMotionPreferences from "@/components/RespectMotionPreferences";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./styles.css";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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

function RootLayout({ children }) {
  const savedTheme = cookies().get("color-theme");
  const theme = savedTheme?.value || "dark";



  return (
    <RespectMotionPreferences>
      <html
        lang="en"
        className={clsx(mainFont.variable, monoFont.variable)}
        data-color-theme={theme}
        style={theme === "light" ? LIGHT_TOKENS : DARK_TOKENS}
      >
        <head>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ANALYTICS_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </head>
        <body>
          <Header theme={theme} />
          <main>{children}</main>
          <Footer />
          <Analytics mode={"production"} />
          <GoogleAnalytics />
        </body>
      </html>
    </RespectMotionPreferences>
  );
}

export default RootLayout;
