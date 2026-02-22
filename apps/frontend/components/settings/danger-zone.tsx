"use client";

import * as React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api/auth";
import type { ApiError } from "@/types/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DangerZone() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeactivating, setIsDeactivating] = React.useState(false);

  if (!user) return null;

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      const response = await authApi.deactivate();
      toast.success(response?.message || "Account deactivated.");

      setIsOpen(false);
      await logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Failed to deactivate account.");
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <Card className="bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Deactivating your account is a soft delete. You will be logged out and won&apos;t be able to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Account: <span className="font-medium text-foreground">{user.email}</span>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="h-10 rounded-full px-6 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            >
              <Trash2 className="mr-2 size-4" />
              Deactivate account
            </Button>
          </DialogTrigger>

          <DialogContent className="rounded-2xl backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Deactivate your account?</DialogTitle>
              <DialogDescription>
                Warning: this action will deactivate your account (soft delete). You&apos;ll be logged out immediately.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isDeactivating}
                className="rounded-full"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="rounded-full"
              >
                {isDeactivating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  "Yes, deactivate"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
