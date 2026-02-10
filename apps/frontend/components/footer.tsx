"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

export function Footer() {
  const reduceMotion = useSafeReduceMotion();
  const CURRENT_YEAR = 2026;


  return (
    <footer className="relative w-full overflow-hidden border-t bg-card">
      {/* Ambient blur (very subtle, CSS-only) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-[-10%] bottom-0 h-48 w-48 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-0 h-48 w-48 rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto px-4 py-14 md:px-6 lg:px-8"
        suppressHydrationWarning
      >
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex max-w-xs flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                ResumeAgent
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open-source, AI-driven resume optimization built for engineers who
              value accuracy, control, and transparency.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="font-bold">Product</span>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Templates
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Pricing
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold">Resources</span>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Documentation
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                API
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Community
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold">Legal</span>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <div className="border-t bg-background/60 backdrop-blur">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground md:px-6 lg:px-8">
          &copy; {CURRENT_YEAR} ResumeAgent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}