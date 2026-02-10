"use client";

import { Network, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, Variants } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

const features = [
  {
    title: "Multi-Agent Orchestration",
    description:
      "Specialized agents for skills, experience, and summary, coordinated by a central planner.",
  },
  {
    title: "JSON-First Approach",
    description:
      "Content is generated as strict JSON to prevent formatting breaks and ensure data integrity.",
  },
  {
    title: "Template Engine",
    description:
      "AI never touches the layout. We use Apache FreeMarker to inject data into battle-tested DOCX templates.",
  },
];

export function ArchitectureSection() {
  const reduceMotion = useSafeReduceMotion();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-card py-24 text-card-foreground"
      id="architecture"
    >
      {/* Ambient blur background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-[-10%] top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="mx-auto flex max-w-6xl flex-col items-center gap-16 lg:flex-row"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          suppressHydrationWarning
        >
          {/* Left Content */}
          <motion.div variants={fadeUp} suppressHydrationWarning className="flex-1 space-y-8">
            <div>
              <Badge
                variant="outline"
                className="mb-4 gap-2 border-primary/20 bg-primary/10 text-primary backdrop-blur"
              >
                <Network className="size-3" />
                SYSTEM DESIGN
              </Badge>

              <h2 className="mb-4 text-3xl font-black tracking-tight md:text-4xl">
                Engineered for Precision, Not Just Generation
              </h2>

              <p className="leading-relaxed text-muted-foreground">
                Most AI tools treat resumes as creative writing. ResumeAgent
                treats them as structured data problems. We decouple content
                generation from formatting.
              </p>
            </div>

            <div className="space-y-5">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  suppressHydrationWarning
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="mt-1 flex size-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-4 text-primary" />
                  </div>

                  <div>
                    <h4 className="font-bold">{feature.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Code Visual */}
          <motion.div
            variants={fadeUp}
            suppressHydrationWarning
            className="w-full flex-1"
            transition={{ delay: 0.15 }}
          >
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                bg-background/60
                p-6
                font-mono
                text-sm
                shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]
                backdrop-blur-xl
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

              <div className="relative flex flex-col gap-2">
                {/* Header */}
                <div className="mb-2 flex gap-2 border-b border-border pb-2 text-xs text-muted-foreground">
                  <span className="text-primary">AgentOutput.json</span>
                </div>

                {/* Code */}
                <div className="text-green-600">
                  <span className="text-purple-600">"candidate"</span>: {"{"}
                </div>

                <div className="pl-4">
                  <span className="text-purple-600">"name"</span>:{" "}
                  <span className="text-yellow-600">"Alex Dev"</span>,
                </div>

                <div className="pl-4">
                  <span className="text-purple-600">"skills"</span>: [
                </div>

                <div className="pl-8">
                  <span className="text-yellow-600">"Java 21"</span>,{" "}
                  <span className="text-yellow-600">"Spring Boot"</span>,{" "}
                  <span className="text-yellow-600">"AWS"</span>
                </div>

                <div className="pl-4">],</div>

                <div className="pl-4">
                  <span className="text-purple-600">
                    "optimization_score"
                  </span>
                  : <span className="text-blue-600">98</span>,
                </div>

                <div className="pl-4">
                  <span className="text-purple-600">"experience"</span>: [
                </div>

                <div className="pl-8">{"{"}</div>

                <div className="pl-12">
                  <span className="text-purple-600">"role"</span>:{" "}
                  <span className="text-yellow-600">
                    "Senior Engineer"
                  </span>
                  ,
                </div>

                <div className="pl-12">
                  <span className="text-purple-600">
                    "bullet_points"
                  </span>
                  : [
                </div>

                <div className="pl-16 text-xs italic text-muted-foreground opacity-70">
                  // AI optimized for 'Distributed Systems'
                </div>

                <div className="pl-16 text-yellow-600">
                  "Architected microservices..."
                </div>

                <div className="pl-12">]</div>
                <div className="pl-8">{"}"}</div>
                <div className="pl-4">]</div>
                <div className="text-green-600">{"}"}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
