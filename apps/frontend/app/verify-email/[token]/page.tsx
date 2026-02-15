"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import type { ApiError } from '@/types/auth';

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. No token provided.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await authApi.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                if (response.email) {
                    setEmail(response.email);
                }

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (error) {
                const apiError = error as ApiError;
                setStatus('error');
                setMessage(apiError.message || 'Failed to verify email. The link may be invalid or expired.');
            }
        };

        verifyEmail();
    }, [token, router]);

    const handleResendVerification = async () => {
        if (!email) {
            return;
        }

        setIsResending(true);
        try {
            const response = await authApi.resendVerification(email);
            setMessage(response.message || 'Verification email sent! Please check your inbox.');
        } catch (error) {
            const apiError = error as ApiError;
            setMessage(apiError.message || 'Failed to resend verification email.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Ambient background glow */}
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />
                </div>

                <Card className="relative overflow-hidden border bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
                    <CardContent className="p-8 sm:p-10">
                        <div className="flex flex-col items-center gap-6 text-center">
                            {/* Icon */}
                            {status === 'loading' && (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                    <XCircle className="h-8 w-8 text-destructive" />
                                </div>
                            )}

                            {/* Title */}
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {status === 'loading' && 'Verifying Your Email'}
                                    {status === 'success' && 'Email Verified!'}
                                    {status === 'error' && 'Verification Failed'}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex w-full flex-col gap-3">
                                {status === 'success' && (
                                    <Button
                                        onClick={() => router.push('/login')}
                                        size="lg"
                                        className="w-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                                    >
                                        Continue to Login
                                    </Button>
                                )}

                                {status === 'error' && email && (
                                    <Button
                                        onClick={handleResendVerification}
                                        disabled={isResending}
                                        size="lg"
                                        className="w-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                                    >
                                        {isResending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Resend Verification Email
                                            </>
                                        )}
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/')}
                                    size="lg"
                                    className="w-full"
                                >
                                    Back to Home
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
