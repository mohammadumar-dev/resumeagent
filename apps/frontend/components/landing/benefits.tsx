"use client";

import {
  ShieldCheck,
  Braces,
  FileEdit,
  Coins,
  Code2,
  Lock,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

const benefits = [
  {
    icon: ShieldCheck,
    title: "ATS-Friendly by Design",
    description:
      "Templates are tested against standard parsing algorithms (Greenhouse, Lever).",
  },
  {
    icon: Braces,
    title: "Structured Output",
    description:
      "We don't guess formatting. We inject clean data into .docx containers.",
  },
  {
    icon: FileEdit,
    title: "Editable Templates",
    description:
      "You get a real Word document, not a PDF, so you can make final tweaks.",
  },
  {
    icon: Coins,
    title: "Cost-Efficient",
    description:
      "Optimized prompt engineering minimizes token usage while maximizing quality.",
  },
  {
    icon: Code2,
    title: "Open Source Friendly",
    description:
      "Built with standard stacks (Java/Spring) that you can audit and extend.",
  },
  {
    icon: Lock,
    title: "Privacy-Aware",
    description:
      "Your data is processed ephemerally. No long-term storage of sensitive resumes.",
  },
];

export function BenefitsSection() {
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
    <section className="relative w-full overflow-hidden border-b bg-background py-24">
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
          className="mx-auto flex max-w-6xl flex-col"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          suppressHydrationWarning
        >
          {/* Header */}
          <motion.div variants={fadeUp} suppressHydrationWarning className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Built for Engineers
            </h2>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  suppressHydrationWarning
                  transition={{ delay: index * 0.06 }}
                  className="
                    group
                    relative
                    rounded-xl
                    border
                    bg-background/60
                    p-6
                    backdrop-blur-xl
                    transition-all
                    hover:-translate-y-1
                    hover:border-primary/30
                    hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]
                  "
                >
                  {/* subtle glass highlight */}
                  <div
                    aria-hidden
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      rounded-xl
                      bg-gradient-to-br
                      from-white/10
                      via-transparent
                      to-transparent
                      opacity-0
                      transition-opacity
                      group-hover:opacity-100
                    "
                  />

                  {/* Icon */}
                  <div className="relative mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>

                  {/* Text */}
                  <h3 className="mb-2 font-bold">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}