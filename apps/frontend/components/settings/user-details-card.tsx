"use client";

import * as React from "react";
import { UserRound, Shield, BadgeCheck, BadgeX, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/lib/api/auth";
import type { ApiError, UserInfoResponse } from "@/types/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground text-right">{value}</div>
    </div>
  );
}

export function UserDetailsCard() {
  const [user, setUser] = React.useState<UserInfoResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Failed to load user details.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await load();
      toast.success("User details updated.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const used = user?.resumeGenerationUsed ?? 0;
  const limit = user?.resumeGenerationLimit ?? 0;
  const usagePct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <Card className="bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          Account
        </CardTitle>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="rounded-full"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-2/3 rounded bg-muted/50" />
            <div className="h-4 w-1/2 rounded bg-muted/50" />
            <div className="h-4 w-3/4 rounded bg-muted/50" />
          </div>
        ) : !user ? (
          <div className="text-sm text-muted-foreground">
            Unable to load user details.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <DetailRow label="Full name" value={user.fullName} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow
                label="Role"
                value={
                  <Badge variant="outline" className="rounded-full">
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role}
                  </Badge>
                }
              />
              <DetailRow
                label="Email status"
                value={
                  user.emailActive ? (
                    <Badge variant="outline" className="gap-1.5 rounded-full border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1.5 rounded-full border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                      <BadgeX className="h-3.5 w-3.5" />
                      Not verified
                    </Badge>
                  )
                }
              />
              <DetailRow
                label="Plan"
                value={<Badge variant="secondary" className="rounded-full">{user.plan}</Badge>}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Resume generations</span>
                <span>
                  {used.toLocaleString()} / {limit.toLocaleString()}
                </span>
              </div>
              <Progress value={usagePct} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

