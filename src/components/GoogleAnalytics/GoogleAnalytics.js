"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  

  useEffect(() => {
    const url = pathname + searchParams.toString();
    if (window.gtag) {
      window.gtag("config", GOOGLE_ANALYTICS_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export default GoogleAnalytics;
