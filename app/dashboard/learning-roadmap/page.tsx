"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle2, Circle, Play, Star, ExternalLink, Clock, Code, Target, BookOpen } from "lucide-react"

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

export default function LearningRoadmapPage() {
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState<any>(null)

  useEffect(() => {
    // Get analysis data from localStorage (if any)
    const analysis = localStorage.getItem("skill-analysis")
    if (analysis) {
      setAnalysisData(JSON.parse(analysis))
    }
  }, [])

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

  const roadmapPhases = analysisData
    ? generateRoadmap(analysisData.goal, analysisData.category)
    : generateRoadmap("Learn Web Development", "Web Development")

  return (
    <div className="space-y-6">
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
    </div>
  )
}
