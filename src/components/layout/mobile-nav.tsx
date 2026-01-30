"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigation, secondaryNavigation } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

interface NavLinkItemProps {
  item: { name: string; href: string };
  index: number;
  delayOffset: number;
  pathname: string;
  closeMenu: () => void;
}

function NavLinkItem({ item, index, delayOffset, pathname, closeMenu }: NavLinkItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + (delayOffset + index) * 0.05 }}
    >
      <Link
        href={item.href}
        onClick={closeMenu}
        className={cn(
          "block rounded px-4 py-3 text-lg font-semibold uppercase tracking-wide transition-colors",
          pathname === item.href
            ? "bg-white text-brand-red"
            : "text-white hover:bg-white/10"
        )}
      >
        {item.name}
      </Link>
    </motion.div>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Focus trapping and keyboard accessibility
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    const focusableSelector =
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(
      panel.querySelectorAll(focusableSelector)
    ) as HTMLElement[];

    if (focusableElements.length === 0) {
      // If no focusable elements, focus the panel itself
      panel.tabIndex = -1;
      panel.focus();
    } else {
      // Focus the first focusable element
      focusableElements[0]?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      // Handle Tab key for focus trapping
      if (event.key === "Tab") {
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (event.shiftKey) {
          // Shift+Tab: moving backwards
          if (activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: moving forwards
          if (activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="relative z-50 text-white hover:bg-white/10"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={closeMenu}
            />

            {/* Menu panel */}
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed right-0 top-0 z-40 h-full w-[280px] bg-brand-red p-6 pt-20 shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <nav className="flex flex-col gap-2">
                {navigation.map((item, index) => (
                  <NavLinkItem
                    key={item.name}
                    item={item}
                    index={index}
                    delayOffset={0}
                    pathname={pathname}
                    closeMenu={closeMenu}
                  />
                ))}

                {secondaryNavigation.map((item, index) => (
                  <NavLinkItem
                    key={item.name}
                    item={item}
                    index={index}
                    delayOffset={navigation.length}
                    pathname={pathname}
                    closeMenu={closeMenu}
                  />
                ))}

                {/* Theme toggle */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay:
                      0.1 +
                      (navigation.length + secondaryNavigation.length) * 0.05,
                  }}
                  className="mt-4 flex items-center justify-between rounded px-4 py-3"
                >
                  <span className="text-white/80">Theme</span>
                  <ThemeToggle variant="header" />
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
