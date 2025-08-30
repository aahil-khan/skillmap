"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Menu, User, Download, Calendar, Mail, Target, Award, Clock, ArrowRight, Briefcase, BookOpen, Code, Settings, MapPin, CheckCircle2, Circle, Play, Star, ExternalLink, Users} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/utils"

interface UserProfile {
  name: string
  email: string
  resumeUploadDate: string
  title?: string
  bio?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

    const initializePage = async () => {
      await checkAuth()
      
      // Get analysis data from localStorage (if any)
      const analysis = localStorage.getItem("skill-analysis")
      if (analysis) {
        setAnalysisData(JSON.parse(analysis))
      }

      // Fetch ATS score - this will set isFetchingScore states
      await fetchATSScore()
      setIsLoading(false)
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

  const exportToPDF = () => {
    // Mock PDF export
    alert("PDF export functionality would be implemented here!")
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

        {/* Static Profile Card */}
        <Card className="shadow-lg border-0 rounded-2xl card-hover animate-slideInLeft mb-8">
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

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <Link 
                href="/dashboard/overview"
                className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Overview
              </Link>
              <Link 
                href="/dashboard/learning-roadmap"
                className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Learning Roadmap
              </Link>
              <Link 
                href="/dashboard/peer-matching"
                className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Peer Matching
              </Link>
            </nav>
          </div>
        </div>

        {/* Children content */}
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
