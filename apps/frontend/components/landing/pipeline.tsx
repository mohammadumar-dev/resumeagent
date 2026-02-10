"use client";

import {
    UploadCloud,
    Search,
    Settings,
    Wand2,
    FileText,
    ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import { useSafeReduceMotion } from "@/hooks/use-safe-reduce-motion";

const steps = [
    {
        icon: UploadCloud,
        title: "Parsing",
        description: "Extracts skills & history",
        highlight: false,
    },
    {
        icon: Search,
        title: "Analysis",
        description: "Deconstructs job description",
        highlight: false,
    },
    {
        icon: Settings,
        title: "Matching Agent",
        description: "Maps skills to requirements",
        highlight: false,
    },
    {
        icon: Wand2,
        title: "Rewrite Agent",
        description: "Optimizes bullet points",
        highlight: true,
    },
    {
        icon: FileText,
        title: "DOCX Output",
        description: "Native Word document",
        highlight: false,
    },
];

export function PipelineSection() {
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
            id="pipeline"
        >
            {/* Ambient background blur */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
            >
                <div className="absolute left-[-10%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute right-[-10%] top-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-[120px]" />
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
                            The ResumeAgent Pipeline
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            From raw input to a polished, ATS-ready document
                        </p>
                    </motion.div>

                    {/* Pipeline */}
                    <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:gap-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isLast = index === steps.length - 1;

                            return (
                                <motion.div
                                    key={index}
                                    variants={fadeUp}
                                    suppressHydrationWarning
                                    transition={{ delay: index * 0.08 }}
                                    className="flex w-full flex-col items-center lg:w-auto lg:flex-row"
                                >

                                    <Card
                                        className={`
                      group
                      relative
                      z-10
                      flex-1
                      overflow-hidden
                      border
                      backdrop-blur-xl
                      transition-all
                      ${step.highlight
                                                ? "bg-primary/90 text-primary-foreground shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5)]"
                                                : "bg-background/60 hover:-translate-y-1 hover:shadow-lg"
                                            }
                    `}
                                    >
                                        {/* subtle glass highlight */}
                                        {!step.highlight && (
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
                                        )}

                                        <CardContent className="relative flex flex-col items-center gap-3 p-5 text-center">
                                            {/* Icon */}
                                            <div
                                                className={`
                          flex size-11 items-center justify-center rounded-full
                          ${step.highlight
                                                        ? "bg-primary-foreground text-primary"
                                                        : "bg-primary/10 text-primary"
                                                    }
                        `}
                                            >
                                                <Icon className="size-5" />
                                            </div>

                                            {/* Text */}
                                            <h5 className="text-sm font-bold tracking-tight">
                                                {step.title}
                                            </h5>
                                            <p
                                                className={`text-xs ${step.highlight
                                                        ? "text-primary-foreground/80"
                                                        : "text-muted-foreground"
                                                    }`}
                                            >
                                                {step.description}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Arrow */}
                                    {!isLast && (
                                        <motion.div
                                            aria-hidden
                                            className="
      flex
      items-center
      justify-center
      text-muted-foreground
      mt-3
      lg:mt-0
    "
                                            animate={{
                                                x: reduceMotion ? [0, 0, 0] : [0, 6, 0],
                                            }}
                                            transition={{
                                                duration: 1.6,
                                                ease: [0.42, 0, 0.58, 1] as any,
                                                repeat: Infinity,
                                            }}
                                            suppressHydrationWarning
                                        >
                                            {/* Desktop: arrow to the right */}
                                            <div className="hidden lg:block">
                                                <ArrowRight className="mx-2 size-7" />
                                            </div>

                                            {/* Mobile: arrow below card */}
                                            <div className="lg:hidden rotate-90">
                                                <ArrowRight className="size-7" />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}