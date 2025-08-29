"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, Users, TrendingUp, Calendar } from "lucide-react"

const stats = [
  {
    title: "Total Polls Created",
    value: "12",
    description: "Your polls",
    icon: Vote,
    trend: "+2 this month"
  },
  {
    title: "Total Votes Received",
    value: "1,234",
    description: "Across all polls",
    icon: Users,
    trend: "+15% from last month"
  },
  {
    title: "Active Polls",
    value: "5",
    description: "Currently running",
    icon: TrendingUp,
    trend: "2 ending soon"
  },
  {
    title: "This Month",
    value: "3",
    description: "New polls created",
    icon: Calendar,
    trend: "+1 from last month"
  }
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {stat.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


