"use client";

import { Navigation } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { UserPolls } from "@/components/dashboard/user-polls";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ChartShowcase } from "@/components/dashboard/chart-showcase";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your polling activity.
            </p>
          </div>

          <div className="grid gap-8">
            <DashboardStats />

            <ChartShowcase />

            <div className="grid gap-8 md:grid-cols-2">
              <UserPolls />
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
