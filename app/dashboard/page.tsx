import { Metadata } from "next"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { UserPolls } from "@/components/dashboard/user-polls"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export const metadata: Metadata = {
  title: "Dashboard | Polling App",
  description: "Manage your polls and view your activity",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your polling activity.
        </p>
      </div>
      
      <div className="grid gap-8">
        <DashboardStats />
        
        <div className="grid gap-8 md:grid-cols-2">
          <UserPolls />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}


