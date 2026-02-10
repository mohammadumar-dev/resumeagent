import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t bg-card py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
        <p className="text-sm text-muted-foreground">
          © 2024 ResumeAgent Inc. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link
            href="/help"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Help Center
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}