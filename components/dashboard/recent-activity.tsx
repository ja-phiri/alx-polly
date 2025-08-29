"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Vote, Plus, Users, Clock } from "lucide-react"

// Mock data - replace with actual data fetching
const recentActivity = [
  {
    id: "1",
    type: "poll_created",
    title: "Created new poll",
    description: "What's your favorite programming language?",
    timestamp: "2 hours ago",
    icon: Plus
  },
  {
    id: "2",
    type: "poll_voted",
    title: "Voted on poll",
    description: "Best pizza topping combination",
    timestamp: "1 day ago",
    icon: Vote
  },
  {
    id: "3",
    type: "poll_shared",
    title: "Shared poll",
    description: "Preferred work environment",
    timestamp: "2 days ago",
    icon: Users
  },
  {
    id: "4",
    type: "poll_ended",
    title: "Poll ended",
    description: "Team lunch preferences",
    timestamp: "3 days ago",
    icon: Clock
  }
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest actions and poll updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <activity.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.timestamp}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


