"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api/admin";
import type { ApiError } from "@/types/auth";

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

const registerAdminSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(150, "Name is too long"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(150, "Email is too long")
      .email("Invalid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(
    (data) =>
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(data.password),
    {
      message:
        "Password must include uppercase, lowercase, number, and symbol",
      path: ["password"],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterAdminFormData = z.infer<typeof registerAdminSchema>;

export function RegisterAdminForm({
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
  } = useForm<RegisterAdminFormData>({
    resolver: zodResolver(registerAdminSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: RegisterAdminFormData) => {
    setIsLoading(true);
    try {
      await adminApi.registerAdmin(data);
      setIsSuccess(true);
      toast.success("Admin created. Ask them to verify their email before logging in.");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Failed to create admin. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("relative flex flex-col gap-8", className)} {...props}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-destructive/10 blur-[150px]" />
        </div>

        <Card className="relative overflow-hidden border bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Admin created
                </h1>
                <p className="text-sm text-muted-foreground">
                  A verification email was sent. The new admin needs to verify
                  their email before logging in.
                </p>
              </div>
              <Button onClick={() => router.push("/users")} size="lg" className="w-full max-w-sm">
                Back to Users
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full max-w-sm">
                <Link href="/dashboard">Go to Dashboard</Link>
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
        <div className="absolute left-1/2 top-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-destructive/10 blur-[150px]" />
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
                <h1 className="text-3xl font-bold tracking-tight">
                  Create an admin
                </h1>
                <p className="text-sm text-muted-foreground">
                  Admins can manage users and system settings.
                </p>
              </div>

              <Field className="space-y-2">
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Admin"
                  {...register("fullName")}
                  aria-invalid={Boolean(errors.fullName)}
                  className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-destructive"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </Field>

              <Field className="space-y-2">
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                  className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-destructive"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
                <FieldDescription className="text-xs">
                  A verification email will be sent to this address.
                </FieldDescription>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    aria-invalid={Boolean(errors.password)}
                    className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-destructive"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                  <FieldDescription className="text-xs">
                    Minimum 8 characters, including uppercase, lowercase, number, and symbol.
                  </FieldDescription>
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    {...register("confirmPassword")}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    className="bg-background/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-destructive"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </Field>
              </div>

              <Field>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full bg-destructive text-white shadow-lg shadow-destructive/20 transition-all hover:-translate-y-0.5 hover:bg-destructive/90 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating admin...
                    </>
                  ) : (
                    <>
                      <ShieldPlus className="mr-2 h-4 w-4" />
                      Create Admin
                    </>
                  )}
                </Button>
              </Field>

              <FieldSeparator />

              <FieldDescription className="text-center text-sm">
                <Link href="/users" className="font-medium text-primary hover:underline">
                  Back to users
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden overflow-hidden md:block">
            <Image
              src="/placeholder.svg"
              alt="Admin panel"
              fill
              className="object-cover dark:brightness-[0.25] dark:grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/25 via-transparent to-transparent backdrop-blur-sm" />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        Creating an admin grants elevated permissions. Only do this for trusted users.
      </FieldDescription>
    </div>
  );
}
