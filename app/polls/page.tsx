import { Metadata } from "next"
import { PollsList } from "@/components/polls/polls-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Polls | Polling App",
  description: "Browse and vote on polls created by the community",
}

export default function PollsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Polls</h1>
          <p className="text-muted-foreground">
            Discover and vote on polls created by the community
          </p>
        </div>
        <Link href="/polls/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </div>
      
      <PollsList />
    </div>
  )
}


