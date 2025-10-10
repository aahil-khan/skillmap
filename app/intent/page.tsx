"use client"

import { useState } from "react"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Menu, User, ArrowLeft, ArrowRight, Target } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { apiFetch } from "@/lib/utils"
import { PageErrorBoundary } from "@/components/GlobalErrorBoundary"
import { getUserProfile } from "@/lib/api"

const EXAMPLE_INTENTS = [
  "I want to learn Data Structures and Algorithms",
  "I want to become a full-stack web developer",
  "I want to learn machine learning and AI",
  "I want to get better at system design",
  "I want to learn mobile app development",
  "I want to master DevOps and cloud technologies",
]

function IntentPageContent() {
  useAuthRedirect()
  const router = useRouter()
  const [intent, setIntent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!intent.trim()) return

    setIsLoading(true)
    
    try {
      // Get the Supabase session token
      const { supabase } = await import('@/lib/supabase')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.access_token) {
        console.error('Session error or no token:', sessionError)
        throw new Error('Authentication required')
      }

      // Send intent to our Next.js API proxy route to convert to standalone question
      const response = await fetch('/api/convert-to-standalone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal: intent.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to process intent')
      }

      const data = await response.json()
      const refinedIntent = data.goalResponse || data.standalone || intent.trim()

      console.log('Goal refined and stored in database:', refinedIntent)
      
      // No need to store in localStorage - backend already stored in learning_goals table!
      // The /convert-to-standalone endpoint stores:
      // - original_goal
      // - refined_goal
      // - status: 'active'
      // - All in the learning_goals table

      // Send profile data to backend (will also calculate ATS score)
      try {
        const profile = await getUserProfile()
        
        const userResponse = await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: profile.profile?.name || 'User',
            goal: refinedIntent,
            technical_skills: profile.technical_skills || [],
          }),
        })

        if (userResponse.ok) {
          console.log('Profile sent to backend successfully')
        }
      } catch (profileError) {
        console.warn('Failed to send profile to backend:', profileError)
      }

      console.log('Goal processed successfully')
      
      router.push("/results")
      
    } catch (apiError) {
      console.error('API call failed:', apiError)
      
      // If API fails, still try to navigate
      // The backend might have still stored the goal
      alert('There was an error processing your goal. Please try again.')
      
    } finally {
      setIsLoading(false)
    }
  }

  const selectExample = (example: string) => {
    setIntent(example)
  }

  return (
    <div className="min-h-screen skillmap-bg">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Card className="shadow-lg border-0 card-hover animate-scaleIn">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">What do you want to learn?</CardTitle>
            <p className="text-gray-600 mt-2">
              Tell us your learning goal so we can provide personalized recommendations for the skills you need to focus
              on.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Intent Input */}
            <div className="animate-slideInLeft">
              <Label htmlFor="intent" className="text-base font-medium">
                Your Learning Goal
              </Label>
              <Textarea
                id="intent"
                placeholder="e.g., I want to learn Data Structures and Algorithms to prepare for technical interviews"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="mt-2 min-h-32 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                required
              />
            </div>

            {/* Example Intents */}
            <div>
              <Label className="text-base font-medium mb-3 block">Popular Learning Goals</Label>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_INTENTS.map((example) => (
                  <Badge
                    key={example}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105 p-2 text-sm"
                    onClick={() => selectExample(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips for better recommendations:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Be specific about what you want to achieve</li>
                <li>• Mention your timeline if you have one</li>
                <li>• Include the context (job interviews, projects, etc.)</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" asChild>
                <Link href="/skills">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Skills
                </Link>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!intent.trim() || isLoading}
                className="skillmap-button text-white min-w-40"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Analyzing<span className="loading-dots"></span>
                  </span>
                ) : (
                  "Get My Recommendations"
                )}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function IntentPage() {
  return (
    <PageErrorBoundary>
      <IntentPageContent />
    </PageErrorBoundary>
  )
}
