"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

const templates = [
  {
    name: "Classic Professional",
    description: "Best for traditional enterprise roles",
    preview: (
      <div className="flex h-full w-full items-center justify-center bg-muted/30">
        <div className="flex h-[90%] w-[80%] flex-col gap-2 bg-background p-4 opacity-80 shadow-sm">
          <div className="mb-2 h-4 w-1/3 rounded bg-foreground"></div>
          <div className="h-2 w-full rounded bg-muted-foreground/20"></div>
          <div className="h-2 w-full rounded bg-muted-foreground/20"></div>
          <div className="h-2 w-2/3 rounded bg-muted-foreground/20"></div>
          <div className="mt-4 h-2 w-1/4 rounded bg-muted-foreground/40"></div>
          <div className="h-2 w-full rounded bg-muted-foreground/20"></div>
          <div className="h-2 w-full rounded bg-muted-foreground/20"></div>
        </div>
      </div>
    ),
  },
  {
    name: "Modern Tech",
    description: "Clean, sans-serif, high readability",
    preview: (
      <div className="flex h-full w-full items-center justify-center bg-muted/30">
        <div className="flex h-[90%] w-[80%] flex-col gap-2 bg-background p-4 opacity-80 shadow-sm">
          <div className="mb-2 flex gap-4">
            <div className="size-12 rounded-full bg-muted-foreground/20"></div>
            <div className="flex-1">
              <div className="mb-1 h-4 w-1/2 rounded bg-primary"></div>
              <div className="h-2 w-1/3 rounded bg-muted-foreground/40"></div>
            </div>
          </div>
          <div className="h-2 w-full rounded bg-muted-foreground/20"></div>
          <div className="h-2 w-full rounded bg-muted-foreground/20"></div>
        </div>
      </div>
    ),
  },
  {
    name: "Skill Sidebar",
    description: "Highlights technical stack prominently",
    preview: (
      <div className="flex h-full w-full items-center justify-center bg-muted/30">
        <div className="flex h-[90%] w-[80%] bg-background opacity-80 shadow-sm">
          <div className="h-full w-1/3 border-r bg-muted/50 p-2">
            <div className="mb-2 h-2 w-full rounded bg-muted-foreground/30"></div>
            <div className="mb-2 h-2 w-2/3 rounded bg-muted-foreground/30"></div>
          </div>
          <div className="w-2/3 p-2">
            <div className="mb-2 h-4 w-2/3 rounded bg-foreground"></div>
            <div className="mb-1 h-2 w-full rounded bg-muted-foreground/20"></div>
            <div className="h-2 w-full rounded bg-muted-foreground/20"></div>
          </div>
        </div>
      </div>
    ),
  },
];

export function TemplatesSection() {
  const reduceMotion = useSafeReduceMotion();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-muted/30 py-24"
      id="templates"
    >
      {/* Ambient blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-[-10%] top-1/3 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="mx-auto flex max-w-6xl flex-col"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          suppressHydrationWarning
        >
          {/* Header */}
          <motion.div
            variants={fadeUp}
            suppressHydrationWarning
            className="mb-12 flex items-end justify-between"
          >
            <div>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Professional Templates
              </h2>
              <p className="mt-2 text-muted-foreground">
                Choose a layout that fits your seniority and industry.
              </p>
            </div>

            <Link
              href="#"
              className="hidden items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary/80 md:flex"
            >
              View all templates
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {templates.map((template, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                suppressHydrationWarning
                transition={{ delay: index * 0.08 }}
                className="group cursor-pointer"
              >
                <Card
                  className="
                    relative
                    mb-4
                    aspect-[1/1.4]
                    overflow-hidden
                    border
                    bg-background/60
                    backdrop-blur-xl
                    transition-all
                    hover:-translate-y-2
                    hover:border-primary/30
                    hover:shadow-[0_25px_60px_-25px_rgba(0,0,0,0.4)]
                  "
                >
                  {/* glass highlight */}
                  <div
                    aria-hidden
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-br
                      from-white/10
                      via-transparent
                      to-transparent
                      opacity-0
                      transition-opacity
                      group-hover:opacity-100
                    "
                  />

                  {template.preview}

                  {/* hover veil */}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                </Card>

                <h4 className="font-bold">{template.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
