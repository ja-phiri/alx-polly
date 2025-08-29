'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { BarChart3, Users, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Create and Vote on
            <span className="text-primary"> Polls</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Make decisions together with PollMaster. Create polls, gather opinions, 
            and get real-time results from your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link href="/polls/create">
                  <Button size="lg" className="text-lg px-8">
                    Create Poll
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/polls">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Browse Polls
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Create Polls</CardTitle>
              <CardDescription>
                Easily create polls with multiple options, descriptions, and expiration dates.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Gather Opinions</CardTitle>
              <CardDescription>
                Share polls with your community and collect real-time responses.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Real-time Results</CardTitle>
              <CardDescription>
                See results update in real-time with beautiful charts and analytics.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription>
                Join thousands of users making decisions together through polls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <Link href="/polls/create">
                  <Button size="lg" className="w-full">
                    Create Your First Poll
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="w-full">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
