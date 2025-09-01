"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vote, Users, Calendar, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { db } from "@/lib/db/supabase-utils"
import { PollSummary } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Icons } from "@/components/ui/icons"

export function UserPolls() {
  const { user } = useAuth()
  const [polls, setPolls] = React.useState<PollSummary[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const fetchUserPolls = React.useCallback(async () => {
    if (!user) {
      setPolls([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await db.polls.getByUser(user.id)
      setPolls(data)
    } catch (err) {
      console.error("Error fetching user polls:", err)
      toast.error("Failed to load your polls")
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    fetchUserPolls()
  }, [fetchUserPolls])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this poll? This action cannot be undone.")
    if (!confirmed) return

    try {
      setDeletingId(id)
      const ok = await db.polls.delete(id)
      if (ok) {
        setPolls((prev) => prev.filter((p) => p.id !== id))
        toast.success("Poll deleted")
      } else {
        toast.error("Failed to delete poll")
      }
    } catch (err) {
      console.error("Error deleting poll:", err)
      toast.error("Failed to delete poll")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Polls</CardTitle>
        <CardDescription>Manage and view your created polls</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Icons.spinner className="h-5 w-5 animate-spin mr-2" /> Loading your polls...
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">You have not created any polls yet.</p>
            <Link href="/polls/create">
              <Button>Create Your First Poll</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <div key={poll.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{poll.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Vote className="h-4 w-4" />
                      <span>{poll.total_votes} votes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{poll.unique_voters} voters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={poll.is_active ? "default" : "secondary"}>
                      {poll.is_active ? "Active" : "Closed"}
                    </Badge>
                    <Badge variant="outline">{poll.is_public ? "Public" : "Private"}</Badge>
                    <Badge variant="outline">{poll.option_count} options</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/polls/${poll.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {poll.created_by === user?.id && (
                    <>
                      <Link href={`/polls/${poll.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
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
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Link href="/polls/create">
            <Button className="w-full">Create New Poll</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
