"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle>Create Master Resume from Text</CardTitle>
        <CardDescription>
          Paste your full resume below. Our AI will extract structured
          information automatically.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resumeText">Resume Text</Label>
            <Textarea
              id="resumeText"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your complete resume text here..."
              rows={12}
            />
          </div>

          <Button type="submit" disabled={isLoading || !canSubmit}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Create Master Resume"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
