"use client";

import Link from "next/link";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { navigation, secondaryNavigation } from "@/data/navigation";

const allLinks = [...navigation, ...secondaryNavigation].filter(
  (item) => item.href !== "/"
);

function GlitchText() {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set({ opacity: 1, x: 0, y: 0 });
      return;
    }

    let mounted = true;
    let timeout: ReturnType<typeof setTimeout>;

    const flicker = async () => {
      if (!mounted) return;
      // Random glitch burst
      const glitches = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < glitches; i++) {
        if (!mounted) return;
        await controls.start({
          opacity: 0.15 + Math.random() * 0.3,
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 3,
          transition: { duration: 0.05 },
        });
      }
      if (!mounted) return;
      // Settle back
      await controls.start({
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.1 },
      });
      if (!mounted) return;
      // Wait 2-5s before next flicker
      timeout = setTimeout(flicker, 2000 + Math.random() * 3000);
    };

    timeout = setTimeout(flicker, 1500);
    return () => {
      mounted = false;
      clearTimeout(timeout);
      controls.stop();
    };
  }, [controls, prefersReducedMotion]);

  return (
    <motion.span
      animate={controls}
      className="inline-block"
      style={{ willChange: "transform, opacity" }}
    >
      404
    </motion.span>
  );
}

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-[#0c1220] px-6 text-center">
      {/* Glitching 404 */}
      <h1
        className="mb-4 text-[clamp(8rem,25vw,16rem)] font-bold leading-none text-brand-red"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <GlitchText />
      </h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-12 font-[family-name:var(--font-oswald)] text-lg tracking-wide text-white/60"
      >
        This well came up dry.
      </motion.p>

      {/* Navigation links */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/"
          className="rounded-md bg-brand-red px-5 py-2.5 font-[family-name:var(--font-oswald)] text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-brand-red-dark"
        >
          Go Home
        </Link>
        {allLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-white/20 px-5 py-2.5 font-[family-name:var(--font-oswald)] text-sm font-medium uppercase tracking-wider text-white/80 transition-colors hover:border-white/50 hover:text-white"
          >
            {item.name}
          </Link>
        ))}
      </motion.nav>
    </div>
  );
}
