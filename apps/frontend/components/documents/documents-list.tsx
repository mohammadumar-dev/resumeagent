"use client";

import {
  FileText,
  CheckCircle2,
  Edit,
  AlertCircle,
  Download,
  MoreVertical,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const documents = [
  {
    id: 1,
    role: "Senior Product Designer",
    company: "Figma",
    type: "Full-time",
    location: "Remote",
    status: "ATS Optimized",
    statusColor: "emerald",
    statusIcon: CheckCircle2,
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    role: "Product Manager",
    company: "Stripe",
    type: "Full-time",
    location: "San Francisco, CA",
    status: "v3 Draft",
    statusColor: "gray",
    statusIcon: Edit,
    timeAgo: "1 day ago",
  },
  {
    id: 3,
    role: "UX Lead",
    company: "Linear",
    type: "Contract",
    location: "Remote",
    status: "Review Needed",
    statusColor: "amber",
    statusIcon: AlertCircle,
    timeAgo: "3 days ago",
  },
  {
    id: 4,
    role: "Staff Engineer",
    company: "Vercel",
    type: "Full-time",
    location: "San Francisco, CA",
    status: "ATS Optimized",
    statusColor: "emerald",
    statusIcon: CheckCircle2,
    timeAgo: "1 week ago",
  },
];

const statusStyles = {
  emerald:
    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_-6px_rgba(16,185,129,0.4)]",
  gray:
    "bg-muted/60 border-border text-muted-foreground",
  amber:
    "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_20px_-6px_rgba(245,158,11,0.4)]",
};

export function DocumentsList() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin">

      {/* Glass Container */}
      <div className="relative rounded-2xl border bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">

        {/* Header */}
        <div className="hidden grid-cols-12 gap-4 border-b px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <div className="col-span-5">Role & Company</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2">Last Updated</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* List */}
        <div className="divide-y">
          {documents.map((doc) => {
            const StatusIcon = doc.statusIcon;

            return (
              <div
                key={doc.id}
                className="
group relative
grid grid-cols-1 gap-5
px-5 py-6
transition-all duration-300
hover:bg-muted/40

md:grid-cols-8 md:items-center
lg:grid-cols-12

"
              >
                {/* Subtle hover accent */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 rounded-none bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                </div>

                {/* Info */}
                <div className="relative flex items-start gap-4 md:col-span-4 lg:col-span-5">
                  <div className="hidden shrink-0 items-center justify-center rounded-xl bg-muted/60 p-3 text-muted-foreground backdrop-blur-sm sm:flex">
                    <FileText className="size-5" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                      {doc.role}{" "}
                      <span className="font-normal text-muted-foreground">
                        at
                      </span>{" "}
                      {doc.company}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{doc.type}</span>
                      <span className="size-1 rounded-full bg-muted-foreground/60" />
                      <span>{doc.location}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="relative md:col-span-2 lg:col-span-3 flex md:justify-start">
                  <Badge
                    variant="outline"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm",
                      statusStyles[doc.statusColor as keyof typeof statusStyles]
                    )}
                  >
                    <StatusIcon className="size-3.5" />
                    {doc.status}
                  </Badge>
                </div>

                {/* Date */}
                <div className="
relative flex items-center gap-2 text-sm text-muted-foreground
md:col-span-2 lg:col-span-2
">
                  <Clock className="size-4 text-muted-foreground/60" />
                  {doc.timeAgo}
                </div>
                {/* Actions */}
                <div className="
relative
flex items-center justify-between
pt-2
md:pt-0
md:justify-end
md:col-span-2
lg:col-span-2
">

                  {/* Mobile divider */}
                  <div className="absolute inset-x-0 -top-3 h-px bg-border md:hidden" />

                  <div
                    className="
    flex items-center gap-2 rounded-full
    border border-border/60
    bg-background/60
    px-2 py-1
    backdrop-blur-md
    transition-all duration-200
    group-hover:border-primary/20
    group-hover:shadow-sm
  "
                  >

                    {/* Mobile: Icon download */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="
        size-8 rounded-full
        text-primary
        hover:bg-primary/10
        lg:hidden
      "
                    >
                      <Download className="size-4" />
                    </Button>

                    {/* Desktop: Full button */}
                    <Button
                      size="sm"
                      className="
        hidden lg:flex
        h-8 gap-2 rounded-full
        bg-primary/90 text-primary-foreground
        hover:bg-primary
        shadow-sm
      "
                    >
                      <Download className="size-4" />
                      DOCX
                    </Button>

                    <div className="hidden lg:block h-4 w-px bg-border" />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="
        size-8 rounded-full
        text-muted-foreground
        hover:bg-muted
        hover:text-foreground
      "
                    >
                      <MoreVertical className="size-4" />
                    </Button>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-start justify-between gap-4 border-t px-6 py-6 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>Showing 1–4 of 12 documents</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            <Button variant="ghost" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
