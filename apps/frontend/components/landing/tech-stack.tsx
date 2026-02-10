"use client";

import {
  Coffee,
  Leaf,
  Brain,
  Terminal,
  Database,
  Square,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

const techStack = [
  { name: "Java 21", icon: Coffee, color: "text-orange-500" },
  { name: "Spring Boot", icon: Leaf, color: "text-green-600" },
  { name: "Spring AI", icon: Brain, color: "text-blue-500" },
  { name: "Next.js", icon: Terminal, color: "text-foreground" },
  { name: "PostgreSQL", icon: Database, color: "text-blue-700" },
];

const roadmapItems = [
  "Interactive Resume Editor",
  "Cover Letter Agent",
  "Resume Version Control",
  "Skill Gap Analysis",
];

export function TechStackSection() {
  const reduceMotion = useSafeReduceMotion();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  return (
    <section
      className="relative w-full overflow-hidden border-t bg-background py-24"
      id="stack"
    >
      {/* Ambient background blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-[-10%] top-1/3 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="mx-auto flex max-w-6xl flex-col gap-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          suppressHydrationWarning
        >
          {/* Tech Stack */}
          <motion.div variants={fadeUp} suppressHydrationWarning>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Powered By
            </h3>

            <div className="flex flex-wrap gap-3">
              {techStack.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    suppressHydrationWarning
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="
                        group
                        flex
                        items-center
                        gap-2
                        border-border
                        bg-background/60
                        px-4
                        py-2
                        font-medium
                        backdrop-blur
                        transition-all
                        hover:border-primary/30
                        hover:bg-background/80
                      "
                    >
                      <Icon
                        className={`size-4 ${tech.color} transition-transform group-hover:scale-110`}
                      />
                      {tech.name}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Roadmap */}
          <motion.div variants={fadeUp} suppressHydrationWarning>
            <Card
              className="
                relative
                overflow-hidden
                border
                bg-background/60
                backdrop-blur-xl
                shadow-[0_25px_60px_-25px_rgba(0,0,0,0.35)]
              "
            >
              {/* subtle glass highlight */}
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
                "
              />

              <CardContent className="relative p-8">
                <div className="flex flex-col gap-10 md:flex-row md:justify-between">
                  <div className="max-w-xs">
                    <h3 className="mb-2 text-xl font-bold">
                      Coming Soon
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      We are constantly improving our agents. Here is what's
                      next on the roadmap.
                    </p>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                    {roadmapItems.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={fadeUp}
                        suppressHydrationWarning
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <Square className="size-4 text-muted-foreground" />
                        <span className="font-medium">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
