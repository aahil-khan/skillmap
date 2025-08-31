"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Target, Award, Clock, ArrowRight, Briefcase, BookOpen, Code, Settings, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ChartContainer } from "@/components/ui/chart"
import { apiFetch } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface SkillCategory {
  name: string
  value: number
  color: string
}

interface WorkExperience {
  title: string
  company: string
  duration: string
  description: string
  skills: string[]
}

interface RecommendedRole {
  title: string
  match: number
  description: string
  missingSkills: string[]
}

const COLORS = ["#8b1538", "#2f5f5f", "#4a90e2", "#f39c12", "#27ae60", "#9b59b6"]

export default function DashboardOverviewPage() {
  const [resumeScore, setResumeScore] = useState<number>(0)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [targetScore, setTargetScore] = useState<number | null>(null)
  const [scoreError, setScoreError] = useState<boolean>(false)
  const [isFetchingScore, setIsFetchingScore] = useState<boolean>(false)

  useEffect(() => {
    // Get analysis data from localStorage (if any)
    const analysis = localStorage.getItem("skill-analysis")
    if (analysis) {
      setAnalysisData(JSON.parse(analysis))
    }

    // Fetch ATS score
    const fetchATSScore = async () => {
      setIsFetchingScore(true)
      setScoreError(false)
      setResumeScore(0)
      
      try {
        console.log('🔄 Starting ATS score fetch...')
        
        // Get the current Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('🔐 Session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasAccessToken: !!session?.access_token,
          tokenLength: session?.access_token?.length || 0
        })
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          throw new Error('Authentication session error')
        }
        
        if (!session?.access_token) {
          console.error('❌ No access token in session')
          throw new Error('No authentication token available')
        }
        
        // Use the session token directly for the API call
        const response = await fetch('http://localhost:5005/ats-score', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })
        
        console.log('📡 API Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('✅ ATS Score data received:', data)
        
        if (data.success && data.atsScore && data.atsScore.ats_score) {
          setTargetScore(data.atsScore.ats_score)
          setScoreError(false)
        } else {
          console.error('Invalid API response structure:', data)
          setScoreError(true)
          setTargetScore(null)
        }
      } catch (error) {
        console.error('❌ Failed to fetch ATS score:', error)
        setScoreError(true)
        setTargetScore(null)
      } finally {
        setIsFetchingScore(false)
      }
    }

    fetchATSScore()
  }, [])

  // Score animation effect
  useEffect(() => {
    if (targetScore !== null && !isFetchingScore) {
      let intervalId: NodeJS.Timeout | null = null
      let score = 0
      
      intervalId = setInterval(() => {
        score += 2
        setResumeScore(score)
        if (score >= targetScore) {
          setResumeScore(targetScore)
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
      }, 50)

      return () => {
        if (intervalId) {
          clearInterval(intervalId)
        }
      }
    }
  }, [targetScore, isFetchingScore])

  // Mock data - in real app, this would come from API
  const skillCategories: SkillCategory[] = [
    { name: "Frontend", value: 35, color: "#8b1538" },
    { name: "Backend", value: 25, color: "#2f5f5f" },
    { name: "Database", value: 15, color: "#4a90e2" },  
    { name: "DevOps", value: 10, color: "#f39c12" },
    { name: "Soft Skills", value: 15, color: "#27ae60" },
  ]

  const topSkills: string[] = analysisData?.keySkills || [
    "JavaScript", "React", "Node.js", "Python", "SQL", "Git",
    "CSS", "HTML", "TypeScript", "MongoDB", "Express.js", "RESTful APIs",
  ]

  const workExperience: WorkExperience[] = analysisData?.workExperience || [
    {
      title: "Software Developer",
      company: "Tech Solutions Inc.",
      duration: "Jan 2022 - Present",
      description: "Developed and maintained web applications using React and Node.js.",
      skills: ["React", "Node.js", "JavaScript", "CSS"],
    },
    {
      title: "Junior Developer",
      company: "StartupXYZ",
      duration: "Jun 2021 - Dec 2021",
      description: "Assisted in building responsive websites and mobile applications.",
      skills: ["HTML", "CSS", "JavaScript", "React Native"],
    },
  ]

  const recommendedRoles: RecommendedRole[] = [
    {
      title: "Frontend Developer",
      match: 92,
      description: "Perfect match for your React and JavaScript skills",
      missingSkills: ["Vue.js", "Angular"],
    },
    {
      title: "Full Stack Developer",
      match: 87,
      description: "Your backend and frontend experience aligns well",
      missingSkills: ["Docker", "Kubernetes"],
    },
    {
      title: "React Developer",
      match: 95,
      description: "Excellent match for specialized React development",
      missingSkills: ["Next.js", "Redux Toolkit"],
    },
  ]

  const recommendations = [
    {
      type: "Course",
      title: "Advanced React Patterns",
      provider: "Frontend Masters",
      reason: "Enhance your React skills for senior-level positions",
    },
    {
      type: "Tool",
      title: "Docker for Developers",
      provider: "Docker Inc.",
      reason: "Learn containerization to boost your DevOps skills",
    },
    {
      type: "Project",
      title: "Build a Microservices App",
      provider: "Self-guided",
      reason: "Practice system design and backend architecture",
    },
  ]

  const retryFetchScore = async () => {
    setIsFetchingScore(true)
    setScoreError(false)
    setResumeScore(0)
    
    // Check if we have a token
    const token = localStorage.getItem('sb-jwt')
    console.log('Retry - Token exists:', !!token)
    
    try {
      const response = await apiFetch('http://localhost:5005/ats-score')
      console.log('Retry - API Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Retry - API Response data:', data)
      
      if (data.success && data.atsScore && data.atsScore.ats_score) {
        setTargetScore(data.atsScore.ats_score)
        setScoreError(false)
      } else {
        console.error('Retry - Invalid API response structure:', data)
        setScoreError(true)
        setTargetScore(null)
      }
    } catch (error) {
      console.error('Retry - Failed to fetch ATS score:', error)
      setScoreError(true)
      setTargetScore(null)
    } finally {
      setIsFetchingScore(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Enhanced Skill Analysis */}
          <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInLeft animate-delay-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-purple-600" />
                <span>Detailed Skill Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Skill Distribution with Pie Chart */}
                <div>
                  <h3 className="font-semibold mb-4">Skill Distribution</h3>
                  <div className="flex justify-center mb-4">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Skills",
                        },
                      }}
                      className="h-80 w-80"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={skillCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${typeof percent === "number" ? (percent * 100).toFixed(0) : "0"}%`
                            }
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {skillCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {skillCategories.map((category) => (
                      <div key={category.name} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        <span className="text-sm text-gray-500">({category.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Proficiency Breakdown */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Skill Proficiency Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Advanced Skills</span>
                        <Badge className="bg-green-100 text-green-800">
                          {topSkills.filter((_: string, i: number) => i < 4).length} skills
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {topSkills.slice(0, 4).map((skill: string) => (
                          <Badge key={skill} className="bg-green-100 text-green-800 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Intermediate Skills</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {topSkills.filter((_: string, i: number) => i >= 4 && i < 8).length} skills
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {topSkills.slice(4, 8).map((skill: string) => (
                          <Badge key={skill} className="bg-yellow-100 text-yellow-800 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Beginner Skills</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {topSkills.filter((_: string, i: number) => i >= 8).length} skills
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {topSkills.slice(8).map((skill: string) => (
                          <Badge key={skill} className="bg-blue-100 text-blue-800 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resume Insights */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Resume Insights</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{topSkills.length}</div>
                      <div className="text-sm text-blue-700">Skills Extracted</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{workExperience.length}</div>
                      <div className="text-sm text-green-700">Work Experiences</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(
                          workExperience.reduce((acc: number, exp: WorkExperience) => acc + exp.skills.length, 0) / workExperience.length,
                        )}
                      </div>
                      <div className="text-sm text-purple-700">Avg Skills/Role</div>
                    </div>
                  </div>
                </div>

                {/* Skill Trends */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Most Mentioned Skills in Resume</h3>
                  <div className="space-y-2">
                    {topSkills.slice(0, 6).map((skill: string, index: number) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{skill}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={100 - index * 15} className="w-20 h-2" />
                          <span className="text-xs text-gray-500">{100 - index * 15}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Matching */}
          <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInLeft animate-delay-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-green-600" />
                <span>Role Matching</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedRoles.map((role, index) => (
                  <div
                    key={role.title}
                    className={`p-4 border rounded-lg hover:bg-gray-50 transition-all duration-300 animate-slideInRight animate-delay-${index * 100}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{role.title}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{role.match}%</div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                    <Progress value={role.match} className="mb-2 h-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Missing Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.missingSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs bg-red-50 text-red-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInLeft animate-delay-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-orange-600" />
                <span>Work Experience</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workExperience.map((exp: WorkExperience, index: number) => (
                  <div key={index} className="relative pl-6 border-l-2 border-gray-200 last:border-l-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                    <div className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                          <p className="text-blue-600 font-medium">{exp.company}</p>
                        </div>
                        <Badge variant="outline" className="bg-gray-50">
                          <Clock className="w-3 h-3 mr-1" />
                          {exp.duration}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{exp.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {exp.skills.map((skill: string) => (
                          <Badge key={skill} className="bg-green-100 text-green-800 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resume Score */}
          <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInRight">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-yellow-600" />
                <span>Resume Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {isFetchingScore ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-600">Fetching your resume score...</p>
                </div>
              ) : scoreError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">Could not fetch score</p>
                  <Button 
                    onClick={retryFetchScore}
                    className="skillmap-button text-white"
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              ) : targetScore !== null ? (
                <>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#8b1538"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(resumeScore / 100) * 314} 314`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{resumeScore}</div>
                        <div className="text-sm text-gray-600">out of 100</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Your resume shows strong technical skills with room for improvement in soft skills and
                    certifications.
                  </p>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInRight animate-delay-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-green-600" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg hover:bg-gray-50 transition-all duration-300 animate-fadeIn animate-delay-${index * 100}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {rec.type === "Course" && <BookOpen className="w-4 h-4 text-blue-600" />}
                        {rec.type === "Tool" && <Settings className="w-4 h-4 text-blue-600" />}
                        {rec.type === "Project" && <Code className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {rec.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{rec.provider}</p>
                        <p className="text-xs text-gray-500">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button asChild variant="outline" className="w-full hover-lift bg-transparent">
                <Link href="/results">
                  View Detailed Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
