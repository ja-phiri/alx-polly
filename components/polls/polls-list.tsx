"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Vote, Users, Calendar, Eye } from "lucide-react"
import Link from "next/link"

// Mock data - replace with actual data fetching
const mockPolls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Let's see which programming language is most popular among developers",
    totalVotes: 156,
    totalVoters: 89,
    createdAt: "2024-01-15",
    isActive: true,
    category: "Technology"
  },
  {
    id: "2",
    title: "Best pizza topping combination",
    description: "Vote for your favorite pizza topping combination",
    totalVotes: 234,
    totalVoters: 156,
    createdAt: "2024-01-14",
    isActive: true,
    category: "Food"
  },
  {
    id: "3",
    title: "Preferred work environment",
    description: "What's your ideal work environment setup?",
    totalVotes: 89,
    totalVoters: 67,
    createdAt: "2024-01-13",
    isActive: false,
    category: "Work"
  }
]

export function PollsList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mockPolls.map((poll) => (
        <Card key={poll.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {poll.description}
                </CardDescription>
              </div>
              <Badge variant={poll.isActive ? "default" : "secondary"}>
                {poll.isActive ? "Active" : "Closed"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{poll.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Vote className="h-4 w-4" />
                <span>{poll.totalVotes} votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{poll.totalVoters} voters</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
              <Link href={`/polls/${poll.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


