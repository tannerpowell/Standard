"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const toggleVariants = cva("h-8 w-8", {
  variants: {
    variant: {
      default: "hover:bg-muted",
      header: "text-white/90 hover:bg-white/10 hover:text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ThemeToggleProps {
  variant?: "default" | "header";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-hidden="true"
        tabIndex={-1}
        className={cn(toggleVariants({ variant }))}
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const actualCurrent = theme === "system" ? (resolvedTheme ?? "light") : theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(actualCurrent === "dark" ? "light" : "dark")}
      className={cn(toggleVariants({ variant }), "relative transition-colors")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
