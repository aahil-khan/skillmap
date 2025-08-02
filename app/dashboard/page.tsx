"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Menu, User, Download, Calendar, Mail, Target, Award, Clock, ArrowRight, Briefcase, BookOpen, Code, Settings, MapPin, CheckCircle2, Circle, Play, Star, ExternalLink,} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Navbar from "@/components/Navbar"

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
  useAuthRedirect() // Add authentication protection
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [resumeScore, setResumeScore] = useState(0)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

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
      ];
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
      ];
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
    ];
  }

  useEffect(() => {
    setHasMounted(true)
    
    // Load user profile and analysis data from localStorage
    const loadData = () => {
      try {
        // Load profile data
        const profileData = localStorage.getItem("profile-data")
        const userIntent = localStorage.getItem("user-intent")
        const extractedSkills = localStorage.getItem("extracted-skills")
        
        if (profileData) {
          const parsedProfile = JSON.parse(profileData)
          setUserProfile({
            name: parsedProfile.name || "User",
            email: parsedProfile.email || "user@example.com",
            resumeUploadDate: new Date().toLocaleDateString(),
            title: parsedProfile.title || "Software Developer",
            bio: parsedProfile.bio || "Passionate about building great software"
          })
        } else {
          // Default profile if no data found
          setUserProfile({
            name: "Demo User",
            email: "demo@example.com",
            resumeUploadDate: new Date().toLocaleDateString(),
            title: "Software Developer",
            bio: "Passionate about building great software"
          })
        }
        
        // Load analysis data
        if (userIntent) {
          setAnalysisData({
            goal: userIntent,
            category: "Web Development" // Default category
          })
        }
        
        // Calculate resume score based on available data
        let score = 50 // Base score
        if (profileData) score += 20
        if (extractedSkills) score += 20
        if (userIntent) score += 10
        setResumeScore(Math.min(score, 100))
        
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        // Set default values on error
        setUserProfile({
          name: "Demo User",
          email: "demo@example.com",
          resumeUploadDate: new Date().toLocaleDateString(),
          title: "Software Developer",
          bio: "Passionate about building great software"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [router])

  const exportToPDF = () => {
    // Placeholder for PDF export functionality
    console.log("Exporting to PDF...")
    alert("PDF export feature coming soon!")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">No Profile Data Found</h2>
            <p className="text-gray-600 mb-4">Please upload your resume first to view your dashboard.</p>
            <Button asChild>
              <Link href="/upload">Upload Resume</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const roadmapPhases = analysisData
    ? generateRoadmap(analysisData.goal, analysisData.category)
    : generateRoadmap("Learn Web Development", "Web Development")

  if (!hasMounted || isLoading || !userProfile) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen skillmap-bg">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 card-hover animate-fadeInUp">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Welcome back, {userProfile.name}!
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Here's your skill development progress and recommendations
                  </p>
                </div>
                <Button onClick={exportToPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{resumeScore}%</div>
                  <div className="text-sm text-gray-600">Resume Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{topSkills.length}</div>
                  <div className="text-sm text-gray-600">Skills Identified</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{recommendedRoles.length}</div>
                  <div className="text-sm text-gray-600">Role Matches</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Distribution Chart */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Skills Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Percentage",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={skillCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {skillCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {skillCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Skills */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Your Top Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topSkills.slice(0, 12).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Roles */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Recommended Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedRoles.map((role) => (
                    <div key={role.title} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{role.title}</h3>
                        <Badge variant={role.match > 80 ? "default" : "secondary"}>
                          {role.match}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                      <div className="mb-3">
                        <Progress value={role.match} className="h-2" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Missing skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {role.missingSkills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
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
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>All Skills</CardTitle>
                <p className="text-gray-600">Complete overview of your technical skills</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillCategories.map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        <span className="text-sm text-gray-600">{category.value}%</span>
                      </div>
                      <Progress value={category.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Learning Roadmap
                </CardTitle>
                <p className="text-gray-600">
                  {analysisData?.goal || "Your personalized learning path"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roadmapPhases.map((phase, index) => (
                    <div key={phase.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {phase.status === "completed" ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : phase.status === "current" ? (
                          <Play className="h-6 w-6 text-blue-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{phase.title}</h3>
                          <Badge variant={phase.status === "current" ? "default" : "secondary"}>
                            {phase.duration}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{phase.description}</p>
                        <div className="mb-3">
                          <h4 className="font-medium mb-1">Skills to Learn:</h4>
                          <div className="flex flex-wrap gap-1">
                            {phase.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <h4 className="font-medium mb-1">Recommended Resources:</h4>
                          <div className="space-y-1">
                            {phase.resources.slice(0, 2).map((resource, idx) => (
                              <div key={idx} className="text-sm text-blue-600 hover:underline cursor-pointer">
                                📚 {resource.title} - {resource.provider}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? "Cancel" : "Edit"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editedProfile?.name || userProfile.name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...userProfile,
                            ...editedProfile,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editedProfile?.title || userProfile.title || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...userProfile,
                            ...editedProfile,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editedProfile?.bio || userProfile.bio || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...userProfile,
                            ...editedProfile,
                            bio: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (editedProfile) {
                          setUserProfile(editedProfile)
                        }
                        setIsEditingProfile(false)
                        setEditedProfile(null)
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-gray-900">{userProfile.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-gray-900">{userProfile.email}</p>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <p className="text-gray-900">{userProfile.title}</p>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <p className="text-gray-900">{userProfile.bio}</p>
                    </div>
                    <div>
                      <Label>Resume Upload Date</Label>
                      <p className="text-gray-900">{userProfile.resumeUploadDate}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
