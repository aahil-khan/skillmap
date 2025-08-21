"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Menu, User } from "lucide-react"
import Link from "next/link"

const SKILL_OPTIONS = [
  // Web Development
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Next.js",
  "Svelte",
  // Backend
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  // Databases
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Firebase",
  // DevOps & Tools
  "Git",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "CI/CD",
  // Mobile
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  // Data & AI
  "Machine Learning",
  "Deep Learning",
  "Data Analysis",
  "TensorFlow",
  "PyTorch",
  // Other
  "GraphQL",
  "REST APIs",
  "Testing",
  "Agile",
  "System Design",
]

interface UserSkill {
  name: string
  level: "beginner" | "intermediate" | "advanced"
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [projects, setProjects] = useState("")
  const [goal, setGoal] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const addSkill = (skillName: string) => {
    if (!skills.find((s) => s.name === skillName)) {
      setSkills([...skills, { name: skillName, level: "beginner" }])
    }
  }

  const removeSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName))
  }

  const updateSkillLevel = (skillName: string, level: "beginner" | "intermediate" | "advanced") => {
    setSkills(skills.map((s) => (s.name === skillName ? { ...s, level } : s)))
  }

  const handleSubmit = async () => {
    if (!goal.trim()) return

    setIsLoading(true)

    const userData = {
      skills,
      projects,
      goal,
      timestamp: Date.now(),
    }

    localStorage.setItem("skillmap-data", JSON.stringify(userData))
    await new Promise((resolve) => setTimeout(resolve, 2000))
    router.push("/results")
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen skillmap-bg">
      {/* Header */}
      <header className="skillmap-header text-white">
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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-sm text-gray-600">Step {step} of 3</span>
            <Progress value={progress} className="w-32 bg-gray-200" />
          </div>
        </div>

        {step === 1 && (
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">What skills do you currently have?</CardTitle>
              <p className="text-gray-600 mt-2">Select your existing skills and rate your proficiency level.</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {/* Skill Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Available Skills</Label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 border-2 rounded-xl bg-gray-50">
                  {SKILL_OPTIONS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={skills.find((s) => s.name === skill) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => (skills.find((s) => s.name === skill) ? removeSkill(skill) : addSkill(skill))}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Selected Skills with Levels */}
              {skills.length > 0 && (
                <div>
                  <Label className="text-base font-medium mb-3 block">Your Skills & Levels</Label>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-4 border-2 rounded-xl bg-white"
                      >
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <div className="flex items-center space-x-3">
                          <Select
                            value={skill.level}
                            onValueChange={(level: any) => updateSkillLevel(skill.name, level)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button variant="outline" asChild className="rounded-full px-6 bg-transparent">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={skills.length === 0}
                  className="skillmap-button text-white rounded-full px-6"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Tell us about your experience</CardTitle>
              <p className="text-gray-600 mt-2">Share any projects or experience you have (optional but helpful).</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div>
                <Label htmlFor="projects" className="text-base font-medium">
                  Past Projects & Experience
                </Label>
                <Textarea
                  id="projects"
                  placeholder="Describe any projects you've worked on, internships, or relevant experience..."
                  value={projects}
                  onChange={(e) => setProjects(e.target.value)}
                  className="mt-2 min-h-32 border-2 rounded-xl"
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-full px-6">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Step
                </Button>
                <Button onClick={() => setStep(3)} className="skillmap-button text-white rounded-full px-6">
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">What's your learning goal?</CardTitle>
              <p className="text-gray-600 mt-2">
                Describe what you want to learn or achieve. Be as specific as possible.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div>
                <Label htmlFor="goal" className="text-base font-medium">
                  Learning Goal
                </Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., 'I want to become a full-stack web developer' or 'I want to learn machine learning for data analysis'"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="mt-2 min-h-32 border-2 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-full px-6">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Step
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!goal.trim() || isLoading}
                  className="skillmap-button text-white rounded-full px-8 min-w-40"
                >
                  {isLoading ? "Analyzing..." : "Get My SkillMap"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
