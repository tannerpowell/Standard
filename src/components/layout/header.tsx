"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navigation, secondaryNavigation } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const pathname = usePathname();

  // Match original: Oswald, 15px, weight 600, letter-spacing 0.1em, uppercase
  const navLinkStyles = cn(
    "font-[family-name:var(--font-oswald)] text-[15px] font-semibold tracking-[0.1em] uppercase text-white transition-colors duration-[170ms] hover:text-white/40"
  );

  return (
    <header className="relative z-50">
      <div
        className="bg-[#d51f26]"
      >
        {/* Header-inner: 3-column grid like standardtx.com */}
        <div className="mx-auto max-w-[2000px] px-[75px] py-[25px] max-lg:px-[31px] max-lg:py-[15px]">
          {/* Desktop: 3-column grid — left nav | center logo | right nav */}
          <div className="hidden items-center lg:grid lg:grid-cols-[1fr_auto_1fr]">
            {/* Left navigation */}
            <nav className="flex items-center gap-[1.3em]">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    navLinkStyles,
                    pathname === item.href && "text-white"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Center Logo — in flow, drives container height */}
            <Link href="/" className="flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="Standard Safety & Supply"
                width={220}
                height={110}
                className="h-auto w-[220px]"
                priority
              />
            </Link>

            {/* Right side navigation + theme toggle */}
            <div className="flex items-center justify-end gap-[1.3em]">
              {secondaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      navLinkStyles,
                      pathname === item.href && "text-white"
                    )}
                  >
                    {item.name}
                  </Link>
              ))}
              <ThemeToggle variant="header" />
            </div>
          </div>

          {/* Mobile: logo left, controls right */}
          <div className="flex w-full items-center justify-between lg:hidden">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Standard Safety & Supply"
                width={160}
                height={80}
                className="h-auto w-[140px]"
                priority
              />
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle variant="header" />
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
