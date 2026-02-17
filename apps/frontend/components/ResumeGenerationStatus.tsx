"use client";

import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import { useResumeGenerationSocket, type AgentStatus } from "@/hooks/useResumeGenerationSocket";
import { Progress } from "@/components/ui/progress";

const AGENT_STEPS = [
    {
        key: "JobDescriptionAnalyzerAgent",
        label: "Analyze job description",
        color: "emerald",
    },
    {
        key: "MatchingAgent",
        label: "Match with master resume",
        color: "blue",
    },
    {
        key: "ResumeRewriteAgent",
        label: "Rewrite resume",
        color: "violet",
    },
    {
        key: "ATSOptimizationAgent",
        label: "Optimize for ATS",
        color: "amber",
    },
] as const;

type StatusValue = AgentStatus | undefined;

interface ResumeGenerationStatusProps {
    userId: string;
    isActive?: boolean;
    resetKey?: number;
}

export function ResumeGenerationStatus({
    userId,
    isActive = false,
    resetKey,
}: ResumeGenerationStatusProps) {
    const { statuses, connectionError } = useResumeGenerationSocket(
        userId,
        resetKey,
    );

    const totalSteps = AGENT_STEPS.length;
    const completedSteps = AGENT_STEPS.filter(
        (step) => statuses[step.key] === "SUCCESS",
    ).length;
    const hasFailure =
        AGENT_STEPS.some((step) => statuses[step.key] === "FAILED") ||
        Boolean(connectionError);
    const hasInProgress = AGENT_STEPS.some(
        (step) => statuses[step.key] === "STARTED",
    );
    const hasStatus = Object.keys(statuses).length > 0;
    const isRunning =
        (isActive || hasInProgress || (hasStatus && completedSteps < totalSteps)) &&
        !hasFailure;

    if (!hasStatus && !isActive) {
        return null;
    }

    const currentStep = AGENT_STEPS.find(
        (step) => statuses[step.key] === "STARTED",
    );
    const progressValue = Math.round((completedSteps / totalSteps) * 100);

    const headerTitle = hasFailure
        ? "Generation failed"
        : completedSteps === totalSteps && hasStatus
            ? "Generation complete"
            : currentStep
                ? `Working on ${currentStep.label}`
                : isRunning
                    ? "Preparing resume generation"
                    : "Resume generation status";

    const headerNote = hasFailure
        ? "We hit an issue while generating your resume."
        : completedSteps === totalSteps && hasStatus
            ? "All steps finished successfully."
            : "Live status updates from the AI pipeline.";

    const getStatusBadge = (status: StatusValue, hasAnyStatus: boolean) => {
        const baseClass =
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium";

        if (status === "SUCCESS") {
            return (
                <span className={`${baseClass} bg-emerald-500/10 text-emerald-600`}>
                    <CheckCircle2 className="size-3" />
                    Done
                </span>
            );
        }

        if (status === "FAILED") {
            return (
                <span className={`${baseClass} bg-red-500/10 text-red-600`}>
                    <XCircle className="size-3" />
                    Failed
                </span>
            );
        }

        if (status === "STARTED") {
            return (
                <span className={`${baseClass} bg-blue-500/10 text-blue-600`}>
                    <Loader2 className="size-3 animate-spin" />
                    Running
                </span>
            );
        }

        const fallbackLabel = hasAnyStatus ? "Queued" : "Waiting";

        return (
            <span className={`${baseClass} bg-muted/70 text-muted-foreground`}>
                <Clock className="size-3" />
                {fallbackLabel}
            </span>
        );
    };

    const headerIcon = hasFailure ? (
        <XCircle className="size-4 text-red-600" />
    ) : completedSteps === totalSteps && hasStatus ? (
        <CheckCircle2 className="size-4 text-emerald-600" />
    ) : (
        <Loader2 className={`size-4 ${isRunning ? "animate-spin" : ""}`} />
    );

    return (
        <div
            className="
    relative
    mt-8
    overflow-hidden
    rounded-3xl
    border border-border/60
    bg-background/70
    backdrop-blur-xl
    shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)]
    transition-all
  "
            role="status"
            aria-live="polite"
        >
            {/* Glass highlight */}
            <div
                aria-hidden
                className="
      pointer-events-none
      absolute
      inset-0
      rounded-3xl
      bg-gradient-to-br
      from-primary/5
      via-transparent
      to-transparent
    "
            />

            <div className="relative p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                            {headerIcon}
                            {headerTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {headerNote}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="tabular-nums">
                            {completedSteps}/{totalSteps}
                        </span>
                        <span>completed</span>
                    </div>
                </div>


                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress
                        value={progressValue}
                        className="
      h-2
      rounded-full
      bg-muted/40
      [&>div]:bg-primary
      [&>div]:transition-all
      [&>div]:duration-500
    "
                    />

                    <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>0%</span>
                        <span className="tabular-nums font-medium">{progressValue}%</span>
                        <span>100%</span>
                    </div>
                </div>


                {/* Step Grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {AGENT_STEPS.map((step, index) => {
                        const status = statuses[step.key];
                        const isActive = status === "STARTED";
                        const isSuccess = status === "SUCCESS";
                        const isFailed = status === "FAILED";

                        const accent = {
                            emerald: "from-emerald-500/20 via-emerald-500/5 to-transparent",
                            blue: "from-blue-500/20 via-blue-500/5 to-transparent",
                            violet: "from-violet-500/20 via-violet-500/5 to-transparent",
                            amber: "from-amber-500/20 via-amber-500/5 to-transparent",
                        }[step.color];

                        return (
                            <div
                                key={step.key}
                                className={`
          relative
          overflow-hidden
          flex
          flex-col
          justify-between
          min-h-[150px]
          rounded-2xl
          border
          bg-background/80
          backdrop-blur-md
          px-5
          py-4
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-xl
          ${isActive
                                        ? "ring-2 ring-primary/40 shadow-lg"
                                        : isSuccess
                                            ? "border-emerald-500/40"
                                            : isFailed
                                                ? "border-red-500/40 bg-red-500/5"
                                                : "border-border/60 hover:border-primary/30"
                                    }
        `}
                            >
                                {/* Gradient Accent Layer */}
                                {!isFailed && (
                                    <div
                                        className={`
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              ${accent}
              opacity-70
            `}
                                    />
                                )}

                                {/* Top Content */}
                                <div className="relative flex items-start justify-between gap-3">
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Agent {index + 1}
                                        </p>

                                        <h3 className="text-sm font-semibold tracking-tight leading-snug break-words">
                                            {step.label}
                                        </h3>
                                    </div>

                                    {/* Status Icon */}
                                    <div className="shrink-0">
                                        {isActive && (
                                            <Loader2 className="size-4 animate-spin text-primary" />
                                        )}
                                        {isSuccess && (
                                            <CheckCircle2 className="size-4 text-emerald-500" />
                                        )}
                                        {isFailed && (
                                            <XCircle className="size-4 text-red-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Status Row */}
                                <div className="relative mt-4 flex items-center justify-between">
                                    <span className="text-[11px] text-muted-foreground">
                                        Pipeline stage
                                    </span>

                                    <div className="min-w-[92px] flex justify-end">
                                        {getStatusBadge(status, hasStatus || isRunning)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Error State */}
                {hasFailure && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-600">
                        {connectionError
                            ? `Connection error: ${connectionError}`
                            : "Something interrupted the AI pipeline. Try regenerating after adjusting your input."}
                    </div>
                )}
            </div>
        </div>
    );
}
