"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ErrorAlert } from "@/components/ui/error-alert"
import { Brain, CheckCircle, AlertTriangle, TrendingUp, ArrowLeft, ArrowRight, Menu, User, Loader2 } from "lucide-react"
import { api, APIErrorClass, isAuthError } from "@/lib/api-error-handler"
import { getBackendUrl, BACKEND_ENDPOINTS } from "@/lib/config"
import Link from "next/link"
import { PageErrorBoundary } from "@/components/GlobalErrorBoundary"
import { getUserProfile } from "@/lib/api"

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

function ResultsPageContent() {
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
      // Check if user has profile data in database
      const profile = await getUserProfile()
      
      if (!profile.profile || !profile.profile.name) {
        setError("Profile not found. Please upload your resume first.")
        setTimeout(() => router.push("/upload"), 2000)
        return
      }

      // Use Next.js API proxy route to avoid CORS issues
      const data: AnalysisResult = await api.post('/api/analyze-skill-gaps', {})
      
      setAnalysis(data)
      
    } catch (err) {
      console.error('Error fetching skill gap analysis:', err)
      
      if (err instanceof APIErrorClass) {
        // Handle authentication errors
        if (isAuthError(err)) {
          setError('Your session has expired. Please log in again.')
          setTimeout(() => router.push('/auth'), 2000)
          return
        }
        
        // Display user-friendly error message
        setError(err.getUserMessage())
        
        // Log request ID for debugging
        if (err.requestId) {
          console.error('Request ID for debugging:', err.requestId)
        }
      } else {
        setError('An unexpected error occurred while analyzing your skills.')
      }
      
      // Note: Removed mock data fallback - errors should be shown to user
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
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <ErrorAlert
            error={error}
            onDismiss={() => setError("")}
            className="mb-6"
          />
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fadeInUp">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personalized Skill Analysis
          </h1>
          <p className="text-gray-600">Goal: {analysis.user_goal}</p>
        </div>

        {/* Navigation Bar at Top */}
        <div className="flex justify-center space-x-4 mb-8 animate-fadeInUp animate-delay-1000">
          <Button
            variant="outline"
            asChild
            className="hover:bg-[#8b1538] hover:text-white transition-colors"
          >
            <Link href="/intent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change Goal
            </Link>
          </Button>
          <Button
            onClick={() => {
              const report = document.getElementById("skillmap-report");
              if (!report) return;
              const printWindow = window.open("", "_blank");
              if (!printWindow) return;
              printWindow.document.write(`
                <html>
                  <head>
                    <title>SkillMap Report</title>
                    <style>
                      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 2rem; background: #f9f9f9; color: #222; }
                      h1 { font-size: 2rem; margin-bottom: 1.5rem; color: #2f5f5f; }
                      h2 { font-size: 1.3rem; margin-top: 2rem; margin-bottom: 1rem; color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.3rem; }
                      h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: #444; }
                      ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
                      ul li, ol li { margin-bottom: 0.3rem; }
                      .section { margin-bottom: 2rem; }
                      .skills-columns { display: flex; gap: 2rem; }
                      .skills-columns > div { flex: 1; background: #fff; border-radius: 8px; box-shadow: 0 1px 4px #e0e0e0; padding: 1rem; }
                      .skills-columns h3 { margin-bottom: 0.5rem; }
                      .recommendations { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px #e0e0e0; padding: 1rem; }
                      strong { color: #2f5f5f; }
                    </style>
                  </head>
                  <body>
                    ${report.innerHTML}
                    <script>
                      window.onload = function() { window.print(); };
                    </script>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.focus();
            }}
            variant="outline"
          >
            Save Report
          </Button>
        {/* Hidden Structured Report for Printing */}
        <div id="skillmap-report" style={{ display: "none" }}>
          <h1>SkillMap Report</h1>
          <div className="section">
            <strong>Name:</strong> {analysis.user}
          </div>
          <div className="section">
            <strong>Goal:</strong> {analysis.user_goal}
          </div>
          {analysis.analysis.map((categoryAnalysis, idx) => (
            <div key={idx} className="section">
              <h2>{categoryAnalysis.detected_category} Analysis</h2>
              <div className="skills-columns">
                <div>
                  <h3>Strong Skills</h3>
                  <ul>
                    {categoryAnalysis.skills.present.length === 0 && <li>None</li>}
                    {categoryAnalysis.skills.present.map((skill, i) => (
                      <li key={i}>{skill.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Needs Improvement</h3>
                  <ul>
                    {categoryAnalysis.skills.needs_improvement.length === 0 && <li>None</li>}
                    {categoryAnalysis.skills.needs_improvement.map((skill, i) => (
                      <li key={i}>{skill.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Missing Skills</h3>
                  <ul>
                    {categoryAnalysis.skills.gaps.length === 0 && <li>None</li>}
                    {categoryAnalysis.skills.gaps.map((skill, i) => (
                      <li key={i}>{skill.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
          <div className="section recommendations">
            <h2>Learning Recommendations</h2>
            <div dangerouslySetInnerHTML={{ __html: analysis.summary }} />
          </div>
        </div>
          <Button
            variant="outline"
            asChild
            className="hover:bg-[#2f5f5f] hover:text-white transition-colors"
          >
            <Link href="/dashboard">
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
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
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <PageErrorBoundary>
      <ResultsPageContent />
    </PageErrorBoundary>
  )
}
