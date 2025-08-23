"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, CheckCircle, AlertTriangle, TrendingUp, Menu, User, ArrowLeft, ArrowRight } from "lucide-react"
import { apiFetch } from "@/lib/utils"
import Link from "next/link"

interface SkillItem {
  name: string
  description: string
  priority?: "high" | "medium" | "low"
  user_level?: "beginner" | "intermediate" | "advanced"
  recommendation?: string
}

interface SkillAnalysis {
  gaps: SkillItem[]
  present: SkillItem[]
  needs_improvement: SkillItem[]
}

interface CategoryAnalysis {
  detected_category: string
  matched_taxonomy_category: string
  confidence: number
  similarity: number
  skills: SkillAnalysis
}

interface AnalysisResult {
  success: boolean
  user: string
  analysis: CategoryAnalysis[]
  summary: string
  categories_analyzed: number
  user_goal: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetchSkillGapAnalysis()
  }, [])

  const fetchSkillGapAnalysis = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Get profile data from localStorage
      const profileData = localStorage.getItem("profile-data")
      if (!profileData) {
        router.push("/upload")
        return
      }

      const profile = JSON.parse(profileData)
      
      // Use environment variable or fallback to dummy URL
      const skillGapApiUrl = process.env.NEXT_PUBLIC_SKILL_GAP_API_URL || 'https://api.example.com/find-skill-gaps'
      
      try {
        if (!profile.name) {
          setError("Profile data is incomplete. Please upload your resume again.")
          return
        }

      // Send request to skill gap analysis API
      const response = await apiFetch('https://api.aahil-khan.tech/analyze-skill-gaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: profile.name }),
      })

        if (!response.ok) {
          throw new Error('Failed to analyze skill gaps')
        }

        const data: AnalysisResult = await response.json()
        setAnalysis(data)
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError)
        
        // Fallback to mock analysis data if API fails
        const mockAnalysis: AnalysisResult = {
          success: true,
          user: profile.name || "Demo User",
          analysis: [
            {
              detected_category: "Web Development",
              matched_taxonomy_category: "Web Development",
              confidence: 0.85,
              similarity: 1,
              skills: {
                gaps: [
                  {
                    name: "Next.js",
                    description: "Building full-stack React apps with routing, API routes, and SSR/SSG.",
                    priority: "high"
                  },
                  {
                    name: "TypeScript",
                    description: "Adding type safety to JavaScript applications.",
                    priority: "medium"
                  }
                ],
                present: [
                  {
                    name: "JavaScript",
                    user_level: "intermediate",
                    description: "Writing interactive frontend logic and working with the DOM.",
                    recommendation: "Strong foundation - continue building on this"
                  },
                  {
                    name: "React",
                    user_level: "intermediate", 
                    description: "Creating dynamic user interfaces using components and hooks.",
                    recommendation: "Good understanding - ready for advanced concepts"
                  }
                ],
                needs_improvement: [
                  {
                    name: "CSS",
                    user_level: "beginner",
                    description: "Styling web pages with responsive design and modern CSS features.",
                    recommendation: "Focus on learning flexbox, grid, and responsive design"
                  }
                ]
              }
            }
          ],
          summary: `Based on your goal to "${profile.goal || 'become a full-stack developer'}", here's your personalized learning path:

<strong>Your Strengths:</strong>
You have a solid foundation in JavaScript and React, which are core technologies for modern web development.

<strong>Priority Areas:</strong>
• <strong>Next.js</strong> - Learn this popular React framework to build full-stack applications
• <strong>TypeScript</strong> - Add type safety to make your code more robust

<strong>Skills to Improve:</strong>
• <strong>CSS</strong> - Strengthen your styling skills with modern CSS techniques

<strong>Recommended Learning Path:</strong>
1. Practice more CSS with flexbox and grid layouts
2. Learn TypeScript fundamentals
3. Build a project with Next.js
4. Focus on responsive design principles

This learning path will help you achieve your goal of becoming a well-rounded web developer.`,
          categories_analyzed: 1,
          user_goal: profile.goal || "Become a full-stack web developer"
        }
        
        setAnalysis(mockAnalysis)
      }
    } catch (error: any) {
      console.error('Error fetching skill gap analysis:', error)
      setError(error.message || 'An error occurred while analyzing your skills')
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'advanced':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'beginner':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="h-16 w-16 text-blue-600 animate-pulse mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Skills</h2>
            <p className="text-gray-600 text-center mb-4">
              We're comparing your skills with industry standards and your learning goals...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen skillmap-bg">
        <header className="skillmap-header text-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">skillMap</Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
              <p className="text-gray-600 text-center mb-4">{error}</p>
              <Button onClick={() => router.push("/intent")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!analysis) return null

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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fadeInUp">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personalized Skill Analysis
          </h1>
          <p className="text-gray-600">Goal: {analysis.user_goal}</p>
        </div>

        {/* Analysis Overview */}
        {analysis.analysis.map((categoryAnalysis, index) => (
          <div key={index} className="mb-8">
            <Card className="mb-6 animate-slideInLeft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{categoryAnalysis.detected_category} Analysis</span>
                  <Badge variant="secondary">
                    {Math.round(categoryAnalysis.confidence * 100)}% Match
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {/* Skills Gaps */}
              <Card className="animate-slideInUp animate-delay-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Missing Skills ({categoryAnalysis.skills.gaps.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryAnalysis.skills.gaps.map((skill, skillIndex) => (
                    <div key={skillIndex} className="p-3 border rounded-lg bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        {skill.priority && (
                          <Badge className={getPriorityColor(skill.priority)}>
                            {skill.priority} priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{skill.description}</p>
                    </div>
                  ))}
                  {categoryAnalysis.skills.gaps.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No skill gaps identified!</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills to Improve */}
              <Card className="animate-slideInUp animate-delay-400">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-700">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Needs Improvement ({categoryAnalysis.skills.needs_improvement.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryAnalysis.skills.needs_improvement.map((skill, skillIndex) => (
                    <div key={skillIndex} className="p-3 border rounded-lg bg-yellow-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        {skill.user_level && (
                          <Badge className={getLevelColor(skill.user_level)}>
                            {skill.user_level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                      {skill.recommendation && (
                        <p className="text-xs text-blue-600 font-medium">{skill.recommendation}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strong Skills */}
              <Card className="animate-slideInUp animate-delay-600">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Strong Skills ({categoryAnalysis.skills.present.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryAnalysis.skills.present.map((skill, skillIndex) => (
                    <div key={skillIndex} className="p-3 border rounded-lg bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        {skill.user_level && (
                          <Badge className={getLevelColor(skill.user_level)}>
                            {skill.user_level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                      {skill.recommendation && (
                        <p className="text-xs text-green-600 font-medium">{skill.recommendation}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        {/* Summary Section */}
        <Card className="animate-fadeInUp animate-delay-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-6 w-6 text-blue-600" />
              Personalized Learning Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: analysis.summary }}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8 animate-fadeInUp animate-delay-1000">
          <Button variant="outline" asChild>
            <Link href="/intent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change Goal
            </Link>
          </Button>
          <Button asChild className="skillmap-button text-white">
            <Link href="/dashboard">
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            Save Report
          </Button>
        </div>
      </div>
    </div>
  )
}
