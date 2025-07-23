"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Menu, User, ArrowLeft, ArrowRight, Target } from "lucide-react"
import Link from "next/link"

const EXAMPLE_INTENTS = [
  "I want to learn Data Structures and Algorithms",
  "I want to become a full-stack web developer",
  "I want to learn machine learning and AI",
  "I want to get better at system design",
  "I want to learn mobile app development",
  "I want to master DevOps and cloud technologies",
]

export default function IntentPage() {
  const router = useRouter()
  const [intent, setIntent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!intent.trim()) return

    setIsLoading(true)
    
    try {
      // Use environment variables or fallback to dummy URLs
      const convertToStandaloneUrl = process.env.NEXT_PUBLIC_CONVERT_API_URL || 'https://api.example.com/convertToStandalone'
      const sendProfileUrl = process.env.NEXT_PUBLIC_PROFILE_API_URL || 'https://api.example.com/send_user_profile'
      
      try {
        // Send intent to backend to convert to standalone question
        const response = await fetch(convertToStandaloneUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ goal: intent.trim() }),
        })

        if (!response.ok) {
          throw new Error('Failed to process intent')
        }

        const data = await response.json()
        const refinedIntent = data.goalResponse || data.standalone || intent.trim()

        // Get stored profile data from localStorage
        const storedProfile = localStorage.getItem("profile-data")
        let profileData = {}
        
        if (storedProfile) {
          profileData = JSON.parse(storedProfile)
        }

        // Add goal property with refined intent
        const updatedProfile = {
          ...profileData,
          goal: refinedIntent
        }

        // Try to send profile to backend
        try {
          const userResponse = await fetch(sendProfileUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProfile),
          })

          if (userResponse.ok) {
            console.log('Profile sent to backend successfully')
          }
        } catch (profileError) {
          console.warn('Failed to send profile to backend:', profileError)
        }

        // Save updated profile back to localStorage
        localStorage.setItem("profile-data", JSON.stringify(updatedProfile))
        localStorage.setItem("user-intent", refinedIntent)

        console.log('Profile updated with goal:', updatedProfile)
      } catch (apiError) {
        console.warn('API call failed, using original intent:', apiError)
        
        // Fallback: use original intent if API fails
        const storedProfile = localStorage.getItem("profile-data")
        let profileData = {}
        
        if (storedProfile) {
          profileData = JSON.parse(storedProfile)
        }

        const updatedProfile = {
          ...profileData,
          goal: intent.trim()
        }

        localStorage.setItem("profile-data", JSON.stringify(updatedProfile))
        localStorage.setItem("user-intent", intent.trim())
      }

      router.push("/results")
    } catch (error) {
      console.error('Error processing intent:', error)
      // Fallback: save original intent and continue
      localStorage.setItem("user-intent", intent.trim())
      router.push("/results")
    } finally {
      setIsLoading(false)
    }
  }

  const selectExample = (example: string) => {
    setIntent(example)
  }

  return (
    <div className="min-h-screen skillmap-bg">
      {/* Header */}
      <header className="skillmap-header text-white animate-fadeInDown">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Menu className="h-5 w-5" />
              <span className="ml-2 text-sm">explore</span>
            </Button>
          </div>

          <Link href="/" className="text-2xl font-bold">
            skillMap
          </Link>

          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <User className="h-5 w-5" />
            <span className="ml-2 text-sm">login</span>
          </Button>
        </div>
      </header>

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
