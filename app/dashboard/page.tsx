"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
    setHasMounted(true);
    // ...existing code...
  }, [router])

  const exportToPDF = () => {
    // ...existing code...
  }

  if (isLoading) {
    // ...existing code...
  }

  if (!userProfile) {
    // ...existing code...
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
              <span className="ml-2 text-sm">{userProfile?.name}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Dashboard content goes here, see v0 code for details */}
        {/* You can copy the full dashboard content from the v0 file here if needed. */}
      </div>
    </div>
  );
}
