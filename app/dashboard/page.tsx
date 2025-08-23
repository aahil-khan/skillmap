"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Menu, User, Download, Calendar, Mail, Target, Award, Clock, ArrowRight, Briefcase, BookOpen, Code, Settings, MapPin, CheckCircle2, Circle, Play, Star, ExternalLink, RefreshCw} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { apiFetch } from "@/lib/utils"


interface UserProfile {
  name: string
  email: string
  resumeUploadDate: string
  title?: string
  bio?: string
}

interface SkillCategory {
  name: string
  value: number
  color: string
}

interface Role {
  title: string
  match: number
  missingSkills: string[]
  description: string
}

interface WorkExperience {
  title: string
  company: string
  duration: string
  description: string
  skills: string[]
}

interface RoadmapPhase {
  id: number
  title: string
  duration: string
  status: "completed" | "current" | "upcoming"
  skills: string[]
  projects: string[]
  resources: {
    type: "course" | "book" | "tutorial" | "practice"
    title: string
    provider: string
    url?: string
    difficulty: "beginner" | "intermediate" | "advanced"
  }[]
  description: string
}

const COLORS = ["#8b1538", "#2f5f5f", "#4a90e2", "#f39c12", "#27ae60", "#9b59b6"]

export default function DashboardPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [resumeScore, setResumeScore] = useState<number>(0)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [targetScore, setTargetScore] = useState<number | null>(null)
  const [scoreError, setScoreError] = useState<boolean>(false)
  const [isFetchingScore, setIsFetchingScore] = useState<boolean>(false)
  const [skillsData, setSkillsData] = useState<any>(null)
  const [skillsError, setSkillsError] = useState<boolean>(false)
  const [isFetchingSkills, setIsFetchingSkills] = useState<boolean>(false)
  const [skillsLoaded, setSkillsLoaded] = useState<boolean>(false)

  // Mock data - in real app, this would come from API
  const skillCategories: SkillCategory[] = [
    { name: "Frontend", value: 35, color: "#8b1538" },
    { name: "Backend", value: 25, color: "#2f5f5f" },
    { name: "Database", value: 15, color: "#4a90e2" },  
    { name: "DevOps", value: 10, color: "#f39c12" },
    { name: "Soft Skills", value: 15, color: "#27ae60" },
  ]

  const topSkills = [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "SQL",
    "Git",
    "HTML",
    "CSS",
    "MongoDB",
    "Express.js",
    "TypeScript",
    "Docker",
    "AWS",
    "REST APIs",
  ]

  const recommendedRoles: Role[] = [
    {
      title: "Full Stack Developer",
      match: 78,
      missingSkills: ["System Design", "Redis", "Kubernetes"],
      description: "Build end-to-end web applications",
    },
    {
      title: "Frontend Developer",
      match: 85,
      missingSkills: ["Vue.js", "Testing", "Web Performance"],
      description: "Create engaging user interfaces",
    },
    {
      title: "Backend Developer",
      match: 72,
      missingSkills: ["Microservices", "GraphQL", "Message Queues"],
      description: "Design scalable server-side systems",
    },
  ]

  const workExperience: WorkExperience[] = [
    {
      title: "Software Engineering Intern",
      company: "Tech Startup Inc.",
      duration: "Jun 2023 - Aug 2023",
      description: "Developed React components and REST APIs for customer dashboard",
      skills: ["React", "Node.js", "MongoDB", "Express.js"],
    },
    {
      title: "Web Development Project",
      company: "Personal Project",
      duration: "Jan 2023 - May 2023",
      description: "Built a full-stack e-commerce application with payment integration",
      skills: ["JavaScript", "HTML", "CSS", "SQL", "Git"],
    },
  ]

  const recommendations = [
    {
      type: "Course",
      title: "Advanced React Patterns",
      provider: "Frontend Masters",
      reason: "Strengthen your React skills for senior roles",
    },
    {
      type: "Tool",
      title: "Docker & Kubernetes",
      provider: "Docker Official",
      reason: "Essential for modern deployment workflows",
    },
    {
      type: "Project",
      title: "Build a Microservices App",
      provider: "Self-guided",
      reason: "Practice system design and backend architecture",
    },
  ]

  // Generate roadmap based on user's goal and current skills
  const generateRoadmap = (goal: string, category: string): RoadmapPhase[] => {
    if (category === "Data Structures & Algorithms") {
      return [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "4-6 weeks",
          status: "completed",
          skills: ["Arrays", "Strings", "Basic Math"],
          projects: ["Array manipulation problems", "String processing challenges"],
          resources: [
            {
              type: "course",
              title: "Introduction to Algorithms",
              provider: "MIT OpenCourseWare",
              difficulty: "beginner",
            },
            {
              type: "practice",
              title: "LeetCode Easy Problems",
              provider: "LeetCode",
              difficulty: "beginner",
            },
          ],
          description: "Master basic data structures and simple algorithms",
        },
        {
          id: 2,
          title: "Core Data Structures",
          duration: "6-8 weeks",
          status: "current",
          skills: ["Linked Lists", "Stacks", "Queues", "Trees"],
          projects: ["Implement a calculator", "Build a file system navigator"],
          resources: [
            {
              type: "book",
              title: "Cracking the Coding Interview",
              provider: "Gayle McDowell",
              difficulty: "intermediate",
            },
            {
              type: "course",
              title: "Data Structures and Algorithms",
              provider: "Coursera",
              difficulty: "intermediate",
            },
          ],
          description: "Deep dive into fundamental data structures",
        },
        {
          id: 3,
          title: "Advanced Algorithms",
          duration: "8-10 weeks",
          status: "upcoming",
          skills: ["Dynamic Programming", "Graph Algorithms", "Greedy Algorithms"],
          projects: ["Shortest path finder", "Optimization problems"],
          resources: [
            {
              type: "course",
              title: "Advanced Algorithms",
              provider: "Stanford Online",
              difficulty: "advanced",
            },
            {
              type: "practice",
              title: "LeetCode Medium/Hard",
              provider: "LeetCode",
              difficulty: "advanced",
            },
          ],
          description: "Master complex algorithmic patterns and optimization",
        },
        {
          id: 4,
          title: "Interview Preparation",
          duration: "4-6 weeks",
          status: "upcoming",
          skills: ["System Design", "Behavioral Questions", "Mock Interviews"],
          projects: ["Design a social media platform", "Build a distributed cache"],
          resources: [
            {
              type: "book",
              title: "Designing Data-Intensive Applications",
              provider: "Martin Kleppmann",
              difficulty: "advanced",
            },
            {
              type: "practice",
              title: "Mock Interview Practice",
              provider: "Pramp",
              difficulty: "intermediate",
            },
          ],
          description: "Prepare for technical interviews at top companies",
        },
      ]
    } else if (category === "Web Development") {
      return [
        {
          id: 1,
          title: "Frontend Fundamentals",
          duration: "6-8 weeks",
          status: "completed",
          skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
          projects: ["Personal portfolio", "Landing page"],
          resources: [
            {
              type: "course",
              title: "The Complete Web Developer Course",
              provider: "Udemy",
              difficulty: "beginner",
            },
            {
              type: "tutorial",
              title: "MDN Web Docs",
              provider: "Mozilla",
              difficulty: "beginner",
            },
          ],
          description: "Master the building blocks of web development",
        },
        {
          id: 2,
          title: "Modern Frontend",
          duration: "8-10 weeks",
          status: "current",
          skills: ["React", "TypeScript", "State Management", "Testing"],
          projects: ["Todo app with React", "E-commerce frontend"],
          resources: [
            {
              type: "course",
              title: "React - The Complete Guide",
              provider: "Udemy",
              difficulty: "intermediate",
            },
            {
              type: "practice",
              title: "React Challenges",
              provider: "Frontend Mentor",
              difficulty: "intermediate",
            },
          ],
          description: "Build dynamic user interfaces with modern frameworks",
        },
        {
          id: 3,
          title: "Backend Development",
          duration: "10-12 weeks",
          status: "upcoming",
          skills: ["Node.js", "Express.js", "Databases", "REST APIs"],
          projects: ["Blog API", "User authentication system"],
          resources: [
            {
              type: "course",
              title: "Node.js Developer Course",
              provider: "The Odin Project",
              difficulty: "intermediate",
            },
            {
              type: "book",
              title: "Node.js Design Patterns",
              provider: "Mario Casciaro",
              difficulty: "advanced",
            },
          ],
          description: "Learn server-side development and database management",
        },
        {
          id: 4,
          title: "Full Stack Integration",
          duration: "8-10 weeks",
          status: "upcoming",
          skills: ["Full Stack Apps", "Deployment", "DevOps", "Performance"],
          projects: ["Social media app", "Real-time chat application"],
          resources: [
            {
              type: "course",
              title: "Full Stack Open",
              provider: "University of Helsinki",
              difficulty: "advanced",
            },
            {
              type: "practice",
              title: "Deploy to Production",
              provider: "Vercel/Netlify",
              difficulty: "intermediate",
            },
          ],
          description: "Combine frontend and backend into production-ready applications",
        },
      ]
    }

    // Default roadmap for other categories
    return [
      {
        id: 1,
        title: "Foundation Phase",
        duration: "4-6 weeks",
        status: "current",
        skills: ["Basic concepts", "Core fundamentals"],
        projects: ["Starter project"],
        resources: [
          {
            type: "course",
            title: "Getting Started",
            provider: "Online Platform",
            difficulty: "beginner",
          },
        ],
        description: "Build a strong foundation in the basics",
      },
    ]
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    // Check if user is logged in using Supabase session
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push("/auth")
        return
      }

      // Get user details from either custom table or auth data
      let userData = null
      const { data: customUserData } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', session.user.id)
        .single()

      if (customUserData) {
        userData = {
          name: customUserData.full_name,
          email: customUserData.email
        }
      } else {
        userData = {
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "User",
          email: session.user.email || ""
        }
      }

      setUserProfile({
        name: userData.name,
        email: userData.email,
        resumeUploadDate: new Date().toLocaleDateString(),
      })
    }

    //Temporary function to fetch ATS score
    const fetchATSScore = async () => {
      setIsFetchingScore(true)
      setScoreError(false)
      setResumeScore(0) // Reset score when fetching
      try {
        const response = await apiFetch('https://api.aahil-khan.tech/ats-score')
        const data = await response.json()
        console.log(data)
        if (data.success && data.atsScore && data.atsScore.ats_score) {
          setTargetScore(data.atsScore.ats_score)
          setScoreError(false)
        } else {
          setScoreError(true)
          setTargetScore(null)
        }
      } catch (error) {
        console.error('Failed to fetch ATS score:', error)
        setScoreError(true)
        setTargetScore(null)
      } finally {
        setIsFetchingScore(false)
      }
    }

    const fetchSkillsBreakdown = async () => {
      setIsFetchingSkills(true)
      setSkillsError(false)
      try {
        const response = await apiFetch('https://api.aahil-khan.tech/skills')
        const data = await response.json()
        console.log('Skills data:', data)
        if (data.success && data.skills) {
          setSkillsData(data.skills)
          setSkillsError(false)
          setSkillsLoaded(true)
        } else {
          setSkillsError(true)
          setSkillsData(null)
          setSkillsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to fetch skills breakdown:', error)
        setSkillsError(true)
        setSkillsData(null)
        setSkillsLoaded(true)
      } finally {
        setIsFetchingSkills(false)
      }
    }

    const initializePage = async () => {
      await checkAuth()
      
      // Get analysis data from localStorage (if any)
      const analysis = localStorage.getItem("skill-analysis")
      if (analysis) {
        setAnalysisData(JSON.parse(analysis))
      }

      // Fetch ATS score and skills data in parallel
      await Promise.all([
        fetchATSScore(),
        fetchSkillsBreakdown()
      ])
      
      // Dashboard will show once skills are loaded (handled by skillsLoaded state)
    }

    initializePage()

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }, [router])

  // Separate effect to handle score animation when targetScore changes
  useEffect(() => {
    if (targetScore !== null && !isLoading && !isFetchingScore) {
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
  }, [targetScore, isLoading, isFetchingScore])

  // Effect to handle loading state when skills are loaded
  useEffect(() => {
    if (skillsLoaded) {
      setIsLoading(false)
    }
  }, [skillsLoaded])

  const retryFetchScore = async () => {
    setIsFetchingScore(true)
    setScoreError(false)
    setResumeScore(0) // Reset score when retrying
    try {
      const response = await apiFetch('https://api.aahil-khan.tech/ats-score')
      const data = await response.json()
      console.log(data)
      if (data.success && data.atsScore && data.atsScore.ats_score) {
        setTargetScore(data.atsScore.ats_score)
        setScoreError(false)
      } else {
        setScoreError(true)
        setTargetScore(null)
      }
    } catch (error) {
      console.error('Failed to fetch ATS score:', error)
      setScoreError(true)
      setTargetScore(null)
    } finally {
      setIsFetchingScore(false)
    }
  }

  const retryFetchSkills = async () => {
    setIsFetchingSkills(true)
    setSkillsError(false)
    try {
      const response = await apiFetch('https://api.aahil-khan.tech/skills')
      const data = await response.json()
      console.log('Skills data:', data)
      if (data.success && data.skills) {
        setSkillsData(data.skills)
        setSkillsError(false)
        setSkillsLoaded(true)
      } else {
        setSkillsError(true)
        setSkillsData(null)
        setSkillsLoaded(true)
      }
    } catch (error) {
      console.error('Failed to fetch skills breakdown:', error)
      setSkillsError(true)
      setSkillsData(null)
      setSkillsLoaded(true)
    } finally {
      setIsFetchingSkills(false)
    }
  }

  const exportToPDF = () => {
    // Mock PDF export
    alert("PDF export functionality would be implemented here!")
  }

  if (isLoading || !skillsLoaded) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <Card className="w-96 shadow-lg border-0 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Please log in to view your dashboard</h3>
            <Button asChild className="skillmap-button text-white rounded-full">
              <Link href="/auth">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const roadmapPhases = analysisData
    ? generateRoadmap(analysisData.goal, analysisData.category)
    : generateRoadmap("Learn Web Development", "Web Development")

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

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <User className="h-5 w-5" />
              <span className="ml-2 text-sm">{userProfile.name}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8 animate-fadeInUp">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your SkillMap Dashboard</h1>
            <p className="text-gray-600">Track your progress and discover new opportunities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="hover-lift bg-transparent">
              <Link href="/leetcode">
                <Code className="mr-2 h-4 w-4 text-orange-600" />
                LeetCode Analysis
              </Link>
            </Button>
            <Button onClick={exportToPDF} className="skillmap-button text-white hover-lift">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Learning Roadmap</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-6">
                {/* Profile Summary */}
                <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInLeft">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-6 w-6 text-blue-600" />
                        <span>Profile Summary</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (isEditingProfile) {
                            // Save changes to Supabase
                            if (editedProfile) {
                              setUserProfile(editedProfile)
                              
                              // Update in Supabase
                              const { data: { session } } = await supabase.auth.getSession()
                              if (session?.user) {
                                await supabase
                                  .from('users')
                                  .upsert({
                                    id: session.user.id,
                                    email: editedProfile.email,
                                    full_name: editedProfile.name
                                  })
                              }
                            }
                          } else {
                            setEditedProfile(userProfile)
                          }
                          setIsEditingProfile(!isEditingProfile)
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {isEditingProfile ? "Save" : "Edit"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Full Name</Label>
                          <Input
                            id="edit-name"
                            value={editedProfile?.name || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEditedProfile((prev: UserProfile | null) => (prev ? { ...prev, name: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-email">Email Address</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editedProfile?.email || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEditedProfile((prev: UserProfile | null) => (prev ? { ...prev, email: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-title">Professional Title</Label>
                          <Input
                            id="edit-title"
                            placeholder="e.g., Full Stack Developer, Data Scientist"
                            value={editedProfile?.title || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEditedProfile((prev: UserProfile | null) => (prev ? { ...prev, title: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-bio">Bio</Label>
                          <Textarea
                            id="edit-bio"
                            placeholder="Tell us about yourself..."
                            value={editedProfile?.bio || ""}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setEditedProfile((prev: UserProfile | null) => (prev ? { ...prev, bio: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{userProfile.name}</p>
                            <p className="text-sm text-gray-600">Full Name</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{userProfile.email}</p>
                            <p className="text-sm text-gray-600">Email Address</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{userProfile.resumeUploadDate}</p>
                            <p className="text-sm text-gray-600">Resume Upload</p>
                          </div>
                        </div>
                        {userProfile.title && (
                          <div className="md:col-span-3 mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="font-semibold text-blue-900">{userProfile.title}</p>
                            {userProfile.bio && <p className="text-sm text-blue-700 mt-1">{userProfile.bio}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Skill Analysis */}
                <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInLeft animate-delay-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-6 w-6 text-purple-600" />
                      <span>Detailed Skill Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isFetchingSkills ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-600">Fetching your skills analysis...</p>
                      </div>
                    ) : skillsError ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-red-500 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-gray-600 mb-4">Could not fetch skills data</p>
                        <Button 
                          onClick={retryFetchSkills}
                          className="skillmap-button text-white"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    ) : skillsData ? (
                      <div className="space-y-6">
                        {/* Skill Distribution with Pie Chart */}
                        <div>
                          <h3 className="font-semibold mb-4">Skill Distribution</h3>
                          {(() => {
                            // Process skillsData to create categories for pie chart
                            const categoryCount = skillsData.reduce((acc: any, skill: any) => {
                              acc[skill.skill_category] = (acc[skill.skill_category] || 0) + 1;
                              return acc;
                            }, {});
                            
                            const total = skillsData.length;
                            const chartData = Object.entries(categoryCount).map(([category, count], index) => ({
                              name: category,
                              value: Math.round(((count as number) / total) * 100),
                              count: count as number,
                              color: COLORS[index % COLORS.length]
                            }));

                            return (
                              <>
                                <div className="flex justify-center mb-6">
                                  <div className="relative">
                                    <ChartContainer
                                      config={{
                                        value: {
                                          label: "Skills",
                                        },
                                      }}
                                      className="h-96 w-96"
                                    >
                                      <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                                          <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => {
                                              // Truncate long category names for labels
                                              const truncatedName = name.length > 10 ? name.substring(0, 10) + '...' : name;
                                              return `${truncatedName} ${value}%`;
                                            }}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            animationBegin={300}
                                            animationDuration={1200}
                                            animationEasing="ease-out"
                                          >
                                            {chartData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                          </Pie>
                                          <Tooltip 
                                            formatter={(value, name, props) => [
                                              `${props.payload.count} skills (${value}%)`,
                                              props.payload.name
                                            ]}
                                            labelStyle={{ color: '#374151' }}
                                            contentStyle={{ 
                                              backgroundColor: '#fff',
                                              border: '1px solid #e5e7eb',
                                              borderRadius: '8px',
                                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                          />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </ChartContainer>
                                  </div>
                                </div>
                                
                                {/* Legend */}
                                <div className="flex flex-wrap justify-center gap-3 mb-4">
                                  {chartData.map((category) => (
                                    <div key={category.name} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: category.color }}></div>
                                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{category.name}</span>
                                      <span className="text-sm text-gray-500 font-medium">({category.value}%)</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                  {chartData.slice(0, 4).map((category) => (
                                    <div key={category.name} className="text-center p-3 rounded-lg border border-gray-200">
                                      <div className="text-lg font-bold" style={{ color: category.color }}>
                                        {category.count}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate" title={category.name}>
                                        {category.name}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Skill Proficiency Breakdown */}
                        <div className="border-t pt-6">
                          <h3 className="font-semibold mb-4">Skill Proficiency Breakdown</h3>
                          <div className="space-y-4">
                            {/* Advanced Skills */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Advanced Skills</span>
                                <Badge className="bg-green-100 text-green-800">
                                  {skillsData.filter((skill: any) => skill.skill_level.toLowerCase() === 'advanced').length} skills
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {skillsData
                                  .filter((skill: any) => skill.skill_level.toLowerCase() === 'advanced')
                                  .map((skill: any) => (
                                    <Badge key={skill.skill_name} className="bg-green-100 text-green-800 text-xs">
                                      {skill.skill_name}
                                    </Badge>
                                  ))}
                              </div>
                            </div>

                            {/* Intermediate Skills */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Intermediate Skills</span>
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  {skillsData.filter((skill: any) => skill.skill_level.toLowerCase() === 'intermediate').length} skills
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {skillsData
                                  .filter((skill: any) => skill.skill_level.toLowerCase() === 'intermediate')
                                  .map((skill: any) => (
                                    <Badge key={skill.skill_name} className="bg-yellow-100 text-yellow-800 text-xs">
                                      {skill.skill_name}
                                    </Badge>
                                  ))}
                              </div>
                            </div>

                            {/* Beginner Skills */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Beginner Skills</span>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {skillsData.filter((skill: any) => skill.skill_level.toLowerCase() === 'beginner').length} skills
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {skillsData
                                  .filter((skill: any) => skill.skill_level.toLowerCase() === 'beginner')
                                  .map((skill: any) => (
                                    <Badge key={skill.skill_name} className="bg-blue-100 text-blue-800 text-xs">
                                      {skill.skill_name}
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
                              <div className="text-2xl font-bold text-blue-600">{skillsData.length}</div>
                              <div className="text-sm text-blue-700">Skills Extracted</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">
                                {new Set(skillsData.map((skill: any) => skill.skill_category)).size}
                              </div>
                              <div className="text-sm text-green-700">Skill Categories</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">
                                {skillsData.filter((skill: any) => skill.skill_level.toLowerCase() === 'advanced').length}
                              </div>
                              <div className="text-sm text-purple-700">Advanced Skills</div>
                            </div>
                          </div>
                        </div>

                        {/* Top Skills by Category */}
                        <div className="border-t pt-6">
                          <h3 className="font-semibold mb-4">Top Skills by Category</h3>
                          {(() => {
                            // Group skills by category
                            const skillsByCategory = skillsData.reduce((acc: any, skill: any) => {
                              if (!acc[skill.skill_category]) {
                                acc[skill.skill_category] = [];
                              }
                              acc[skill.skill_category].push(skill);
                              return acc;
                            }, {});

                            // Sort skills within each category by level (Advanced > Intermediate > Beginner)
                            const levelOrder = { 'advanced': 3, 'intermediate': 2, 'beginner': 1 };
                            Object.keys(skillsByCategory).forEach(category => {
                              skillsByCategory[category].sort((a: any, b: any) => {
                                const levelA = levelOrder[a.skill_level.toLowerCase() as keyof typeof levelOrder] || 0;
                                const levelB = levelOrder[b.skill_level.toLowerCase() as keyof typeof levelOrder] || 0;
                                return levelB - levelA; // Sort descending (advanced first)
                              });
                            });

                            return (
                              <div className="space-y-6">
                                {Object.entries(skillsByCategory)
                                  .slice(0, 4) // Show top 4 categories
                                  .map(([category, skills]: [string, any]) => (
                                    <div key={category} className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center">
                                          <div 
                                            className="w-3 h-3 rounded-full mr-2" 
                                            style={{ 
                                              backgroundColor: COLORS[Object.keys(skillsByCategory).indexOf(category) % COLORS.length] 
                                            }}
                                          ></div>
                                          {category}
                                        </h4>
                                        <Badge variant="outline" className="text-xs">
                                          {skills.length} skills
                                        </Badge>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {skills.slice(0, 5).map((skill: any, index: number) => (
                                          <div key={skill.skill_name} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium text-gray-700">
                                                {index + 1}. {skill.skill_name}
                                              </span>
                                            </div>
                                            <Badge 
                                              className={`text-xs ${
                                                skill.skill_level.toLowerCase() === 'advanced' ? 'bg-green-100 text-green-800' :
                                                skill.skill_level.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                              }`}
                                            >
                                              {skill.skill_level.charAt(0).toUpperCase() + skill.skill_level.slice(1).toLowerCase()}
                                            </Badge>
                                          </div>
                                        ))}
                                        
                                        {skills.length > 5 && (
                                          <div className="text-xs text-gray-500 mt-2 text-center">
                                            +{skills.length - 5} more skills in this category
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                
                                {/* Overall Top Skills Summary */}
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Overall Top Skills</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {skillsData
                                      .sort((a: any, b: any) => {
                                        const levelA = levelOrder[a.skill_level.toLowerCase() as keyof typeof levelOrder] || 0;
                                        const levelB = levelOrder[b.skill_level.toLowerCase() as keyof typeof levelOrder] || 0;
                                        return levelB - levelA;
                                      })
                                      .slice(0, 8)
                                      .map((skill: any, index: number) => (
                                        <div key={skill.skill_name} className="flex items-center justify-between p-2 bg-white rounded border">
                                          <span className="text-xs font-medium text-gray-700 truncate" title={skill.skill_name}>
                                            {index + 1}. {skill.skill_name}
                                          </span>
                                          <div className="flex items-center space-x-1">
                                            <div 
                                              className="w-2 h-2 rounded-full" 
                                              style={{ 
                                                backgroundColor: COLORS[Object.keys(skillsByCategory).indexOf(skill.skill_category) % COLORS.length] 
                                              }}
                                            ></div>
                                            <Badge 
                                              className={`text-xs px-1 py-0 ${
                                                skill.skill_level.toLowerCase() === 'advanced' ? 'bg-green-100 text-green-800' :
                                                skill.skill_level.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                              }`}
                                            >
                                              {skill.skill_level.charAt(0).toUpperCase()}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-gray-600">No skills data available</p>
                      </div>
                    )}
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
                      {workExperience.map((exp, index) => (
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
                              {exp.skills.map((skill) => (
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
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-purple-600" />
                  <span>Your Learning Roadmap</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  {analysisData ? `Personalized roadmap for: ${analysisData.goal}` : "Your personalized learning path"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {roadmapPhases.map((phase, index) => (
                    <div key={phase.id} className="relative">
                      {/* Timeline connector */}
                      {index < roadmapPhases.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-24 bg-gray-200"></div>
                      )}

                      <div className="flex items-start space-x-4">
                        {/* Phase indicator */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              phase.status === "completed"
                                ? "bg-green-100 text-green-600"
                                : phase.status === "current"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {phase.status === "completed" ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : phase.status === "current" ? (
                              <Play className="w-6 h-6" />
                            ) : (
                              <Circle className="w-6 h-6" />
                            )}
                          </div>
                        </div>

                        {/* Phase content */}
                        <div className="flex-1">
                          <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{phase.title}</h3>
                                <p className="text-gray-600 mt-1">{phase.description}</p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    phase.status === "completed"
                                      ? "bg-green-50 text-green-700"
                                      : phase.status === "current"
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  {phase.duration}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Skills to learn */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <Code className="w-4 h-4 mr-2" />
                                  Skills to Master
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {phase.skills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Projects */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <Target className="w-4 h-4 mr-2" />
                                  Practice Projects
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {phase.projects.map((project, idx) => (
                                    <li key={idx} className="flex items-center">
                                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                                      {project}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Resources */}
                            <div className="mt-6">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Recommended Resources
                              </h4>
                              <div className="grid sm:grid-cols-2 gap-3">
                                {phase.resources.map((resource, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        resource.type === "course"
                                          ? "bg-blue-100 text-blue-600"
                                          : resource.type === "book"
                                            ? "bg-green-100 text-green-600"
                                            : resource.type === "tutorial"
                                              ? "bg-purple-100 text-purple-600"
                                              : "bg-orange-100 text-orange-600"
                                      }`}
                                    >
                                      {resource.type === "course" && <Play className="w-4 h-4" />}
                                      {resource.type === "book" && <BookOpen className="w-4 h-4" />}
                                      {resource.type === "tutorial" && <Code className="w-4 h-4" />}
                                      {resource.type === "practice" && <Target className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-gray-900 truncate">{resource.title}</p>
                                      <p className="text-xs text-gray-600">{resource.provider}</p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {resource.type}
                                        </Badge>
                                        <div className="flex items-center">
                                          {[...Array(3)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`w-3 h-3 ${
                                                i <
                                                (
                                                  resource.difficulty === "beginner"
                                                    ? 1
                                                    : resource.difficulty === "intermediate"
                                                      ? 2
                                                      : 3
                                                )
                                                  ? "text-yellow-400 fill-current"
                                                  : "text-gray-300"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    {resource.url && <ExternalLink className="w-4 h-4 text-gray-400" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips for Success</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Set aside dedicated time each day for learning (even 30 minutes helps!)</li>
                    <li>• Build projects while learning - practical application reinforces concepts</li>
                    <li>• Join communities and forums related to your learning goals</li>
                    <li>• Don't rush - solid understanding is better than surface-level knowledge</li>
                    <li>• Track your progress and celebrate small wins along the way</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
