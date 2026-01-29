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
    // Only trigger on actual navigation (path change)
    if (previousPathRef.current !== pathname) {
      // Delay showing progress bar by 150ms (per PERCEIVED_PERFORMANCE.md)
      timeoutRef.current = setTimeout(() => {
        NProgress.start();
      }, 150);

      previousPathRef.current = pathname;
    }

    // Complete the progress bar
    NProgress.done();

    // Clear the timeout if navigation completes before 150ms
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, searchParams]);

  return null;
}
