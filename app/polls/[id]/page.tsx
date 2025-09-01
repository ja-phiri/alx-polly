'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Vote, Users, ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Icons } from '@/components/ui/icons'
import { ApiResponse } from '@/lib/types'
import { toast } from 'sonner'
import Link from 'next/link'
import { db } from '@/lib/db/supabase-utils'
import { useAuth } from '@/contexts/auth-context'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

interface RpcPollWithOptions {
  poll_id: string
  title: string
  description: string | null
  is_active: boolean
  is_public: boolean
  allow_multiple_votes: boolean
  expires_at: string | null
  created_by: string
  created_at: string
  updated_at: string
  total_votes: number
  options: { id: string; text: string; votes?: number }[] | null
}

export default function PollDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = (params?.id as string) || ''
  const [poll, setPoll] = React.useState<RpcPollWithOptions | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [deleting, setDeleting] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState<string>('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const fetchPoll = React.useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/polls/${id}`)
      const json: ApiResponse<{ poll: RpcPollWithOptions }> = await res.json()
      if (!res.ok || !json.success || !json.data?.poll) {
        throw new Error(json.error || 'Failed to load poll')
      }
      setPoll(json.data.poll)
    } catch (e) {
      console.error('Failed to load poll:', e)
      toast.error(e instanceof Error ? e.message : 'Failed to load poll')
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchPoll()
  }, [fetchPoll])

  const handleDelete = async () => {
    if (!poll) return
    const confirmed = window.confirm('Delete this poll? This cannot be undone.')
    if (!confirmed) return
    try {
      setDeleting(true)
      const ok = await db.polls.delete(poll.poll_id)
      if (ok) {
        toast.success('Poll deleted')
        router.push('/polls')
      } else {
        toast.error('Failed to delete poll')
      }
    } catch (e) {
      console.error('Error deleting poll:', e)
      toast.error('Failed to delete poll')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!poll || !selectedOption) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/polls/${poll.poll_id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      })
      const data: ApiResponse<{ poll: RpcPollWithOptions }> = await res.json()
      if (!res.ok || !data?.success) {
        let message = 'Failed to submit vote'
        if (data?.error) message = data.error
        throw new Error(message)
      }
      if (data?.data?.poll) setPoll(data.data.poll)
      setSubmitted(true)
      toast.success('Vote submitted')
    } catch (e) {
      console.error('Error submitting vote:', e)
      toast.error(e instanceof Error ? e.message : 'Failed to submit vote')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/polls')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Polls
        </Button>
        {poll && poll.created_by === user?.id && (
          <div className="flex items-center gap-2">
            <Link href={`/polls/${poll.poll_id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Icons.spinner className="h-5 w-5 animate-spin mr-2" /> Loading poll...
        </div>
      ) : !poll ? (
        <div className="text-center text-muted-foreground py-24">Poll not found.</div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription className="text-base">{poll.description}</CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant={poll.is_active ? 'default' : 'secondary'}>
                  {poll.is_active ? 'Active' : 'Closed'}
                </Badge>
                {!poll.is_public && <Badge variant="outline">Private</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Vote className="h-4 w-4" />
                <span>{poll.total_votes} votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(poll.created_at)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(poll.options) && poll.options.length > 0 ? (
                poll.options.map((opt: any) => {
                  const votes = typeof opt.votes === 'number' ? opt.votes : 0
                  const percent = poll.total_votes > 0 ? Math.round((votes / poll.total_votes) * 100) : 0
                  return (
                    <div key={opt.id || opt.option_id} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>{opt.text}</div>
                        {typeof opt.votes === 'number' && (
                          <div className="text-sm text-muted-foreground">{votes} votes</div>
                        )}
                      </div>
                      {typeof opt.votes === 'number' && poll.total_votes > 0 && (
                        <div className="mt-2">
                          <Progress value={percent} />
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-sm text-muted-foreground">No options available.</div>
              )}
            </div>

            {poll.is_active && Array.isArray(poll.options) && poll.options.length > 0 && (
              <div className="mt-6 border-t pt-4">
                {submitted ? (
                  <div className="text-sm text-green-600">Thank you for voting! Results will be shown here.</div>
                ) : (
                  <form onSubmit={handleVoteSubmit} className="flex flex-col sm:flex-row items-start gap-3">
                    <div className="w-full sm:w-auto">
                      <Label htmlFor="vote-option" className="mb-1 block">Choose an option</Label>
                      <Select value={selectedOption} onValueChange={setSelectedOption}>
                        <SelectTrigger id="vote-option" className="w-64">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {poll.options.map((opt: any) => (
                            <SelectItem key={opt.id || opt.option_id} value={opt.id || opt.option_id}>
                              {opt.text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={!selectedOption || submitting}>
                      {submitting ? <Icons.spinner className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Vote
                    </Button>
                  </form>
                )}
              </div>
            )}

                      </CardContent>
        </Card>
      )}
    </div>
  )
}
