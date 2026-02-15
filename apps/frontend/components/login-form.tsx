"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ApiError } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("relative flex flex-col gap-8", className)}
      {...props}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <Card className="relative overflow-hidden border bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left Side - Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col justify-center p-8 sm:p-10 md:p-12"
          >
            <FieldGroup className="gap-6">
              {/* Heading */}
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                  Login to your ResumeAgent account
                </p>
              </div>

              {/* Email */}
              <Field className="space-y-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              {/* Password */}
              <Field className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              {/* Submit */}
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
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Field>

              <FieldSeparator />

              {/* Signup */}
              <FieldDescription className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Right Side - Visual Panel */}
          <div className="relative hidden overflow-hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Login Visual"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.25] dark:grayscale"
            />
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent backdrop-blur-sm" />
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="/terms" className="underline hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy-policy" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
