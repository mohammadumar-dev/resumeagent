"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(150, "Email is too long")
    .email("Invalid email address")
    .toLowerCase(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const resp = await authApi.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success(resp.message || "If this email is registered, a reset link has been sent.");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to request password reset. Please try again.");
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
                <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
                <p className="text-sm text-muted-foreground">
                  If the email you entered is registered, we&apos;ve sent a password reset link.
                </p>
              </div>
              <Button onClick={() => router.push("/login")} size="lg" className="w-full max-w-sm">
                Back to Login
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
                <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll email you a link to choose a new password.
                </p>
              </div>

              <Field className="space-y-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                  className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </Field>

              <FieldSeparator />

              <FieldDescription className="text-center text-sm">
                Remembered your password?{" "}
                <a href="/login" className="font-medium text-primary hover:underline">
                  Back to login
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden overflow-hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Forgot Password Visual"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.25] dark:grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent backdrop-blur-sm" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
