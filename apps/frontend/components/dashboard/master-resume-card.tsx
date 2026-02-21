import { ShieldCheck, FileEdit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MasterResumeCard() {
  return (
    <section className="relative">

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-6 -z-10 h-40 bg-primary/5 blur-3xl"
      />

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">
          Master Resume Source
        </h3>
      </div>

      <Card
        className="
          group
          relative
          overflow-hidden
          border
          bg-card/70
          backdrop-blur-xl
          shadow-sm
          transition-all duration-300
          hover:border-primary/40
          hover:shadow-lg
        "
      >
        {/* Subtle hover gradient */}
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-br from-primary/5 via-transparent to-transparent
            opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          "
        />

        <div
          className="
            relative
            flex flex-col gap-6 p-6
            sm:flex-row sm:items-center sm:justify-between
          "
        >

          {/* Left Content */}
          <div className="flex items-start gap-4">

            {/* Icon Capsule */}
            <div
              className="
                flex size-12 shrink-0 items-center justify-center
                rounded-xl
                bg-emerald-500/10
                text-emerald-500
                backdrop-blur-sm
                transition-transform duration-300
                group-hover:scale-105
              "
            >
              <ShieldCheck className="size-6" />
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-2">

              <h4 className="text-base font-semibold tracking-tight text-foreground">
                Master_Profile_v4
              </h4>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

                <Badge
                  variant="outline"
                  className="
                    gap-1
                    border-emerald-600/20
                    bg-emerald-500/5
                    text-emerald-600
                    backdrop-blur-sm
                  "
                >
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Excellent Strength
                </Badge>

                <span className="opacity-60">•</span>

                <span>Last updated 2 days ago</span>

              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center justify-start sm:justify-end">

            <Button
              asChild
              variant="outline"
              className="
                h-9 gap-2 rounded-full
                border-border/60
                bg-background/60
                backdrop-blur-sm
                transition-all duration-200
                hover:border-primary/40
                hover:bg-primary/5
              "
            >
              <Link href="/master-resume/edit">
                <FileEdit className="size-4" />
                Edit Source
              </Link>
            </Button>

          </div>

        </div>
      </Card>
    </section>
  );
}
