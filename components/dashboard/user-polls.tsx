"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vote, Users, Calendar, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

// Mock data - replace with actual data fetching
const userPolls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    totalVotes: 156,
    totalVoters: 89,
    createdAt: "2024-01-15",
    isActive: true,
    category: "Technology"
  },
  {
    id: "2",
    title: "Best pizza topping combination",
    totalVotes: 234,
    totalVoters: 156,
    createdAt: "2024-01-14",
    isActive: true,
    category: "Food"
  },
  {
    id: "3",
    title: "Preferred work environment",
    totalVotes: 89,
    totalVoters: 67,
    createdAt: "2024-01-13",
    isActive: false,
    category: "Work"
  }
]

export function UserPolls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Polls</CardTitle>
        <CardDescription>
          Manage and view your created polls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userPolls.map((poll) => (
            <div key={poll.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h3 className="font-medium">{poll.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Vote className="h-4 w-4" />
                    <span>{poll.totalVotes} votes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{poll.totalVoters} voters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={poll.isActive ? "default" : "secondary"}>
                    {poll.isActive ? "Active" : "Closed"}
                  </Badge>
                  <Badge variant="outline">{poll.category}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/polls/${poll.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/polls/create">
            <Button className="w-full">
              Create New Poll
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


