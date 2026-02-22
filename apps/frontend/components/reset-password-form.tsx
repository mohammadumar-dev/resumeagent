"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/types/auth";

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(
    (data) =>
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(data.newPassword),
    {
      message:
        "Password must include uppercase, lowercase, number, and symbol",
      path: ["newPassword"],
    }
  )
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      token: tokenFromUrl,
    },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setValue("token", tokenFromUrl, { shouldValidate: true });
    }
  }, [setValue, tokenFromUrl]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const resp = await authApi.resetPassword(data.token, data.newPassword);
      setIsSuccess(true);
      toast.success(resp.message || "Password has been reset successfully.");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("relative flex flex-col gap-8", className)} {...props}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />
        </div>

        <Card className="relative overflow-hidden border bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Password updated</h1>
                <p className="text-sm text-muted-foreground">
                  Your password has been reset successfully. You can now sign in.
                </p>
              </div>
              <Button onClick={() => router.push("/login")} size="lg" className="w-full max-w-sm">
                Continue to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("relative flex flex-col gap-8", className)} {...props}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <Card className="relative overflow-hidden border bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col justify-center p-8 sm:p-10 md:p-12"
          >
            <FieldGroup className="gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight">Choose a new password</h1>
                <p className="text-sm text-muted-foreground">
                  Set a strong password to secure your account.
                </p>
              </div>

              {!tokenFromUrl && (
                <Field className="space-y-2">
                  <FieldLabel htmlFor="token">Reset token</FieldLabel>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Paste token from your email"
                    {...register("token")}
                    aria-invalid={Boolean(errors.token)}
                    className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  {errors.token && <p className="text-xs text-destructive">{errors.token.message}</p>}
                </Field>
              )}

              <Field className="space-y-2">
                <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword")}
                  aria-invalid={Boolean(errors.newPassword)}
                  className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
                <FieldDescription className="text-xs">
                  Minimum 8 characters, including uppercase, lowercase, number, and symbol.
                </FieldDescription>
              </Field>

              <Field className="space-y-2">
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </Field>

              <FieldSeparator />

              <FieldDescription className="text-center text-sm">
                Need a new link?{" "}
                <a href="/forgot-password" className="font-medium text-primary hover:underline">
                  Request reset email
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden overflow-hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Reset Password Visual"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.25] dark:grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent backdrop-blur-sm" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
