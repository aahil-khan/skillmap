"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ErrorAlert } from "@/components/ui/error-alert"
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight, 
  Menu, 
  User,
  Target,
  GraduationCap,
  Lightbulb,
  ArrowUpRight,
  BookOpen,
  Code,
  Users,
  GitBranch,
  ChevronUp,
  ChevronDown
} from "lucide-react"
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

            <div className={`grid gap-6 md:grid-cols-1 ${
              // Calculate grid columns based on number of non-empty sections
              (() => {
                const sections = [
                  categoryAnalysis.skills.gaps.length > 0,
                  categoryAnalysis.skills.needs_improvement.length > 0,
                  categoryAnalysis.skills.present.length > 0
                ].filter(Boolean).length;
                
                switch(sections) {
                  case 1: return 'lg:grid-cols-1 max-w-2xl mx-auto';
                  case 2: return 'lg:grid-cols-2';
                  default: return 'lg:grid-cols-3';
                }
              })()
            }`}>
              {/* Skills Gaps */}
              {categoryAnalysis.skills.gaps.length > 0 && (
                <Card className="animate-slideInUp animate-delay-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-700" />
                      <span className="text-red-700">Missing Skills ({categoryAnalysis.skills.gaps.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                      style={{ height: 'calc(3 * 120px)', maxHeight: '360px' }}
                    >
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
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Skills to Improve */}
              {categoryAnalysis.skills.needs_improvement.length > 0 && (
                <Card className="animate-slideInUp animate-delay-400">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-yellow-700" />
                      <span className="text-yellow-700">Needs Improvement ({categoryAnalysis.skills.needs_improvement.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                      style={{ height: 'calc(3 * 120px)', maxHeight: '360px' }}
                    >
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
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strong Skills */}
              {categoryAnalysis.skills.present.length > 0 && (
                <Card className="animate-slideInUp animate-delay-600">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-700" />
                      <span className="text-green-700">Strong Skills ({categoryAnalysis.skills.present.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                      style={{ height: 'calc(3 * 120px)', maxHeight: '360px' }}
                    >
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
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}

        {/* Summary Section */}
        <Card className="animate-fadeInUp animate-delay-800 border-2 border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
            <CardTitle className="flex items-center text-2xl">
              <Brain className="mr-3 h-7 w-7 text-blue-600" />
              Personalized Learning Recommendations
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">Your customized roadmap based on your skills analysis</p>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {/* Target Area */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-md">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                <Target className="h-6 w-6 mr-3" />
                Target Area
              </h3>
              <p className="text-blue-800 text-lg leading-relaxed">
                Based on your goal, I can see you're targeting <span className="font-bold text-blue-900 bg-blue-200 px-2 py-1 rounded">{analysis.user_goal}</span>
              </p>
            </div>

            {/* Strengths Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-md">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-3" />
                Your Strengths
              </h3>
              <div className="space-y-3">
                {analysis.analysis.map((category) => 
                  category.skills.present.length > 0 && (
                    <div key={category.detected_category} className="bg-white p-4 rounded-lg border border-green-200">
                      <span className="font-bold text-green-900 text-lg">{category.detected_category}:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {category.skills.present.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Learning Path */}
            <div className="relative mt-8 pb-8">
              {/* Timeline header */}
              <div className="flex items-center mb-12">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 ml-4">Your Learning Path</h3>
              </div>

              {/* Timeline */}
              <div className="relative max-h-[600px] overflow-y-auto max-w-3xl mx-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 hover:scrollbar-thumb-blue-300 pl-32 pr-8">
                {/* Vertical line with gradient and glow */}
                <div className="absolute left-[157px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300">
                  <div className="absolute inset-0 bg-blue-400 opacity-25 blur-sm"></div>
                </div>

                {/* Timeline items */}
                {analysis.analysis.flatMap((category, categoryIndex) => 
                  category.skills.gaps.map((skill, index) => (
                    <div key={skill.name} className="relative mb-12 ml-20">
                      {/* Timeline dot, connector, and phase label */}
                      <div className="absolute -left-[40px] flex flex-col items-center top-4">
                        {/* Phase number and connecting line */}
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full border-4 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)] bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold">
                            {categoryIndex + index + 1}
                          </div>
                          {/* Connecting arrow */}
                          {(categoryIndex + index + 1) < analysis.analysis.flatMap(c => c.skills.gaps).length && (
                            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-blue-200">
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-4 h-0.5 bg-blue-200"></div>
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 -rotate-45 w-4 h-0.5 bg-blue-200"></div>
                            </div>
                          )}
                        </div>
                        {/* Phase label - Fixed positioning */}
                        <div className="absolute -left-28 top-1/2 -translate-y-1/2 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            Phase {categoryIndex + index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Content card with enhanced hover effect */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-200 relative">
                        {/* Decorative top border gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-xl"></div>
                        {/* Connecting line to next card */}
                        {(categoryIndex + index + 1) < analysis.analysis.flatMap(c => c.skills.gaps).length && (
                          <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2 flex items-center justify-center w-8 h-8">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-200 to-transparent"></div>
                          </div>
                        )}
                        
                        {/* Skill header */}
                        <div className="flex items-start justify-between mb-4 pt-2">
                          <h4 className="text-lg font-semibold text-gray-900">{skill.name}</h4>
                          <span className="px-4 py-1 text-sm rounded-full bg-blue-50 text-blue-700 font-medium">
                            Phase {categoryIndex + index + 1}
                          </span>
                        </div>

                        {/* Skill description */}
                        <p className="text-gray-600 mb-4 leading-relaxed">{skill.description}</p>

                        {/* Recommendation section with enhanced styling */}
                        {skill.recommendation && (
                          <div className="flex items-start mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="p-2 rounded-full bg-blue-200 mr-3">
                              <Lightbulb className="h-5 w-5 text-blue-700" />
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-blue-800 mb-1">Pro Tip</h5>
                              <p className="text-sm text-blue-700 leading-relaxed">{skill.recommendation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Next Steps */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-md">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                <ArrowUpRight className="h-6 w-6 mr-3" />
                Recommended Next Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <BookOpen className="h-5 w-5" />,
                    text: "Complete courses on core missing skills first",
                    color: "bg-purple-100 text-purple-700 border-purple-300"
                  },
                  {
                    icon: <Code className="h-5 w-5" />,
                    text: "Build small projects to practice new concepts",
                    color: "bg-pink-100 text-pink-700 border-pink-300"
                  },
                  {
                    icon: <Users className="h-5 w-5" />,
                    text: "Join relevant communities and forums",
                    color: "bg-indigo-100 text-indigo-700 border-indigo-300"
                  },
                  {
                    icon: <GitBranch className="h-5 w-5" />,
                    text: "Create a portfolio showcasing your progress",
                    color: "bg-violet-100 text-violet-700 border-violet-300"
                  }
                ].map((step, i) => (
                  <div key={i} className={`flex items-start space-x-3 p-4 rounded-lg border-2 ${step.color} shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex-shrink-0 mt-1">{step.icon}</div>
                    <span className="text-sm font-medium leading-relaxed">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
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
