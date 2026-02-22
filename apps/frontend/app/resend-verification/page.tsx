import { ResendVerificationForm } from "@/components/resend-verification-form";

export default function ResendVerificationPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ResendVerificationForm />
      </div>
    </div>
  );
}

