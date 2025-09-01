"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/ui/icons"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { CreatePollData, ApiResponse } from "@/lib/types"

interface CreatePollFormProps extends React.ComponentProps<typeof Card> {}

export function CreatePollForm({ className, ...props }: CreatePollFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    isPublic: true,
    allowMultipleVotes: false,
    expiresAt: "",
  })
  const [options, setOptions] = React.useState<string[]>(["", ""])

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Validate form data
      if (!formData.title.trim()) {
        toast.error("Poll title is required")
        return
      }

      const validOptions = options.filter(option => option.trim().length > 0)
      if (validOptions.length < 2) {
        toast.error("At least 2 options are required")
        return
      }

      // Prepare poll data
      const pollData: CreatePollData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        isPublic: formData.isPublic,
        allowMultipleVotes: formData.allowMultipleVotes,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        options: validOptions,
      }

      // Submit to API
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      })

      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create poll')
      }

      if (result.success && result.data?.poll) {
        toast.success("Poll created successfully!")
        router.push('/polls')
      } else {
        throw new Error(result.error || 'Failed to create poll')
      }
    } catch (error) {
      console.error('Error creating poll:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create poll')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Fill in the details below to create your poll
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              placeholder="What's your favorite programming language?"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more context about your poll..."
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Public Poll</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anyone to view and vote on this poll
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => updateFormData('isPublic', checked)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowMultipleVotes">Allow Multiple Votes</Label>
                <p className="text-sm text-muted-foreground">
                  Let users vote for multiple options
                </p>
              </div>
              <Switch
                id="allowMultipleVotes"
                checked={formData.allowMultipleVotes}
                onCheckedChange={(checked) => updateFormData('allowMultipleVotes', checked)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Poll Options *</Label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                disabled={isLoading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">End Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => updateFormData('expiresAt', e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to keep the poll open indefinitely
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Poll
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


