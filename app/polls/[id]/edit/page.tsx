'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { ApiResponse, UpdatePollData, EditPollData } from '@/lib/types'
import { toast } from 'sonner'
import { db } from '@/lib/db/supabase-utils'
import { createClient as createBrowserSupabase } from '@/lib/supabase/client'

export default function EditPollPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ''

  const [loading, setLoading] = React.useState(true)
  const supabase = React.useMemo(() => createBrowserSupabase(), [])
  const [saving, setSaving] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isPublic, setIsPublic] = React.useState(true)
  const [isActive, setIsActive] = React.useState(true)
  const [allowMultipleVotes, setAllowMultipleVotes] = React.useState(false)
  const [expiresAt, setExpiresAt] = React.useState<string>('')
  const [options, setOptions] = React.useState<{ id?: string; text: string; isNew?: boolean }[]>([])
  const [savingOptionId, setSavingOptionId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/polls/${id}`)
        const json: ApiResponse<{ poll: EditPollData }> = await res.json()
        if (!res.ok || !json.success || !json.data?.poll) throw new Error(json.error || 'Failed to load poll')
        const p: EditPollData = json.data.poll
        setTitle(p.title || '')
        setDescription(p.description || '')
        setIsPublic(!!p.is_public)
        setIsActive(!!p.is_active)
        setAllowMultipleVotes(!!p.allow_multiple_votes)
        setExpiresAt(p.expires_at ? new Date(p.expires_at).toISOString().slice(0, 16) : '')
        const opts = Array.isArray(p.options) ? p.options : []
        setOptions(
          opts.map((o) => ({ id: o.id || o.option_id, text: o.text }))
        )
      } catch (e) {
        console.error('Failed to load poll:', e)
        toast.error(e instanceof Error ? e.message : 'Failed to load poll')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const onSave = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: UpdatePollData = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        isPublic,
        isActive,
        allowMultipleVotes,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      }
      const res = await fetch(`/api/polls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json: ApiResponse = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update poll')
      toast.success('Poll updated')
      router.push(`/polls/${id}`)
    } catch (e) {
      console.error('Failed to update poll:', e)
      toast.error(e instanceof Error ? e.message : 'Failed to update poll')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Icons.spinner className="h-5 w-5 animate-spin mr-2" /> Loading poll...
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Edit Poll</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label htmlFor="is_public">Public</Label>
                    <p className="text-sm text-muted-foreground">Anyone can view and vote</p>
                  </div>
                    <Switch id="is_public" checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label htmlFor="is_active">Active</Label>
                    <p className="text-sm text-muted-foreground">Allow voting</p>
                  </div>
                  <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label htmlFor="allow_multiple_votes">Multiple votes</Label>
                    <p className="text-sm text-muted-foreground">Allow multiple selections</p>
                  </div>
                  <Switch id="allow_multiple_votes" checked={allowMultipleVotes} onCheckedChange={setAllowMultipleVotes} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">End Date (optional)</Label>
                  <Input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOptions((prev) => [...prev, { text: '', isNew: true }])}
                  >
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={opt.id || `new-${idx}`} className="flex gap-2">
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const text = e.target.value
                          setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text } : o)))
                        }}
                        placeholder={`Option ${idx + 1}`}
                      />
                      {opt.id ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            try {
                              setSavingOptionId(opt.id as string)
                              const updated = await db.options.updateOption(opt.id as string, opt.text, supabase)
                              if (!updated) throw new Error('Failed to update option')
                              toast.success('Option updated')
                            } catch (e) {
                              console.error('Failed to update option:', e)
                              toast.error(e instanceof Error ? e.message : 'Failed to update option')
                            } finally {
                              setSavingOptionId(null)
                            }
                          }}
                          disabled={savingOptionId === opt.id}
                        >
                          {savingOptionId === opt.id ? (
                            <Icons.spinner className="h-4 w-4 animate-spin" />
                          ) : (
                            'Save'
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            try {
                              setSavingOptionId(`new-${idx}`)
                              const created = await db.options.addOption(id, opt.text, supabase)
                              if (!created) throw new Error('Failed to add option')
                              setOptions((prev) => prev.map((o, i) => (i === idx ? { id: created.id, text: created.text } : o)))
                              toast.success('Option added')
                            } catch (e) {
                              console.error('Failed to add option:', e)
                              toast.error(e instanceof Error ? e.message : 'Failed to add option')
                            } finally {
                              setSavingOptionId(null)
                            }
                          }}
                          disabled={savingOptionId === `new-${idx}`}
                        >
                          {savingOptionId === `new-${idx}` ? (
                            <Icons.spinner className="h-4 w-4 animate-spin" />
                          ) : (
                            'Add'
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const target = options[idx]
                          if (target.id) {
                            const confirmed = window.confirm('Delete this option? This cannot be undone.')
                            if (!confirmed) return
                            try {
                              setSavingOptionId(target.id)
                              const ok = await db.options.deleteOption(target.id, supabase)
                              if (!ok) throw new Error('Failed to delete option')
                              setOptions((prev) => prev.filter((_, i) => i !== idx))
                              toast.success('Option deleted')
                            } catch (e) {
                              console.error('Failed to delete option:', e)
                              toast.error(e instanceof Error ? e.message : 'Failed to delete option')
                            } finally {
                              setSavingOptionId(null)
                            }
                          } else {
                            setOptions((prev) => prev.filter((_, i) => i !== idx))
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push(`/polls/${id}`)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Icons.spinner className="h-4 w-4 animate-spin mr-2" />} Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
