"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  speed: 400,
  trickleSpeed: 200,
});

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    // Check if pathname has changed (navigation completed)
    if (previousPathRef.current !== pathname) {
      // Navigation completed - finish progress bar immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      NProgress.done();
      previousPathRef.current = pathname;
    }

    // Cleanup function runs when navigation starts (before pathname updates)
    return () => {
      // Clear any pending timeout from previous navigation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule progress bar start with 150ms delay
      // This gives fast navigations time to complete without showing loading state
      timeoutRef.current = setTimeout(() => {
        NProgress.start();
        timeoutRef.current = null;
      }, 150);
    };
  }, [pathname, searchParams]);

  return null;
}
