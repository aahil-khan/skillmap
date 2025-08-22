"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageCircle, Loader2, AlertCircle, LinkIcon, HelpCircle, Upload, FileText, Code } from "lucide-react"
import Link from "next/link"

interface ProjectPeer {
  id: string
  name: string
  skills: string[]
  sharedSkills: string[]
  domains: string[]
  matchScore: number
  avatar?: string
  title?: string
  company?: string
}

interface DSAPeer {
  id: string
  name: string
  strengths: string[]
  weakAreas: string[]
  easySolved: number
  mediumSolved: number
  hardSolved: number
  matchScore: number
  avatar?: string
  totalSolved: number
}

export default function PeerMatching() {
  const [projectPeers, setProjectPeers] = useState<ProjectPeer[]>([])
  const [dsaPeers, setDSAPeers] = useState<DSAPeer[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingDSA, setLoadingDSA] = useState(false)
  const [isLeetCodeConnected, setIsLeetCodeConnected] = useState(false)
  const [hasResumeData, setHasResumeData] = useState(false)

  // Mock API calls
  const fetchProjectPeers = async (): Promise<ProjectPeer[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "1",
            name: "John Doe",
            skills: ["React", "Node.js", "Python", "MongoDB", "AWS"],
            sharedSkills: ["React", "Node.js"],
            domains: ["Web Dev", "Machine Learning"],
            matchScore: 85,
            avatar: "/generic-person.png",
            title: "Full Stack Developer",
            company: "Tech Corp",
          },
          {
            id: "2",
            name: "Sarah Wilson",
            skills: ["JavaScript", "Vue.js", "Python", "PostgreSQL"],
            sharedSkills: ["JavaScript", "Python"],
            domains: ["Web Dev", "Data Science"],
            matchScore: 78,
            avatar: "/sarah-wilson-portrait.png",
            title: "Frontend Developer",
            company: "StartupXYZ",
          },
          {
            id: "3",
            name: "Mike Chen",
            skills: ["React", "TypeScript", "Docker", "Kubernetes", "AWS"],
            sharedSkills: ["React", "TypeScript", "Docker", "AWS"],
            domains: ["Web Dev", "DevOps"],
            matchScore: 92,
            avatar: "/mike-chen-portrait.png",
            title: "DevOps Engineer",
            company: "CloudTech",
          },
          {
            id: "4",
            name: "Emily Rodriguez",
            skills: ["Python", "Django", "PostgreSQL", "Machine Learning"],
            sharedSkills: ["Python", "SQL"],
            domains: ["Backend", "AI/ML"],
            matchScore: 71,
            avatar: "/emily-rodriguez.png",
            title: "Backend Developer",
            company: "AI Solutions",
          },
        ])
      }, 1500)
    })
  }

  const fetchDSAPeers = async (): Promise<DSAPeer[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "1",
            name: "Anoushka Sharma",
            strengths: ["Arrays", "Graphs", "Dynamic Programming"],
            weakAreas: ["Trees", "Greedy"],
            easySolved: 120,
            mediumSolved: 90,
            hardSolved: 30,
            totalSolved: 240,
            matchScore: 78,
            avatar: "/anoushka-sharma-portrait.png",
          },
          {
            id: "2",
            name: "Alex Thompson",
            strengths: ["Trees", "Recursion", "Backtracking"],
            weakAreas: ["Dynamic Programming", "Graphs"],
            easySolved: 95,
            mediumSolved: 75,
            hardSolved: 25,
            totalSolved: 195,
            matchScore: 82,
            avatar: "/alex-thompson-sailboat.png",
          },
          {
            id: "3",
            name: "Priya Patel",
            strengths: ["Dynamic Programming", "Greedy", "Math"],
            weakAreas: ["Graphs", "Backtracking"],
            easySolved: 140,
            mediumSolved: 110,
            hardSolved: 45,
            totalSolved: 295,
            matchScore: 88,
            avatar: "/serene-woman-portrait.png",
          },
          {
            id: "4",
            name: "David Kim",
            strengths: ["Graphs", "Trees", "Sorting"],
            weakAreas: ["Dynamic Programming", "Math"],
            easySolved: 85,
            mediumSolved: 65,
            hardSolved: 20,
            totalSolved: 170,
            matchScore: 75,
            avatar: "/david-kim-portrait.png",
          },
        ])
      }, 1200)
    })
  }

  const loadProjectPeers = async () => {
    setLoadingProjects(true)
    try {
      const peers = await fetchProjectPeers()
      setProjectPeers(peers)
    } catch (error) {
      console.error("Failed to load project peers:", error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadDSAPeers = async () => {
    setLoadingDSA(true)
    try {
      const peers = await fetchDSAPeers()
      setDSAPeers(peers)
    } catch (error) {
      console.error("Failed to load DSA peers:", error)
    } finally {
      setLoadingDSA(false)
    }
  }

  useEffect(() => {
    // Check if LeetCode is connected
    const leetcodeConnected = localStorage.getItem("leetcode-connected")
    setIsLeetCodeConnected(!!leetcodeConnected)

    // Check if user has resume/skills data
    const skillsData = localStorage.getItem("user-skills") || localStorage.getItem("extracted-skills")
    setHasResumeData(!!skillsData)
  }, [])

  const ProjectsRequiredState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-orange-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Required</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        To find peers with similar project experience, please upload your resume first. This helps us match you with
        developers who have complementary skills and experience.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="skillmap-button text-white">
          <Link href="/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Link>
        </Button>
        <Button asChild variant="outline" className="bg-transparent">
          <Link href="/onboarding">
            <FileText className="h-4 w-4 mr-2" />
            Manual Entry
          </Link>
        </Button>
      </div>
    </div>
  )

  const DSARequiredState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Code className="h-8 w-8 text-orange-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">LeetCode Connection Required</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        To find peers with similar DSA progress and problem-solving patterns, please connect your LeetCode account
        first. This enables us to match you based on your algorithmic strengths and areas for improvement.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="skillmap-button text-white">
          <Link href="/leetcode">
            <LinkIcon className="h-4 w-4 mr-2" />
            Connect LeetCode
          </Link>
        </Button>
        <Button variant="outline" className="bg-transparent">
          <HelpCircle className="h-4 w-4 mr-2" />
          Why do I need this?
        </Button>
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
        <h4 className="font-semibold text-blue-900 mb-2">What we'll analyze:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your problem-solving strengths and weak areas</li>
          <li>• Difficulty progression and consistency</li>
          <li>• Topic-wise performance patterns</li>
          <li>• Compatible study partners and mentors</li>
        </ul>
      </div>
    </div>
  )

  const ProjectPeerCard = ({ peer }: { peer: ProjectPeer }) => (
    <Card className="border rounded-lg hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
            <img src={peer.avatar || "/placeholder.svg"} alt={peer.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{peer.name}</h3>
            {peer.title && peer.company && (
              <p className="text-sm text-gray-600">
                {peer.title} at {peer.company}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{peer.matchScore}%</div>
            <div className="text-xs text-gray-500">Match</div>
          </div>
        </div>

        <div className="mb-3">
          <Progress value={peer.matchScore} className="h-2 mb-2" />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Shared Skills:</p>
            <div className="flex flex-wrap gap-1">
              {peer.sharedSkills.map((skill) => (
                <Badge key={skill} className="bg-green-100 text-green-800 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Domains:</p>
            <div className="flex flex-wrap gap-1">
              {peer.domains.map((domain) => (
                <Badge key={domain} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {domain}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <Button className="w-full skillmap-button text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const DSAPeerCard = ({ peer }: { peer: DSAPeer }) => (
    <Card className="border rounded-lg hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
            <img src={peer.avatar || "/placeholder.svg"} alt={peer.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{peer.name}</h3>
            <p className="text-sm text-gray-600">{peer.totalSolved} problems solved</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{peer.matchScore}%</div>
            <div className="text-xs text-gray-500">Match</div>
          </div>
        </div>

        <div className="mb-3">
          <Progress value={peer.matchScore} className="h-2 mb-2" />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Strengths:</p>
            <div className="flex flex-wrap gap-1">
              {peer.strengths.map((strength) => (
                <Badge key={strength} className="bg-green-100 text-green-800 text-xs">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Weak Areas:</p>
            <div className="flex flex-wrap gap-1">
              {peer.weakAreas.map((area) => (
                <Badge key={area} variant="outline" className="text-xs bg-red-50 text-red-700">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Easy/Medium/Hard Solved:</p>
            <div className="flex space-x-4 text-sm">
              <span className="text-green-600 font-medium">{peer.easySolved}</span>
              <span className="text-yellow-600 font-medium">{peer.mediumSolved}</span>
              <span className="text-red-600 font-medium">{peer.hardSolved}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <Button className="w-full skillmap-button text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card className="shadow-lg border-0 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <span>Peer Matching</span>
        </CardTitle>
        <p className="text-gray-600 mt-2">Connect with developers who share similar skills and learning goals</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="projects"
              className="flex items-center space-x-2"
              onClick={() => {
                if (hasResumeData && projectPeers.length === 0) {
                  loadProjectPeers()
                }
              }}
            >
              <FileText className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="dsa"
              className="flex items-center space-x-2"
              onClick={() => {
                if (isLeetCodeConnected && dsaPeers.length === 0) {
                  loadDSAPeers()
                }
              }}
            >
              <Code className="h-4 w-4" />
              <span>DSA</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {!hasResumeData ? (
              <ProjectsRequiredState />
            ) : loadingProjects ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Finding peers with similar project experience...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {projectPeers.map((peer) => (
                  <ProjectPeerCard key={peer.id} peer={peer} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dsa" className="space-y-4">
            {!isLeetCodeConnected ? (
              <DSARequiredState />
            ) : loadingDSA ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Finding peers with similar DSA progress...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {dsaPeers.map((peer) => (
                  <DSAPeerCard key={peer.id} peer={peer} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
