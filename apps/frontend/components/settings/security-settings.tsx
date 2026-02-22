"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { Loader2, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmailVerificationStatus } from "@/components/EmailVerificationStatus";

export function SecuritySettings() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);

  if (!user) return null;

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.resendVerification(user.email);
      toast.success("Verification email sent! Please check your inbox.");
    } catch {
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email verification
          </CardTitle>
          <CardDescription className="flex items-center justify-between gap-3">
            <span className="truncate">{user.email}</span>
            <EmailVerificationStatus />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!user.emailActive ? (
            <Button onClick={handleResend} disabled={isResending} className="w-full sm:w-auto">
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your email is verified. You&apos;re all set.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Password
          </CardTitle>
          <CardDescription>Request a reset link to update your password.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full sm:w-auto">
            <a href="/forgot-password">Send password reset link</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

