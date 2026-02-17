"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { masterResumeApi } from "@/lib/api/master-resume";
import type { ApiError } from "@/types/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CreateMasterResumeFromTextForm() {
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = resumeText.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Resume text cannot be empty.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await masterResumeApi.createFromText(resumeText);

      toast.success(
        response.message || "Master resume created from text successfully.",
      );

      setResumeText("");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError?.message || "Failed to create master resume from text.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
      <Card
        className="
        relative
        overflow-hidden
        border
        bg-card/70
        backdrop-blur-xl
        shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]
        transition-all
      "
      >
        {/* Subtle glass sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
        />

        <CardHeader className="relative space-y-3 pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Generate Your AI-Powered Master Resume
          </CardTitle>

          <CardDescription className="max-w-2xl text-sm leading-relaxed">
            Paste your complete resume below. Our AI engine will intelligently analyze,
            extract, and structure your information into a clean, validated master
            resume using advanced parsing and data modeling.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* Text Area Section */}
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="resumeText"
                className="text-sm font-medium"
              >
                Resume Content
              </Label>

              <div className="relative">
                <Textarea
                  id="resumeText"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your complete resume text here..."
                  rows={14}
                  className="
                  resize-none
                  rounded-xl
                  border-border/70
                  bg-background/60
                  backdrop-blur-md
                  focus-visible:ring-2
                  focus-visible:ring-primary/40
                  transition-all
                "
                />

                {/* Character count (non-blocking UX enhancement) */}
                <div className="pointer-events-none absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {resumeText.length} characters
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Supports plain text. Formatting will be reconstructed.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                {/* Manual Form Button */}
                <Button
                  asChild
                  variant="outline"
                  className="
        group
        h-10
        rounded-full
        px-6
        border-border/60
        bg-background/60
        backdrop-blur-md
        text-foreground
        shadow-sm
        transition-all
        duration-200
        hover:border-primary/30
        hover:bg-primary/5
        hover:shadow-md
        active:scale-[0.98]
      "
                >
                  <a href="/master-resume/create/form" className="flex items-center gap-2">
                    <span className="text-sm font-medium tracking-tight">
                      Create via Form
                    </span>
                  </a>
                </Button>

                {/* AI Generate Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !canSubmit}
                  className="
        group
        h-10
        rounded-full
        px-6
        gap-2
        bg-primary/90
        text-primary-foreground
        shadow-[0_8px_25px_-8px_rgba(0,0,0,0.35)]
        backdrop-blur-md
        transition-all
        duration-200
        hover:bg-primary
        hover:shadow-[0_12px_35px_-10px_rgba(0,0,0,0.45)]
        active:scale-[0.98]
      "
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles
                        className="
              size-4
              transition-transform
              duration-200
              group-hover:rotate-6
            "
                      />
                      Create with AI
                    </>
                  )}
                </Button>

              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
