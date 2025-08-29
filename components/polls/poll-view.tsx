"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Vote, Users, Calendar, Share2, BarChart3 } from "lucide-react"

interface PollViewProps {
  pollId: string
}

// Mock data - replace with actual data fetching
const mockPoll = {
  id: "1",
  title: "What's your favorite programming language?",
  description: "Let's see which programming language is most popular among developers. This poll will help us understand the current trends in the developer community.",
  options: [
    { id: "1", text: "JavaScript", votes: 45, percentage: 45 },
    { id: "2", text: "Python", votes: 32, percentage: 32 },
    { id: "3", text: "TypeScript", votes: 15, percentage: 15 },
    { id: "4", text: "Rust", votes: 8, percentage: 8 }
  ],
  totalVotes: 100,
  totalVoters: 67,
  createdAt: "2024-01-15",
  endDate: "2024-02-15",
  isActive: true,
  category: "Technology",
  hasVoted: false
}

export function PollView({ pollId }: PollViewProps) {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null)
  const [hasVoted, setHasVoted] = React.useState(mockPoll.hasVoted)
  const [poll, setPoll] = React.useState(mockPoll)

  const handleVote = async () => {
    if (!selectedOption) return

    // TODO: Implement voting logic
    setHasVoted(true)
    
    // Update poll data to show results
    const updatedPoll = {
      ...poll,
      hasVoted: true,
      options: poll.options.map(option => ({
        ...option,
        votes: option.id === selectedOption ? option.votes + 1 : option.votes
      })),
      totalVotes: poll.totalVotes + 1
    }
    setPoll(updatedPoll)
  }

  const sharePoll = () => {
    if (navigator.share) {
      navigator.share({
        title: poll.title,
        text: poll.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              <CardDescription className="text-base">
                {poll.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={poll.isActive ? "default" : "secondary"}>
                {poll.isActive ? "Active" : "Closed"}
              </Badge>
              <Badge variant="outline">{poll.category}</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
              <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!hasVoted && poll.isActive ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cast your vote:</h3>
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <Button
                    key={option.id}
                    variant={selectedOption === option.id ? "default" : "outline"}
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setSelectedOption(option.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{option.text}</div>
                    </div>
                  </Button>
                ))}
              </div>
              <Button 
                onClick={handleVote} 
                disabled={!selectedOption}
                className="w-full"
              >
                Submit Vote
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Results:</h3>
                <Button variant="outline" size="sm" onClick={sharePoll}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="space-y-4">
                {poll.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      <span className="text-sm text-muted-foreground">
                        {option.votes} votes ({option.percentage}%)
                      </span>
                    </div>
                    <Progress value={option.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


