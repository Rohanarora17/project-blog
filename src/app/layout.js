import React from "react";
import { Work_Sans, Spline_Sans_Mono } from "next/font/google";
import clsx from "clsx";

import { LIGHT_TOKENS, DARK_TOKENS } from "@/constants";
import RespectMotionPreferences from "@/components/RespectMotionPreferences";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./styles.css";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
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
        <body>
          <Header theme={theme} />
          <main>{children}</main>
          <Footer />
          <Analytics mode={"production"} />;
        </body>
      </html>
    </RespectMotionPreferences>
  );
}

export default RootLayout;
