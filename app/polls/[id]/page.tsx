import { Metadata } from "next"
import { PollView } from "@/components/polls/poll-view"
import { notFound } from "next/navigation"

interface PollPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PollPageProps): Promise<Metadata> {
  // TODO: Fetch poll data and generate metadata
  return {
    title: `Poll | Polling App`,
    description: "View and vote on this poll",
  }
}

export default async function PollPage({ params }: PollPageProps) {
  // TODO: Fetch poll data by ID
  const pollId = params.id
  
  // Placeholder - replace with actual data fetching
  if (!pollId) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <PollView pollId={pollId} />
    </div>
  )
}


