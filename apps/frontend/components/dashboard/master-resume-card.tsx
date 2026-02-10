import { ShieldCheck, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MasterResumeCard() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Master Resume Source</h3>
      </div>

      <Card className="group border p-5 transition-all hover:border-primary/50">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold">Master_Profile_v4</h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-600/20 bg-transparent text-xs font-medium text-emerald-600 dark:border-emerald-500/20 dark:text-emerald-400"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Excellent Strength
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Last updated 2 days ago
                </span>
              </div>
            </div>
          </div>

          <Button variant="outline" className="gap-2">
            <FileEdit className="size-4" />
            Edit Source
          </Button>
        </div>
      </Card>
    </section>
  );
}