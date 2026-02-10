"use client";

import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

export function CTASection() {
  const reduceMotion = useSafeReduceMotion();

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-28 text-primary-foreground">
      {/* Ambient texture + glow (CSS-only, cheap) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-foreground/10 to-transparent opacity-60 [background-size:20px_20px]" />
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-primary-foreground/20 blur-[140px]" />
        <div className="absolute -right-24 bottom-1/3 h-80 w-80 rounded-full bg-primary-foreground/10 blur-[140px]" />
      </div>

      <div className="container mx-auto relative z-10 flex justify-center px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
          suppressHydrationWarning
          className="
            flex
            max-w-[760px]
            flex-col
            items-center
            rounded-3xl
            border
            border-primary-foreground/20
            bg-primary-foreground/10
            p-10
            text-center
            backdrop-blur-xl
            shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)]
            md:p-14
          "
        >
          {/* Subtle glass highlight */}
          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-3xl
              bg-gradient-to-br
              from-white/15
              via-transparent
              to-transparent
            "
          />

          <h2 className="relative mb-6 text-4xl font-black tracking-tight md:text-5xl">
            Build Smarter Resumes.
            <br />
            Stay in Control.
          </h2>

          <p className="relative mb-10 max-w-xl text-lg leading-relaxed text-primary-foreground/90">
            Join engineers who are bypassing ATS filters and landing more
            interviews with precise, data-driven resumes.
          </p>

          <div className="relative flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="
                shadow-lg
                transition-transform
                hover:-translate-y-0.5
              "
            >
              Start with Your Resume
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="
                border-primary-foreground/30
                bg-primary-foreground/10
                text-primary-foreground
                backdrop-blur
                transition-colors
                hover:bg-primary-foreground/20
              "
            >
              View Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
