"use client";

import * as React from "react";
import {
  Crown,
  Eye,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

import { useAuth } from "@/contexts/AuthContext";
import {
  adminApi,
  type AdminUserActivitySummaryResponse,
  type AdminUsersDashboardResponse,
  type User,
  type UserRole,
} from "@/lib/api/admin";
import type { ApiError } from "@/types/auth";

type RoleFilter = "ALL" | UserRole;

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export default function UsersPage() {
  const { user } = useAuth();

  const [role, setRole] = React.useState<RoleFilter>("ALL");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(20);

  const [stats, setStats] = React.useState<AdminUsersDashboardResponse | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(true);
  const [items, setItems] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const [userToView, setUserToView] = React.useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isViewLoading, setIsViewLoading] = React.useState(false);
  const [viewSummary, setViewSummary] = React.useState<AdminUserActivitySummaryResponse | null>(null);

  const [userToDeactivate, setUserToDeactivate] = React.useState<User | null>(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false);
  const [isDeactivating, setIsDeactivating] = React.useState(false);
  const [pagination, setPagination] = React.useState<{
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }>({ totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false });

  const loadUsers = React.useCallback(async () => {
    try {
      const response = await adminApi.listUsers({ page, size, role });
      setItems(response.items ?? []);
      setPagination({
        totalElements: response.totalElements ?? 0,
        totalPages: response.totalPages ?? 0,
        hasNext: Boolean(response.hasNext),
        hasPrevious: Boolean(response.hasPrevious),
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Failed to load users.");
      setItems([]);
      setPagination({ totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false });
    } finally {
      setIsLoading(false);
    }
  }, [page, role, size]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadStats = React.useCallback(async () => {
    try {
      const response = await adminApi.getDashboardStats();
      setStats(response);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Failed to load dashboard stats.");
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user?.role !== "ADMIN") return;
    loadStats();
  }, [loadStats, user?.role]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadUsers(), loadStats()]);
      toast.success("Users updated.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleView = async (selectedUser: User) => {
    setUserToView(selectedUser);
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewSummary(null);

    try {
      const response = await adminApi.getUserSummary(selectedUser.id);
      setViewSummary(response);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Failed to load user summary.");
      setViewSummary(null);
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!userToDeactivate) return;

    setIsDeactivating(true);
    try {
      const response = await adminApi.deactivateUser(userToDeactivate.id);
      toast.success(response?.message || "User deactivated.");
      setIsDeactivateOpen(false);
      setUserToDeactivate(null);
      await loadUsers();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Failed to deactivate user.");
    } finally {
      setIsDeactivating(false);
    }
  };

  const filteredItems = React.useMemo(() => {
    if (role === "ALL") return items;
    return items.filter((item) => item.role === role);
  }, [items, role]);

  const summaryUsagePct = React.useMemo(() => {
    const used = viewSummary?.resumeGenerationUsed ?? 0;
    const limit = viewSummary?.resumeGenerationLimit ?? 0;
    return limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  }, [viewSummary?.resumeGenerationLimit, viewSummary?.resumeGenerationUsed]);

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="floating" />
        <SidebarInset>
          <SiteHeader title="Users" />
          <EmailVerificationBanner />

          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                  {user?.role !== "ADMIN" ? (
                    <Card className="bg-card/70 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-destructive" />
                          Admin access required
                        </CardTitle>
                        <CardDescription>
                          You don&apos;t have permission to view the user list.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      <div
                        className="
    grid grid-cols-1 gap-4
    sm:grid-cols-2
    xl:grid-cols-3
  "
                      >
                        {/* TOTAL ACCOUNTS */}
                        <Card
                          className="
      group relative overflow-hidden
      rounded-2xl
      border border-border/60
      bg-background/70
      backdrop-blur-xl
      shadow-sm
      transition-all duration-300
      hover:-translate-y-1 hover:shadow-lg
    "
                        >
                          <div
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                          />

                          <CardHeader className="relative pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                  <Users className="h-4 w-4" />
                                </div>
                                Total Accounts
                              </div>
                            </div>
                            <CardDescription className="text-xs">
                              All users (admin + user)
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="relative pb-5">
                            <div className="text-3xl font-semibold tracking-tight tabular-nums">
                              {isStatsLoading
                                ? "—"
                                : (stats?.totalUsersCount ?? 0).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>

                        {/* ADMINS */}
                        <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />

                          <CardHeader className="relative pb-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                              Admins
                            </div>
                            <CardDescription className="text-xs">
                              Total admin accounts
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="relative pb-5">
                            <div className="text-3xl font-semibold tabular-nums">
                              {isStatsLoading
                                ? "—"
                                : (stats?.totalAdmins ?? 0).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>

                        {/* USERS */}
                        <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />

                          <CardHeader className="relative pb-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                <Users className="h-4 w-4" />
                              </div>
                              Users
                            </div>
                            <CardDescription className="text-xs">
                              Non-admin accounts
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="relative pb-5">
                            <div className="text-3xl font-semibold tabular-nums">
                              {isStatsLoading
                                ? "—"
                                : (stats?.totalUsers ?? 0).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>

                        {/* FREE PLAN */}
                        <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-muted/20 via-transparent to-transparent" />

                          <CardHeader className="relative pb-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <div className="flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <Sparkles className="h-4 w-4" />
                              </div>
                              Free Plan Users
                            </div>
                            <CardDescription className="text-xs">
                              Users on FREE plan
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="relative pb-5">
                            <div className="text-3xl font-semibold tabular-nums">
                              {isStatsLoading
                                ? "—"
                                : (stats?.totalFreePlanUsers ?? 0).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>

                        {/* PRO PLAN */}
                        <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />

                          <CardHeader className="relative pb-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                <Crown className="h-4 w-4" />
                              </div>
                              Pro Plan Users
                            </div>
                            <CardDescription className="text-xs">
                              Users on PRO plan
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="relative pb-5">
                            <div className="text-3xl font-semibold tabular-nums">
                              {isStatsLoading
                                ? "—"
                                : (stats?.totalPremiumPlanUsers ?? 0).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>

                        {/* RESUME GENERATIONS */}
                        <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent" />

                          <CardHeader className="relative pb-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <div className="flex size-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                                <Sparkles className="h-4 w-4" />
                              </div>
                              Resume Generations
                            </div>
                            <CardDescription className="text-xs">
                              Total generated resumes
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="relative pb-5">
                            <div className="text-3xl font-semibold tabular-nums">
                              {isStatsLoading
                                ? "—"
                                : (stats?.totalResumeGenerations ?? 0).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="bg-card/70 backdrop-blur-xl">
                        <CardHeader className="gap-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <CardTitle>All Users</CardTitle>
                              <CardDescription>
                                Filter by role and review user activity limits.
                              </CardDescription>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                              <Button asChild className="rounded-full">
                                <Link href="/admin/register">Create admin</Link>
                              </Button>

                              <Select
                                value={role}
                                onValueChange={(value) => {
                                  setRole(value as RoleFilter);
                                  setPage(0);
                                }}
                              >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                  <SelectValue placeholder="Filter role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ALL">All roles</SelectItem>
                                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                                  <SelectItem value="USER">USER</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isLoading || isRefreshing || isStatsLoading}
                                className="rounded-full"
                              >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Refresh
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredItems.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                                        No users found.
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    filteredItems.map((u) => (
                                      <TableRow key={u.id}>
                                        <TableCell className="max-w-[220px] truncate">
                                          {u.full_name || "—"}
                                        </TableCell>
                                        <TableCell className="max-w-[260px] truncate">
                                          {u.email}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className="rounded-full">
                                            {u.role}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="secondary" className="rounded-full">
                                            {u.plan}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-xs text-muted-foreground">
                                            {u.resume_generation_used} / {u.resume_generation_limit}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          {u.is_email_active ? (
                                            <Badge variant="outline" className="rounded-full border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
                                              Verified
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                                              Pending
                                            </Badge>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                          {formatDateTime(u.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex flex-col items-end justify-end gap-2 sm:flex-row">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="xs"
                                              className="rounded-full"
                                              onClick={() => handleView(u)}
                                              disabled={isLoading || isRefreshing}
                                            >
                                              <Eye className="h-3.5 w-3.5" />
                                              View
                                            </Button>

                                            <Button
                                              type="button"
                                              variant="destructive"
                                              size="xs"
                                              className="rounded-full shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                                              title="Deactivate (soft delete)"
                                              disabled={
                                                isLoading ||
                                                isRefreshing ||
                                                isDeactivating ||
                                                u.id === user?.id
                                              }
                                              onClick={() => {
                                                setUserToDeactivate(u);
                                                setIsDeactivateOpen(true);
                                              }}
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                              Delete
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>

                              <Dialog
                                open={isViewOpen}
                                onOpenChange={(open) => {
                                  setIsViewOpen(open);
                                  if (!open) {
                                    setUserToView(null);
                                    setViewSummary(null);
                                    setIsViewLoading(false);
                                  }
                                }}
                              >
                                <DialogContent className="rounded-2xl backdrop-blur-xl sm:max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>User summary</DialogTitle>
                                    <DialogDescription>
                                      Review usage, generation history, and agent outcomes.
                                    </DialogDescription>
                                  </DialogHeader>

                                  {isViewLoading ? (
                                    <div className="space-y-4">
                                      <div className="h-5 w-2/3 rounded bg-muted/40" />
                                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="h-24 rounded-xl border border-border/60 bg-muted/10" />
                                        <div className="h-24 rounded-xl border border-border/60 bg-muted/10" />
                                      </div>
                                      <div className="h-24 rounded-xl border border-border/60 bg-muted/10" />
                                    </div>
                                  ) : !viewSummary ? (
                                    <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-5 text-sm text-muted-foreground">
                                      Unable to load this user&apos;s summary.
                                    </div>
                                  ) : (
                                    <div className="space-y-5">
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                          <div className="text-base font-semibold">
                                            {viewSummary.fullName || userToView?.full_name || "—"}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {viewSummary.email}
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                          <Badge variant="outline" className="rounded-full">
                                            {viewSummary.role || "—"}
                                          </Badge>
                                          <Badge variant="secondary" className="rounded-full">
                                            {viewSummary.plan || "—"}
                                          </Badge>
                                          {viewSummary.emailActive ? (
                                            <Badge className="rounded-full" variant="outline">
                                              Active
                                            </Badge>
                                          ) : (
                                            <Badge
                                              className="rounded-full border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
                                              variant="outline"
                                            >
                                              Deactivated
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                          <div className="text-xs font-medium text-muted-foreground">
                                            Resume generations
                                          </div>
                                          <div className="mt-2 flex items-center justify-between text-sm">
                                            <span className="font-medium tabular-nums">
                                              {viewSummary.resumeGenerationUsed.toLocaleString()} /{" "}
                                              {viewSummary.resumeGenerationLimit.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {summaryUsagePct}%
                                            </span>
                                          </div>
                                          <div className="mt-2">
                                            <Progress value={summaryUsagePct} />
                                          </div>
                                        </div>

                                        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                          <div className="text-xs font-medium text-muted-foreground">
                                            Last generation
                                          </div>
                                          <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="rounded-full">
                                              {viewSummary.lastResumeGenerationStatus || "—"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {viewSummary.lastResumeGenerationAt
                                                ? formatDateTime(viewSummary.lastResumeGenerationAt)
                                                : "—"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                          <div>
                                            <div className="text-xs text-muted-foreground">Master resume</div>
                                            <div className="mt-1 text-sm font-medium">
                                              {viewSummary.hasMasterResume ? "Yes" : "No"}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-muted-foreground">Resumes</div>
                                            <div className="mt-1 text-sm font-medium tabular-nums">
                                              {viewSummary.totalResumes.toLocaleString()}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-muted-foreground">Generations</div>
                                            <div className="mt-1 text-sm font-medium tabular-nums">
                                              {viewSummary.totalResumeGenerations.toLocaleString()}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-muted-foreground">Agent logs</div>
                                            <div className="mt-1 text-sm font-medium tabular-nums">
                                              {viewSummary.totalAgentLogs.toLocaleString()}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400" variant="outline">
                                              Success: {viewSummary.agentSuccessCount.toLocaleString()}
                                            </Badge>
                                            <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400" variant="outline">
                                              Partial: {viewSummary.agentPartialCount.toLocaleString()}
                                            </Badge>
                                            <Badge className="rounded-full border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400" variant="outline">
                                              Failure: {viewSummary.agentFailureCount.toLocaleString()}
                                            </Badge>
                                          </div>

                                          <div className="text-xs text-muted-foreground tabular-nums">
                                            Tokens used:{" "}
                                            <span className="font-medium text-foreground">
                                              {viewSummary.totalTokensUsed.toLocaleString()}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="mt-4 text-xs text-muted-foreground">
                                          Created:{" "}
                                          <span className="text-foreground">
                                            {viewSummary.createdAt ? formatDateTime(viewSummary.createdAt) : "—"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <DialogFooter className="gap-2 sm:justify-end">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsViewOpen(false)}
                                      className="rounded-full"
                                    >
                                      Close
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog
                                open={isDeactivateOpen}
                                onOpenChange={(open) => {
                                  setIsDeactivateOpen(open);
                                  if (!open) setUserToDeactivate(null);
                                }}
                              >
                                <DialogContent className="rounded-2xl backdrop-blur-xl">
                                  <DialogHeader>
                                    <DialogTitle>Deactivate user?</DialogTitle>
                                    <DialogDescription>
                                      Warning: this is a soft delete. The user won&apos;t be able to sign in.
                                      {userToDeactivate?.email ? ` (${userToDeactivate.email})` : ""}
                                    </DialogDescription>
                                  </DialogHeader>

                                  <DialogFooter className="gap-2 sm:justify-end">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsDeactivateOpen(false)}
                                      disabled={isDeactivating}
                                      className="rounded-full"
                                    >
                                      Cancel
                                    </Button>

                                    <Button
                                      variant="destructive"
                                      onClick={handleDeactivate}
                                      disabled={isDeactivating || !userToDeactivate}
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

                              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs text-muted-foreground">
                                  {pagination.totalElements.toLocaleString()} total
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={isLoading || !pagination.hasPrevious}
                                  >
                                    Prev
                                  </Button>
                                  <div className="text-xs text-muted-foreground">
                                    Page {page + 1}{pagination.totalPages ? ` / ${pagination.totalPages}` : ""}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={isLoading || !pagination.hasNext}
                                  >
                                    Next
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
