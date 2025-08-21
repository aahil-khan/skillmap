"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, CheckCircle, AlertTriangle, X, RefreshCw, Menu, User, BarChart3 } from "lucide-react"
import Link from "next/link"

interface UserSkill {
  name: string
  level: "beginner" | "intermediate" | "advanced"
}

interface SkillGap {
  skill: string
  status: "known" | "weak" | "missing"
  level?: string
}

interface AnalysisResult {
  goal: string
  category: string
  gaps: SkillGap[]
  known: string[]
  feedback: string
}

// Mock skill taxonomy
const SKILL_TAXONOMY = {
  "Web Development": [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Vue.js",
    "Angular",
    "Next.js",
    "Node.js",
    "Express.js",
    "REST APIs",
    "GraphQL",
    "MongoDB",
    "PostgreSQL",
    "Git",
    "Testing",
    "Responsive Design",
    "Web Performance",
  ],
  "Backend Development": [
    "Node.js",
    "Python",
    "Java",
    "C#",
    "Express.js",
    "Django",
    "Flask",
    "Spring Boot",
    "REST APIs",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "AWS",
    "System Design",
    "Testing",
  ],
  "Data Science": [
    "Python",
    "R",
    "SQL",
    "Pandas",
    "NumPy",
    "Matplotlib",
    "Seaborn",
    "Jupyter",
    "Machine Learning",
    "Statistics",
    "Data Visualization",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
  ],
  "Mobile Development": [
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    "JavaScript",
    "TypeScript",
    "REST APIs",
    "Mobile UI/UX",
    "App Store Deployment",
    "Testing",
  ],
  "Data Structures & Algorithms": [
    "Data Structures",
    "Algorithms",
    "Time Complexity",
    "Space Complexity",
    "Arrays",
    "Linked Lists",
    "Trees",
    "Graphs",
    "Sorting",
    "Searching",
    "Dynamic Programming",
    "Greedy Algorithms",
    "Recursion",
    "Backtracking",
  ],
}

export default function ResultsPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userSkills = localStorage.getItem("user-skills")
    const userIntent = localStorage.getItem("user-intent")

    if (!userSkills || !userIntent) {
      router.push("/")
      return
    }

    const skills = JSON.parse(userSkills)
    const intent = userIntent
    analyzeSkills({ skills, intent })
  }, [router])

  const analyzeSkills = async (userData: { skills: UserSkill[]; intent: string }) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const intent = userData.intent.toLowerCase()
    let category = "Web Development"

    if (intent.includes("dsa") || intent.includes("data structures") || intent.includes("algorithms")) {
      category = "Data Structures & Algorithms"
    } else if (intent.includes("backend") || intent.includes("server") || intent.includes("api")) {
      category = "Backend Development"
    } else if (intent.includes("data") || intent.includes("machine learning") || intent.includes("ai")) {
      category = "Data Science"
    } else if (
      intent.includes("mobile") ||
      intent.includes("app") ||
      intent.includes("ios") ||
      intent.includes("android")
    ) {
      category = "Mobile Development"
    }

    const requiredSkills = SKILL_TAXONOMY[category as keyof typeof SKILL_TAXONOMY] || SKILL_TAXONOMY["Web Development"]
    const userSkillNames = userData.skills.map((s) => s.name)
    const userSkillLevels = userData.skills.reduce(
      (acc, s) => ({ ...acc, [s.name]: s.level }),
      {} as Record<string, string>,
    )

    const gaps: SkillGap[] = []
    const known: string[] = []

    requiredSkills.forEach((skill) => {
      if (userSkillNames.includes(skill)) {
        const level = userSkillLevels[skill]
        if (level === "beginner") {
          gaps.push({ skill, status: "weak", level })
        } else {
          known.push(skill)
        }
      } else {
        gaps.push({ skill, status: "missing" })
      }
    })

    const feedback = generateFeedback(userData.intent, category, gaps, known)

    setAnalysis({
      goal: userData.intent,
      category,
      gaps,
      known,
      feedback,
    })

    // Store analysis results for dashboard
    localStorage.setItem(
      "skill-analysis",
      JSON.stringify({
        goal: userData.intent,
        category,
        gaps,
        known,
        feedback,
      }),
    )

    setIsLoading(false)
  }

  const generateFeedback = (goal: string, category: string, gaps: SkillGap[], known: string[]) => {
    const missingSkills = gaps.filter((g) => g.status === "missing").map((g) => g.skill)
    const weakSkills = gaps.filter((g) => g.status === "weak").map((g) => g.skill)

    return `Based on your goal to "${goal}", I can see you're targeting ${category}. 

**Your Strengths:**
You have a solid foundation with ${known.length > 0 ? known.slice(0, 3).join(", ") : "some core skills"}${known.length > 3 ? ` and ${known.length - 3} other skills` : ""}. This gives you a great starting point!

**Areas to Focus On:**
${
  missingSkills.length > 0
    ? `
**Missing Skills (Priority):**
${missingSkills
  .slice(0, 3)
  .map((skill) => `• **${skill}** - Essential for ${category.toLowerCase()}`)
  .join("\n")}
`
    : ""
}
${
  weakSkills.length > 0
    ? `
**Skills to Strengthen:**
${weakSkills.map((skill) => `• **${skill}** - You have the basics, now deepen your knowledge`).join("\n")}
`
    : ""
}

**Recommended Learning Path:**
1. Start with ${missingSkills[0] || weakSkills[0]} - it's fundamental to your goal
2. Build a project incorporating ${missingSkills.slice(0, 2).join(" and ")}
3. Practice with real-world scenarios and gradually add complexity

**Next Steps:**
Consider building a portfolio project that combines your existing strengths with these new skills. This will give you practical experience and something to showcase to employers.`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <Card className="w-96 shadow-lg border-0 rounded-2xl">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Analyzing Your Skills</h3>
            <p className="text-gray-600 mb-4">
              Our AI is processing your profile and generating personalized recommendations...
            </p>
            <Progress value={75} className="w-full bg-gray-200" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <Card className="w-96 shadow-lg border-0 rounded-2xl">
          <CardContent className="p-8 text-center">
            <X className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Something went wrong</h3>
            <p className="text-gray-600 mb-4">We couldn't analyze your skills. Please try again.</p>
            <Button asChild className="skillmap-button text-white rounded-full">
              <Link href="/onboarding">Start Over</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Personalized SkillMap</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            Based on your goal: <span className="font-semibold text-blue-600">"{analysis.goal}"</span>
          </p>
          <Badge variant="secondary" className="bg-gray-200 text-gray-800 rounded-full px-4 py-1">
            Category: {analysis.category}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side: Skill Breakdown */}
          <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInLeft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Brain className="h-6 w-6 text-blue-600" />
                <span>Skill Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Known Skills */}
              {analysis.known.length > 0 && (
                <div className="animate-slideInLeft">
                  <h3 className="font-semibold text-green-700 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 animate-bounce-slow" />
                    Strong Skills ({analysis.known.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.known.map((skill, index) => (
                      <Badge
                        key={skill}
                        className={`bg-green-100 text-green-800 border-green-200 rounded-full hover:scale-105 transition-transform duration-300 animate-fadeIn animate-delay-${Math.min(index * 50, 500)}`}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Skills */}
              {analysis.gaps.filter((g) => g.status === "weak").length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-700 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Skills to Strengthen ({analysis.gaps.filter((g) => g.status === "weak").length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.gaps
                      .filter((g) => g.status === "weak")
                      .map((gap) => (
                        <Badge
                          key={gap.skill}
                          variant="outline"
                          className="bg-yellow-50 text-yellow-800 border-yellow-200 rounded-full"
                        >
                          {gap.skill} ({gap.level})
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {analysis.gaps.filter((g) => g.status === "missing").length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                    <X className="h-5 w-5 mr-2" />
                    Missing Skills ({analysis.gaps.filter((g) => g.status === "missing").length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.gaps
                      .filter((g) => g.status === "missing")
                      .map((gap) => (
                        <Badge
                          key={gap.skill}
                          variant="outline"
                          className="bg-red-50 text-red-800 border-red-200 rounded-full"
                        >
                          {gap.skill}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* Progress Overview */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">Skill Coverage</span>
                  <span className="text-sm text-gray-600">
                    {Math.round((analysis.known.length / (analysis.known.length + analysis.gaps.length)) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(analysis.known.length / (analysis.known.length + analysis.gaps.length)) * 100}
                  className="h-3 bg-gray-200 progress-bar"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Side: AI Feedback */}
          <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInRight">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Brain className="h-6 w-6 text-purple-600" />
                <span>AI Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {analysis.feedback.split("\n").map((paragraph, index) => {
                  if (paragraph.startsWith("**") && paragraph.endsWith(":**")) {
                    return (
                      <h4 key={index} className="font-semibold text-gray-900 mt-4 mb-2">
                        {paragraph.replace(/\*\*/g, "")}
                      </h4>
                    )
                  } else if (paragraph.startsWith("•")) {
                    return (
                      <p key={index} className="ml-4 mb-1 text-gray-700">
                        {paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/•/, "•")}
                      </p>
                    )
                  } else if (paragraph.trim()) {
                    return (
                      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                        {paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-x-4 animate-fadeInUp animate-delay-400">
          <Button asChild variant="outline" className="rounded-full px-6 bg-transparent hover-lift">
            <Link href="/onboarding">Update My Profile</Link>
          </Button>
          <Button asChild className="skillmap-button text-white rounded-full px-6 hover-lift">
            <Link href="/dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Dashboard & Roadmap
            </Link>
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="rounded-full px-6 bg-transparent hover-lift"
          >
            Save Results
          </Button>
        </div>
      </div>
    </div>
  )
}
