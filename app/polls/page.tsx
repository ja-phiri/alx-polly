"use client"

import { useState } from "react"
import { PollsList } from "@/components/polls/polls-list"
import { Button } from "@/components/ui/button"
import { Plus, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function PollsPage() {
  const [showPublicOnly, setShowPublicOnly] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Polls</h1>
          <p className="text-muted-foreground">
            Discover and vote on polls created by the community
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowPublicOnly(!showPublicOnly)}
            className="flex items-center gap-2"
          >
            {showPublicOnly ? (
              <>
                <Eye className="h-4 w-4" />
                Public Only
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                All Polls
              </>
            )}
          </Button>
          <Link href="/polls/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          </Link>
        </div>
      </div>
      
      <PollsList publicOnly={showPublicOnly} />
      </div>
    </div>
  )
}


