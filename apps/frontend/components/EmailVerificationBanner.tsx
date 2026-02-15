"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Mail, X } from "lucide-react";
import { useState } from "react";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

export function EmailVerificationBanner() {
    const { user } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Don't show banner if user is verified, not logged in, or dismissed
    if (!user || user.emailActive || isDismissed) {
        return null;
    }

    const handleResendEmail = async () => {
        setIsResending(true);
        try {
            await authApi.resendVerification(user.email);
            toast.success("Verification email sent! Please check your inbox.");
        } catch (error) {
            toast.error("Failed to resend verification email. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="relative border-b bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-1 items-center gap-3">
                        <Mail className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            Please verify your email address to unlock all features.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResendEmail}
                            disabled={isResending}
                            className="border-amber-300 bg-white hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900"
                        >
                            {isResending ? "Sending..." : "Resend Email"}
                        </Button>
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="rounded-md p-1 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
