import { Sparkles, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function WelcomeHero() {
  return (
    <section className="flex flex-col gap-8">

      {/* Greeting */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Good morning, Alex.
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Ready to tailor your next application?
        </p>
      </div>

      {/* Glass Hero Card */}
      <Card
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          bg-card/70
          backdrop-blur-xl
          shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]
          transition-all duration-300
          hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)]
        "
      >

        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">

          {/* Content */}
          <div className="max-w-xl space-y-4">

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Create a job-specific resume
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Generate a targeted version of your resume optimized for a
              specific job description. Your Master Profile remains the
              single source of truth.
            </p>

            <div className="pt-2">
              <Button
                size="lg"
                className="
                  group
                  gap-2
                  rounded-full
                  px-6
                  shadow-sm
                  transition-all duration-200
                  hover:shadow-md
                  active:scale-[0.98]
                "
              >
                <Link href="/resume/generate" className="flex items-center gap-2">
                  <PlusCircle className="size-5 transition-transform group-hover:rotate-90 duration-300" />
                  Create New Version
                </Link>
              </Button>
            </div>
          </div>

          {/* Visual Element */}
          <div className="
            relative
            hidden
            shrink-0
            items-center
            justify-center
            sm:flex
          ">

            <div className="
              relative
              flex
              size-28
              items-center
              justify-center
              rounded-3xl
              border
              bg-background/60
              backdrop-blur-md
              shadow-sm
            ">

              {/* Soft inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-primary/5" />

              <Sparkles className="relative z-10 size-12 text-primary" />

            </div>

          </div>

        </div>
      </Card>
    </section>
  );
}