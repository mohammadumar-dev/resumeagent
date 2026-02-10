"use client";

import { Copy, FilterX, Timer, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

const problems = [
  {
    icon: Copy,
    title: "One Resume Fits None",
    description:
      "Sending the same generic resume to every job leads to instant rejection from recruiters.",
    color: "text-red-600 bg-red-500/10",
  },
  {
    icon: FilterX,
    title: "ATS Black Holes",
    description:
      "Fancy formatting confuses parsing algorithms, meaning your resume is never actually read.",
    color: "text-orange-600 bg-orange-500/10",
  },
  {
    icon: Timer,
    title: "Manual Fatigue",
    description:
      "Customizing resumes for every single application is exhausting, boring, and error-prone.",
    color: "text-yellow-600 bg-yellow-500/10",
  },
  {
    icon: Brain,
    title: "AI Hallucinations",
    description:
      "LLMs often invent skills you don't have. We use structured data to enforce truth.",
    color: "text-purple-600 bg-purple-500/10",
  },
];

export function ProblemSection() {
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
    <section className="relative w-full overflow-hidden border-y bg-card py-20">
      {/* Ambient background blur (cheap, no JS) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-[-10%] top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="mx-auto flex max-w-6xl flex-col"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          suppressHydrationWarning
        >
          {/* Section header */}
          <motion.div variants={fadeUp} suppressHydrationWarning className="mb-12">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
              The Problem
            </h2>
            <h3 className="text-3xl font-black leading-tight tracking-tight md:text-4xl">
              Why Traditional Resume Tools Fail
            </h3>
            <p className="mt-4 max-w-[720px] text-lg text-muted-foreground">
              Manual editing is slow, and generic AI tools hallucinate.
              ResumeAgent solves the core problems of modern job applications.
            </p>
          </motion.div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map((problem, index) => {
              const Icon = problem.icon;

              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  suppressHydrationWarning
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="
                      group
                      relative
                      h-full
                      overflow-hidden
                      border
                      bg-background/60
                      backdrop-blur-xl
                      transition-all
                      hover:-translate-y-1
                      hover:border-primary/30
                      hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]
                    "
                  >
                    {/* Glass highlight */}
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

                    <CardContent className="relative flex flex-col gap-4 p-6">
                      {/* Icon */}
                      <div
                        className={`
                          flex
                          size-12
                          items-center
                          justify-center
                          rounded-xl
                          ${problem.color}
                          shadow-inner
                        `}
                      >
                        <Icon className="size-6" />
                      </div>

                      {/* Text */}
                      <div>
                        <h4 className="text-lg font-bold">
                          {problem.title}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {problem.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
