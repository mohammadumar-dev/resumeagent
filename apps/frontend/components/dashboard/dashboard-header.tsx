"use client";

import { FileText, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              ResumeAgent
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-md bg-muted px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/documents"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Documents
            </Link>
            <Link
              href="/dashboard/profile"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Profile
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Credits Badge */}
            <Badge
              variant="outline"
              className="hidden gap-2 border-border bg-muted px-3 py-1.5 sm:inline-flex"
            >
              <Zap className="size-4 text-primary" />
              <span className="text-xs font-semibold">12/50 Credits</span>
            </Badge>

            {/* User Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20"
            >
              <Avatar className="size-9">
                <AvatarImage
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxQi58DuVXf7gSn5I-7UdZmitYw1MEpnjndBT67lFXmgeegY7ARS1ZH3OtDR26Gkl_mj2KaWhKQcSBMckhOxPzFfK7EXo_cqzraRWQgarin0QHmgJHhYS3NuotFxkpvtOV6LrHJK1QkIRw-JDRJSVfkL3wd0VUtsao-sKC44_vINypzbKGozNxaORMawSDUNl5y0eGSksRuZWvMtM6rLTkp-E56reDzZ7yQBoqBN1o5Fsn9alcXhasnNztli8Qwb89hVfjf41pnAM"
                  alt="User profile"
                />
                <AvatarFallback>AX</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}