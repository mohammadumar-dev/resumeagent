"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

export function EmailVerificationStatus() {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {user.emailActive ? (
                <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                </Badge>
            ) : (
                <Badge variant="outline" className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                    <XCircle className="h-3 w-3" />
                    Unverified
                </Badge>
            )}
        </div>
    );
}
