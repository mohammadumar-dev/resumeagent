import { Sparkles, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function WelcomeHero() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Good morning, Alex.
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready to tailor your next application?
        </p>
      </div>

      {/* Hero Card */}
      <Card className="relative overflow-hidden border bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-sm dark:from-card dark:to-background sm:p-10">
        {/* Background Effect */}
        <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-lg">
            <h2 className="mb-2 text-2xl font-bold text-white">
              Create a job-specific resume
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-slate-300">
              Generate a targeted version of your resume optimized for a
              specific job description. We'll use your Master Profile as the
              source of truth.
            </p>
            <Button
              size="lg"
              className="gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="size-5" />
              Create New Version
            </Button>
          </div>

          <div className="hidden shrink-0 items-center justify-center rounded-full border border-border bg-card size-24 text-primary sm:flex">
            <Sparkles className="size-12" />
          </div>
        </div>
      </Card>
    </section>
  );
}