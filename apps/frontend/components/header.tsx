"use client";

import { Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";
import { IconFileTextAi } from "@tabler/icons-react";

export function Header() {
  const reduceMotion = useSafeReduceMotion();

  return (
    <motion.header
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      suppressHydrationWarning
      className="
        sticky top-0 z-50 w-full
        border-b
        bg-background/70
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-background/60
      "
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div
            className="
              flex size-8 items-center justify-center
              rounded-lg
              bg-primary/10
              text-primary
              transition-colors
              group-hover:bg-primary/20
            "
          >
            <IconFileTextAi className="size-5" />
          </div>

          <span className="text-lg font-bold tracking-tight">
            ResumeAgent
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {[
            { href: "#pipeline", label: "How It Works" },
            { href: "#architecture", label: "Architecture" },
            { href: "#templates", label: "Templates" },
            { href: "#stack", label: "Tech Stack" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                relative
                text-sm font-medium
                text-muted-foreground
                transition-colors
                hover:text-primary
              "
            >
              {item.label}
              {/* underline on hover */}
              <span
                aria-hidden
                className="
                  absolute inset-x-0 -bottom-1 h-px
                  bg-primary
                  scale-x-0
                  transition-transform
                  group-hover:scale-x-100
                "
              />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="
      hidden gap-2 sm:flex
      bg-background/60
      backdrop-blur
      transition-colors
      hover:bg-background/80
    "
          >
            <Link href="https://github.com/mohammadumar-dev/resumeagent" target="_blank">
              <Code className="size-4" />
              GitHub
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="
      shadow-sm
      transition-transform
      hover:-translate-y-0.5
    "
          >
            <Link href="/signup">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}