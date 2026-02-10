"use client";

import { FileText, CheckCircle2, Edit, AlertCircle, Download, MoreVertical, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  gray: "bg-muted/50 border-border text-muted-foreground",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

export function DocumentsList() {
  return (
    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
      {/* Table Header */}
      <div className="hidden grid-cols-12 gap-4 border-b px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
        <div className="col-span-5">Role &amp; Company</div>
        <div className="col-span-3">Status</div>
        <div className="col-span-2">Last Updated</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* List Items */}
      <div className="mt-2 flex flex-col gap-2">
        {documents.map((doc) => {
          const StatusIcon = doc.statusIcon;
          return (
            <div
              key={doc.id}
              className="group relative grid grid-cols-1 items-center gap-4 rounded-xl border border-transparent p-4 transition-all duration-200 hover:border-border hover:bg-card/60 md:grid-cols-12 md:px-6 md:py-5"
            >
              {/* Column 1: Info */}
              <div className="col-span-5 flex items-start gap-4">
                <div className="hidden shrink-0 items-center justify-center rounded-lg bg-[#222630] p-2.5 text-gray-300 sm:flex">
                  <FileText className="size-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="cursor-pointer text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {doc.role}{" "}
                    <span className="font-normal text-muted-foreground">
                      at
                    </span>{" "}
                    {doc.company}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {doc.type}
                    </span>
                    <span className="size-1 rounded-full bg-muted-foreground/60" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {doc.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Status */}
              <div className="col-span-3">
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    statusStyles[doc.statusColor as keyof typeof statusStyles]
                  }`}
                >
                  <StatusIcon className="size-3.5" />
                  {doc.status}
                </Badge>
              </div>

              {/* Column 3: Date */}
              <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 text-muted-foreground/60" />
                {doc.timeAgo}
              </div>

              {/* Column 4: Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden gap-2 border-border bg-[#292e38] text-xs font-semibold text-white hover:border-muted-foreground/30 hover:bg-[#343a46] lg:flex"
                >
                  <Download className="size-4" />
                  DOCX
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground hover:bg-[#292e38] hover:text-foreground"
                >
                  <MoreVertical className="size-5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between border-t pt-6 text-sm text-muted-foreground">
        <p>Showing 1-4 of 12 documents</p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="px-3 py-1 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button variant="ghost" size="sm" className="px-3 py-1">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}