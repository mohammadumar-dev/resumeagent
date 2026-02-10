"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

export function HeroSection() {
  const reduceMotion = useSafeReduceMotion();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const stagger: Variants = {
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  return (
    <section className="relative isolate w-full overflow-hidden">
      {/* Ambient background blobs (CSS only = cheap) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-blue-400/20 blur-[120px]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-20 md:px-6 lg:flex-row lg:items-center lg:py-28">
        {/* Left content */}
        <motion.div
          className="flex flex-1 flex-col gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h1
            variants={fadeUp}
            suppressHydrationWarning
            className="text-balance text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl"
          >
            Generate{" "}
            <span className="relative inline-block text-primary">
              Job-Specific
              <span className="absolute inset-x-0 -bottom-1 h-2 bg-primary/20 blur-md" />
            </span>
            ,<br />
            ATS-Optimized Resumes
          </motion.h1>

          <motion.p
            variants={fadeUp}
            suppressHydrationWarning
            className="max-w-[560px] text-lg leading-relaxed text-muted-foreground"
          >
            ResumeAgent analyzes your resume and the job description to generate
            accurate, ATS-safe, fully editable resumes using structured AI
            agents — no fabrication, no guesswork.
          </motion.p>

          <motion.div
            variants={fadeUp}
            suppressHydrationWarning
            className="flex flex-wrap gap-3 pt-2"
          >
            <Button
              size="lg"
              className="relative overflow-hidden shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
            >
              <span className="relative z-10">Generate Resume</span>
              <span className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity hover:opacity-100" />
            </Button>

            <Button size="lg" variant="outline" className="backdrop-blur-sm">
              View Architecture
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            suppressHydrationWarning
            className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 backdrop-blur">
              <CheckCircle2 className="size-4 text-green-600" />
              No hallucinated skills
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 backdrop-blur">
              <CheckCircle2 className="size-4 text-green-600" />
              Native .docx output
            </span>
          </motion.div>
        </motion.div>

        {/* Right visual */}
        <motion.div
          className="flex flex-1 justify-center lg:justify-end"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          suppressHydrationWarning
        >
          <div className="relative w-full max-w-[520px]">
            {/* Glass container */}
            <div className="relative overflow-hidden rounded-2xl border bg-background/55 p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl">

              {/* Subtle animated sheen */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/25 via-transparent to-blue-400/25"
                animate={reduceMotion ? {} : { opacity: [0.35, 0.55, 0.35] }}
                transition={{ duration: 6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as any }}
                suppressHydrationWarning
              />

              {/* Inner resume mock */}
              <div className="relative flex aspect-[4/3] flex-col gap-3 rounded-xl border bg-background/70 p-4">

                {/* Header bar */}
                <div className="h-8 w-1/3 rounded-md bg-muted/70 shadow-inner" />

                <div className="flex flex-1 gap-4">
                  {/* Raw resume */}
                  <div className="relative flex-1 space-y-2 rounded-lg border bg-muted/60 p-3 shadow-sm">
                    <div className="h-2 w-3/4 rounded bg-muted-foreground/20" />
                    <div className="h-2 w-full rounded bg-muted-foreground/20" />
                    <div className="h-2 w-5/6 rounded bg-muted-foreground/20" />

                    <span className="absolute right-2 top-2 rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      Original
                    </span>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="flex items-center justify-center text-primary"
                    animate={{
                      x: reduceMotion ? [0, 0, 0] : [0, 6, 0],
                    }}
                    transition={{
                      duration: 1.4,
                      ease: [0.42, 0, 0.58, 1] as any,
                      repeat: Infinity,
                    }}
                    suppressHydrationWarning
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </motion.div>

                  {/* Optimized resume */}
                  <div className="relative flex-1 space-y-2 rounded-lg border bg-primary/5 p-3 shadow-sm">
                    <CheckCircle2 className="absolute right-2 top-2 size-4 text-primary" />

                    {[0, 0.25, 0.5].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="h-2 rounded bg-primary/30"
                        style={{ width: ["75%", "100%", "85%"][i] }}
                        animate={{
                          opacity: reduceMotion ? [0.4, 0.4, 0.4] : [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 2.2,
                          delay,
                          repeat: Infinity,
                        }}
                        suppressHydrationWarning
                      />
                    ))}

                    <span className="absolute bottom-2 right-2 rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                      ATS Optimized
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-3xl animate-[pulse_6s_ease-in-out_infinite]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
