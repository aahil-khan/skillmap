"use client"

import { useState, useEffect } from "react"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Menu, User, ArrowLeft, ArrowRight, CheckCircle, Plus, Trash2, X } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/Navbar"

interface Skill {
  name: string
  level: "beginner" | "intermediate" | "advanced"
}

interface SkillCategory {
  category: string
  skills: string[]
}

interface CategorizedSkill {
  category: string
  skills: Skill[]
}

export default function SkillsPage() {
  useAuthRedirect()
  const router = useRouter()
  const [categorizedSkills, setCategorizedSkills] = useState<CategorizedSkill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({}) // Track input values for each category

  useEffect(() => {
    setIsLoaded(true)
    const extractedSkills = localStorage.getItem("extracted-skills")
    if (!extractedSkills) {
      router.push("/upload")
      return
    }

    const skillCategories: SkillCategory[] = JSON.parse(extractedSkills)
    const categorizedSkillsData: CategorizedSkill[] = skillCategories.map(category => ({
      category: category.category,
      skills: category.skills.map(skillName => ({
        name: skillName,
        level: "beginner" as const
      }))
    }))
    setCategorizedSkills(categorizedSkillsData)
  }, [router])

  const updateSkillLevel = (categoryName: string, skillName: string, level: "beginner" | "intermediate" | "advanced") => {
    setCategorizedSkills(categorizedSkills.map(category => 
      category.category === categoryName 
        ? {
            ...category,
            skills: category.skills.map(skill => 
              skill.name === skillName ? { ...skill, level } : skill
            )
          }
        : category
    ))
  }

  const addSkill = (categoryName: string, skillName: string) => {
    const trimmedSkill = skillName.trim()
    if (!trimmedSkill) return
    // Prevent duplicate skill names (case-insensitive)
    const categoryObj = categorizedSkills.find(cat => cat.category === categoryName)
    if (categoryObj && categoryObj.skills.some(skill => skill.name.toLowerCase() === trimmedSkill.toLowerCase())) {
      return // Do not add duplicate
    }
    setCategorizedSkills(categorizedSkills.map(category => 
      category.category === categoryName 
        ? {
            ...category,
            skills: [...category.skills, { name: trimmedSkill, level: "beginner" }]
          }
        : category
    ))
    // Clear the input for this category
    setNewSkillInputs(prev => ({ ...prev, [categoryName]: "" }))
  }

  const removeSkill = (categoryName: string, skillName: string) => {
    setCategorizedSkills(categorizedSkills.map(category => 
      category.category === categoryName 
        ? {
            ...category,
            skills: category.skills.filter(skill => skill.name !== skillName)
          }
        : category
    ))
  }

  const handleNewSkillInputChange = (categoryName: string, value: string) => {
    setNewSkillInputs(prev => ({ ...prev, [categoryName]: value }))
  }

  const handleKeyPress = (e: React.KeyboardEvent, categoryName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill(categoryName, newSkillInputs[categoryName] || "")
    }
  }

  const handleContinue = async () => {
    setIsLoading(true)
    
    // Update technical_skills in profile-data with new categorizedSkills (include level property)
    const profileDataRaw = localStorage.getItem("profile-data")
    if (profileDataRaw) {
      const profile = JSON.parse(profileDataRaw)
      profile.technical_skills = categorizedSkills.map(cat => ({
      category: cat.category,
      skills: cat.skills.map(skill => ({
        name: skill.name,
        level: skill.level
        }))
      }))
      console.log('Updated profile with technical skills:', profile.technical_skills)
      localStorage.setItem("profile-data", JSON.stringify(profile))
    }

    localStorage.setItem("user-skills", JSON.stringify(categorizedSkills))
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/intent")
  }

  // Helper function to get all skills flattened for summary
  const getAllSkills = (): Skill[] => {
    return categorizedSkills.flatMap(category => category.skills)
  }

  return (
    <div className="min-h-screen skillmap-bg">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card
          className={`shadow-lg border-0 card-hover transition-all duration-1000 ${isLoaded ? "animate-scaleIn" : "opacity-0 scale-90"}`}
        >
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Skills Extracted Successfully
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Review Your Skills</CardTitle>
            <p className="text-gray-600 mt-2">
              We've extracted these skills from your resume. Please set your proficiency level for each.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills Grid by Category */}
            <div className="space-y-8">
              {categorizedSkills.map((category, categoryIndex) => (
                <div key={category.category} className={`animate-fadeInUp animate-delay-${categoryIndex * 200}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Badge variant="secondary" className="mr-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {category.category}
                    </Badge>
                    <span className="text-sm text-gray-500">({category.skills.length} skills)</span>
                  </h3>
                  <div className="grid gap-3">
                    {category.skills.map((skill, skillIndex) => (
                      <div
                        key={skill.name}
                        className={`flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-all duration-300 hover-lift animate-slideInLeft animate-delay-${Math.min(skillIndex * 100, 500)}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                            {skill.name}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select 
                            value={skill.level} 
                            onValueChange={(level: any) => updateSkillLevel(category.category, skill.name, level)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSkill(category.category, skill.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add new skill input */}
                    <div className="flex items-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Input
                        placeholder="Add a new skill..."
                        value={newSkillInputs[category.category] || ""}
                        onChange={(e) => handleNewSkillInputChange(category.category, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, category.category)}
                        className="flex-1 border-0 bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSkill(category.category, newSkillInputs[category.category] || "")}
                        disabled={!(newSkillInputs[category.category] || "").trim()}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Skills Summary</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800">
                  Advanced: {getAllSkills().filter((s) => s.level === "advanced").length}
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800">
                  Intermediate: {getAllSkills().filter((s) => s.level === "intermediate").length}
                </Badge>
                <Badge className="bg-gray-100 text-gray-800">
                  Beginner: {getAllSkills().filter((s) => s.level === "beginner").length}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  Total Categories: {categorizedSkills.length}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" asChild>
                <Link href="/upload">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Upload
                </Link>
              </Button>
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                className="skillmap-button text-white min-w-32 hover-lift"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving<span className="loading-dots"></span>
                  </span>
                ) : (
                  "Continue"
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
