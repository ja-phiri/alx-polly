"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Vote, Users, Calendar, Eye, Loader2, Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { PollSummary, ApiResponse } from "@/lib/types"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db/supabase-utils"
import { Icons } from "@/components/ui/icons"

interface PollsListProps {
  publicOnly?: boolean
  limit?: number
}

export function PollsList({ publicOnly = false, limit = 20 }: PollsListProps) {
  const { user } = useAuth()
  const [polls, setPolls] = useState<PollSummary[]>([])
  const [filteredPolls, setFilteredPolls] = useState<PollSummary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPolls()
  }, [publicOnly, limit])

  useEffect(() => {
    // Filter polls based on search query
    if (searchQuery.trim() === "") {
      setFilteredPolls(polls)
    } else {
      const filtered = polls.filter(poll =>
        poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredPolls(filtered)
    }
  }, [searchQuery, polls])

  const fetchPolls = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(publicOnly && { public: 'true' })
      })

      const response = await fetch(`/api/polls?${params}`)
      const result: ApiResponse<{ polls: PollSummary[] }> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch polls')
      }

      if (result.success && result.data?.polls) {
        setPolls(result.data.polls)
        setFilteredPolls(result.data.polls)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching polls:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch polls'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this poll? This cannot be undone.')
    if (!confirmed) return
    try {
      setDeletingId(id)
      const ok = await db.polls.delete(id)
      if (ok) {
        setPolls(prev => prev.filter(p => p.id !== id))
        setFilteredPolls(prev => prev.filter(p => p.id !== id))
        toast.success('Poll deleted')
      } else {
        toast.error('Failed to delete poll')
      }
    } catch (e) {
      console.error('Error deleting poll:', e)
      toast.error('Failed to delete poll')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading polls...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchPolls} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {publicOnly ? 'No public polls available' : 'No polls found'}
          </p>
          {!publicOnly && (
            <Link href="/polls/create">
              <Button>Create Your First Poll</Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search polls by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results Info */}
      {searchQuery.trim() !== "" && (
        <div className="text-sm text-muted-foreground">
          {filteredPolls.length === 0 ? (
            <span>No polls found matching "{searchQuery}"</span>
          ) : (
            <span>Showing {filteredPolls.length} of {polls.length} polls</span>
          )}
        </div>
      )}

      {/* Polls Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPolls.map((poll) => (
          <Card key={poll.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {poll.description}
                  </CardDescription>
                </div>
                <Badge variant={poll.is_active ? "default" : "secondary"}>
                  {poll.is_active ? "Active" : "Closed"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {poll.allow_multiple_votes ? "Multiple Votes" : "Single Vote"}
                </Badge>
                {!poll.is_public && (
                  <Badge variant="outline">Private</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Vote className="h-4 w-4" />
                  <span>{poll.total_votes} votes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{poll.unique_voters} voters</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(poll.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
              <Link href={`/polls/${poll.id}`}>
              <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
              </Button>
              </Link>
              {poll.created_by === user?.id && (
              <>
              <Link href={`/polls/${poll.id}/edit`}>
              <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
              </Button>
              </Link>
              <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(poll.id)}
              disabled={deletingId === poll.id}
              >
              {deletingId === poll.id ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
              <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete
              </Button>
              </>
              )}
              </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


