"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  User,
  Upload,
  Code,
  FileText,
  LinkIcon,
  HelpCircle,
  Settings,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Github,
  Linkedin,
  Globe,
} from "lucide-react"

// Types
interface ProfileData {
  name: string
  title: string
  bio: string
  location: string
  experience: string
  availability: string
  lookingFor: string[]
  github?: string
  linkedin?: string
  portfolio?: string
}

interface ResumePeer {
  id: string
  name: string
  title: string
  company: string
  location: string
  avatar: string
  bio: string
  sharedSkills: string[]
  complementarySkills: string[]
  domains: string[]
  matchScore: number
  isOnline: boolean
  github?: string
  linkedin?: string
  portfolio?: string
  experience: string
  availability: string
  lookingFor: string[]
}

interface DSAPeer {
  id: string
  name: string
  location: string
  avatar: string
  bio: string
  strengths: string[]
  weakAreas: string[]
  easySolved: number
  mediumSolved: number
  hardSolved: number
  totalSolved: number
  matchScore: number
  isOnline: boolean
  github?: string
  linkedin?: string
  portfolio?: string
  experience: string
  availability: string
  lookingFor: string[]
}

interface Post {
  id: string
  author: string
  avatar: string
  content: string
  achievement: string
  timestamp: string
  likes: number
  comments: number
  tags: string[]
}

// Mode Toggle Component
function ModeToggle({
  mode,
  onModeChange,
}: { mode: "resume" | "dsa"; onModeChange: (mode: "resume" | "dsa") => void }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-cream-100 p-1 rounded-xl border-2 border-cream-300 shadow-sm">
        <div className="flex">
          <button
            onClick={() => onModeChange("resume")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              mode === "resume"
                ? "bg-[#8b1538] text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-cream-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Project Partners</span>
            </div>
          </button>
          <button
            onClick={() => onModeChange("dsa")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              mode === "dsa"
                ? "bg-[#2f5f5f] text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-cream-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Study Partners</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// Profile Setup Component
function ProfileSetupPage({ onComplete, onCancel }: { onComplete: (data: ProfileData) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    title: "",
    bio: "",
    location: "",
    experience: "",
    availability: "",
    lookingFor: [],
    github: "",
    linkedin: "",
    portfolio: "",
  })

  const lookingForOptions = [
    "Project Collaborators",
    "Study Partners",
    "Mentorship",
    "Code Reviews",
    "Career Advice",
    "Networking",
    "Mock Interviews",
  ]

  const handleLookingForChange = (option: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: checked ? [...prev.lookingFor, option] : prev.lookingFor.filter((item) => item !== option),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-cream-300 bg-cream-100 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onCancel} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">Setup Your Profile</h2>
            <div className="w-16"></div>
          </div>
          <p className="text-gray-600">Tell us about yourself to find the perfect coding partners</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="border-cream-300 focus:border-[#8b1538]"
                />
              </div>
              <div>
                <Label htmlFor="title">Professional Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Full Stack Developer"
                  required
                  className="border-cream-300 focus:border-[#8b1538]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about your background, interests, and what you're passionate about..."
                required
                className="border-cream-300 focus:border-[#8b1538] min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., San Francisco, CA"
                  className="border-cream-300 focus:border-[#8b1538]"
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience Level *</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger className="border-cream-300 focus:border-[#8b1538]">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry Level">Entry Level</SelectItem>
                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5+ years">5+ years</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="availability">Availability *</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, availability: value }))}
              >
                <SelectTrigger className="border-cream-300 focus:border-[#8b1538]">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Weekends only">Weekends only</SelectItem>
                  <SelectItem value="Evenings">Evenings</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>What are you looking for? *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {lookingForOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.lookingFor.includes(option)}
                      onCheckedChange={(checked) => handleLookingForChange(option, checked as boolean)}
                    />
                    <Label htmlFor={option} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Social Links (Optional)</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-gray-500" />
                  <Input
                    value={formData.github}
                    onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                    placeholder="GitHub profile URL"
                    className="border-cream-300 focus:border-[#8b1538]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-gray-500" />
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="LinkedIn profile URL"
                    className="border-cream-300 focus:border-[#8b1538]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <Input
                    value={formData.portfolio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, portfolio: e.target.value }))}
                    placeholder="Portfolio website URL"
                    className="border-cream-300 focus:border-[#8b1538]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#8b1538] hover:bg-[#7a1230] text-white"
                disabled={
                  !formData.name ||
                  !formData.title ||
                  !formData.bio ||
                  !formData.experience ||
                  !formData.availability ||
                  formData.lookingFor.length === 0
                }
              >
                Create Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PeerMatchingPage() {
  const [mode, setMode] = useState<"resume" | "dsa">("resume")
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showProfileView, setShowProfileView] = useState(false)
  const [isPublicProfile, setIsPublicProfile] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [resumePeers, setResumePeers] = useState<ResumePeer[]>([])
  const [dsaPeers, setDSAPeers] = useState<DSAPeer[]>([])
  const [loadingResume, setLoadingResume] = useState(false)
  const [loadingDSA, setLoadingDSA] = useState(false)
  const [hasResumeData, setHasResumeData] = useState(false)
  const [hasLeetCodeData, setHasLeetCodeData] = useState(false)
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set())
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const peerPermission = localStorage.getItem("peer-permission-granted")
    const savedProfile = localStorage.getItem("peer-profile-data")

    setIsPublicProfile(!!peerPermission)
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile))
    }

    const skillsData = localStorage.getItem("user-skills") || localStorage.getItem("extracted-skills")
    setHasResumeData(!!skillsData)

    const leetcodeData = localStorage.getItem("leetcode-connected")
    setHasLeetCodeData(!!leetcodeData)

    if (peerPermission && savedProfile) {
      loadResumePeers()
    }

    // Load mock posts
    const mockPosts: Post[] = [
      {
        id: "1",
        author: "Luna Fox",
        avatar: "/placeholder.svg?height=40&width=40&text=LF",
        content:
          "Just completed our hackathon project! Built a real-time collaboration tool with my study buddy Tiger Bear. Amazing what we can achieve together! 🚀",
        achievement: "Won 2nd place at TechHack 2024",
        timestamp: "2 hours ago",
        likes: 24,
        comments: 8,
        tags: ["Hackathon", "Collaboration", "React"],
      },
      {
        id: "2",
        author: "Panda Wolf",
        avatar: "/placeholder.svg?height=40&width=40&text=PW",
        content:
          "Shoutout to my coding partner Eagle Deer for helping me crack dynamic programming! We solved 15 hard problems together this week.",
        achievement: "Solved 100+ LeetCode problems",
        timestamp: "5 hours ago",
        likes: 18,
        comments: 5,
        tags: ["DSA", "Study Partners", "Achievement"],
      },
      {
        id: "3",
        author: "Rabbit Owl",
        avatar: "/placeholder.svg?height=40&width=40&text=RO",
        content:
          "Our open source project just hit 1k stars! Grateful for my amazing co-maintainer Dolphin Cat. Teamwork makes the dream work! ⭐",
        achievement: "Open Source Milestone",
        timestamp: "1 day ago",
        likes: 42,
        comments: 12,
        tags: ["Open Source", "Milestone", "Teamwork"],
      },
    ]
    setPosts(mockPosts)
  }, [])

  const loadResumePeers = async () => {
    setLoadingResume(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockPeers: ResumePeer[] = [
        {
          id: "1",
          name: "Koala Bear",
          title: "Full Stack Developer",
          company: "Tech Corp",
          location: "San Francisco, CA",
          avatar: "/placeholder.svg?height=80&width=80&text=KB",
          bio: "Passionate full-stack developer with 3 years of experience building scalable web applications. Love working with React and Node.js, always eager to learn new technologies and collaborate on exciting projects.",
          sharedSkills: ["React", "Node.js", "TypeScript"],
          complementarySkills: ["Python", "AWS", "Docker", "GraphQL"],
          domains: ["Web Development", "Cloud Computing"],
          matchScore: 92,
          isOnline: true,
          github: "https://github.com/koalabear",
          linkedin: "https://linkedin.com/in/koalabear",
          experience: "3-5 years",
          availability: "Part-time",
          lookingFor: ["Project Collaborators", "Code Reviews"],
        },
        {
          id: "2",
          name: "Butterfly Shark",
          title: "Frontend Developer",
          company: "StartupXYZ",
          location: "Remote",
          avatar: "/placeholder.svg?height=80&width=80&text=BS",
          bio: "Creative frontend developer specializing in React and modern CSS. I enjoy creating beautiful, accessible user interfaces and have a keen eye for design details.",
          sharedSkills: ["JavaScript", "React", "CSS"],
          complementarySkills: ["Vue.js", "GraphQL", "Figma"],
          domains: ["Web Development", "UI/UX"],
          matchScore: 85,
          isOnline: false,
          linkedin: "https://linkedin.com/in/butterflyshark",
          portfolio: "https://butterflyshark.dev",
          experience: "1-3 years",
          availability: "Flexible",
          lookingFor: ["Project Collaborators", "Mentorship"],
        },
      ]

      setResumePeers(mockPeers)
    } catch (error) {
      console.error("Failed to load resume peers:", error)
    } finally {
      setLoadingResume(false)
    }
  }

  const loadDSAPeers = async () => {
    setLoadingDSA(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const mockPeers: DSAPeer[] = [
        {
          id: "1",
          name: "Tiger Rabbit",
          location: "Seattle, WA",
          avatar: "/placeholder.svg?height=80&width=80&text=TR",
          bio: "Computer Science student passionate about algorithms and competitive programming. Currently preparing for technical interviews and love solving challenging problems.",
          strengths: ["Arrays", "Graphs", "Dynamic Programming"],
          weakAreas: ["Trees", "Greedy Algorithms"],
          easySolved: 145,
          mediumSolved: 98,
          hardSolved: 32,
          totalSolved: 275,
          matchScore: 94,
          isOnline: true,
          github: "https://github.com/tigerrabbit",
          experience: "Student",
          availability: "Flexible",
          lookingFor: ["Study Partners", "Mock Interviews"],
        },
      ]

      setDSAPeers(mockPeers)
    } catch (error) {
      console.error("Failed to load DSA peers:", error)
    } finally {
      setLoadingDSA(false)
    }
  }

  const handleModeChange = (newMode: "resume" | "dsa") => {
    if (!isPublicProfile) {
      setShowProfileSetup(true)
      return
    }

    setMode(newMode)

    if (newMode === "resume" && resumePeers.length === 0) {
      loadResumePeers()
    } else if (newMode === "dsa" && dsaPeers.length === 0) {
      loadDSAPeers()
    }
  }

  const handleProfileSetupComplete = (data: ProfileData) => {
    setProfileData(data)
    setIsPublicProfile(true)
    setShowProfileSetup(false)

    localStorage.setItem("peer-permission-granted", "true")
    localStorage.setItem("peer-profile-data", JSON.stringify(data))

    loadResumePeers()
    if (hasLeetCodeData) {
      loadDSAPeers()
    }
  }

  const handleSkip = (peerId: string) => {
    setAnimatingCards((prev) => new Set(prev).add(`${peerId}-skip`))

    setTimeout(() => {
      if (mode === "resume") {
        setResumePeers((prev) => prev.filter((peer) => peer.id !== peerId))
      } else {
        setDSAPeers((prev) => prev.filter((peer) => peer.id !== peerId))
      }
      setAnimatingCards((prev) => {
        const newSet = new Set(prev)
        newSet.delete(`${peerId}-skip`)
        return newSet
      })
    }, 600)
  }

  const handleConnect = (peerId: string) => {
    setAnimatingCards((prev) => new Set(prev).add(`${peerId}-connect`))

    setTimeout(() => {
      if (mode === "resume") {
        setResumePeers((prev) => prev.filter((peer) => peer.id !== peerId))
      } else {
        setDSAPeers((prev) => prev.filter((peer) => peer.id !== peerId))
      }
      setAnimatingCards((prev) => {
        const newSet = new Set(prev)
        newSet.delete(`${peerId}-connect`)
        return newSet
      })
    }, 600)
  }

  if (showProfileSetup) {
    return <ProfileSetupPage onComplete={handleProfileSetupComplete} onCancel={() => setShowProfileSetup(false)} />
  }

  if (showProfileView && profileData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-cream-300 bg-cream-100 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-[#8b1538] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
            <p className="text-[#8b1538] font-medium">{profileData.title}</p>
            {profileData.location && <p className="text-gray-600">{profileData.location}</p>}
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700">{profileData.bio}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Experience</h4>
                <p className="text-gray-600">{profileData.experience}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Availability</h4>
                <p className="text-gray-600">{profileData.availability}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Looking For</h4>
              <div className="flex flex-wrap gap-2">
                {profileData.lookingFor.map((item) => (
                  <Badge key={item} className="bg-[#8b1538]/10 text-[#8b1538] border-[#8b1538]/20">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowProfileView(false)}
              className="w-full bg-[#8b1538] hover:bg-[#7a1230] text-white"
            >
              Back to Matching
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderEmptyState = () => {
    if (!isPublicProfile) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-[#8b1538] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Upload className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Setup Your Profile</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your profile to start connecting with amazing developers who share your interests and goals.
          </p>
          <Button
            onClick={() => setShowProfileSetup(true)}
            className="bg-[#8b1538] hover:bg-[#7a1230] text-white border-0"
          >
            <Settings className="h-4 w-4 mr-2" />
            Setup Profile
          </Button>
        </div>
      )
    }

    if (mode === "resume" && !hasResumeData) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-[#8b1538] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Upload className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Your Resume First</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            To find project partners with complementary skills, we need to analyze your resume and extract your skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-[#8b1538] hover:bg-[#7a1230] text-white border-0">
              <Link href="/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent border-cream-300">
              <Link href="/onboarding">
                <FileText className="h-4 w-4 mr-2" />
                Manual Entry
              </Link>
            </Button>
          </div>
        </div>
      )
    }

    if (mode === "dsa" && !hasLeetCodeData) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-[#2f5f5f] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Code className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Connect Your LeetCode</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            To find algorithm study partners with complementary strengths, connect your LeetCode profile for analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-[#2f5f5f] hover:bg-[#1f4f4f] text-white border-0">
              <Link href="/leetcode">
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect LeetCode
              </Link>
            </Button>
            <Button variant="outline" className="bg-transparent border-cream-300">
              <HelpCircle className="h-4 w-4 mr-2" />
              Why connect?
            </Button>
          </div>
        </div>
      )
    }

    return null
  }

  const currentPeers = mode === "resume" ? resumePeers : dsaPeers
  const isLoading = mode === "resume" ? loadingResume : loadingDSA

  if (!isPublicProfile || !currentPeers.length || isLoading) {
    return (
      <div className="min-h-screen skillmap-bg p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Coding Peers</h1>
              <p className="text-gray-600">Connect with developers who complement your skills and learning goals</p>
            </div>

            <ModeToggle mode={mode} onModeChange={handleModeChange} />

            {renderEmptyState()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen skillmap-bg p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Coding Peers</h1>
            <p className="text-gray-600">Connect with developers who complement your skills and learning goals</p>
          </div>

          <ModeToggle mode={mode} onModeChange={handleModeChange} />

          <div className="w-full">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max px-4">
                <AnimatePresence>
                  {currentPeers.slice(0, 8).map((peer) => (
                    <motion.div
                      key={peer.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 50 }}
                      animate={
                        animatingCards.has(`${peer.id}-skip`)
                          ? { opacity: 0, scale: 0.8, y: 100 }
                          : animatingCards.has(`${peer.id}-connect`)
                            ? { opacity: 0, scale: 0.8, y: -100 }
                            : { opacity: 1, scale: 1, y: 0 }
                      }
                      exit={{ opacity: 0, scale: 0.8, y: 100 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        layout: { duration: 0.3 },
                      }}
                      className="flex-shrink-0 w-80"
                    >
                      <Card className="h-[500px] border-2 border-cream-300 bg-white shadow-xl hover:shadow-2xl transition-shadow">
                        <CardContent className="p-6 h-full flex flex-col">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <img
                                src={peer.avatar || "/placeholder.svg"}
                                alt={peer.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-cream-300"
                              />
                              {peer.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate">{peer.name}</h3>
                              {"title" in peer && peer.title && (
                                <p className="text-[#8b1538] font-medium text-sm truncate">{peer.title}</p>
                              )}
                              {peer.location && <p className="text-gray-600 text-xs truncate">{peer.location}</p>}
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-[#8b1538]">{peer.matchScore}%</div>
                              <div className="text-xs text-gray-500">Match</div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-3 overflow-y-auto">
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{peer.bio}</p>

                            {mode === "resume" && "sharedSkills" in peer && (
                              <>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Shared Skills</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {peer.sharedSkills.slice(0, 3).map((skill) => (
                                      <Badge
                                        key={skill}
                                        className="bg-[#8b1538]/10 text-[#8b1538] border-[#8b1538]/20 text-xs"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                    {peer.sharedSkills.length > 3 && (
                                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                                        +{peer.sharedSkills.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Complementary Skills</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {peer.complementarySkills.slice(0, 3).map((skill) => (
                                      <Badge
                                        key={skill}
                                        className="bg-[#2f5f5f]/10 text-[#2f5f5f] border-[#2f5f5f]/20 text-xs"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                    {peer.complementarySkills.length > 3 && (
                                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                                        +{peer.complementarySkills.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}

                            {mode === "dsa" && "strengths" in peer && (
                              <>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Strengths</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {peer.strengths.slice(0, 3).map((strength) => (
                                      <Badge
                                        key={strength}
                                        className="bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]/20 text-xs"
                                      >
                                        {strength}
                                      </Badge>
                                    ))}
                                    {peer.strengths.length > 3 && (
                                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                                        +{peer.strengths.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-1 text-center">
                                  <div className="bg-green-50 p-2 rounded">
                                    <div className="text-sm font-bold text-green-600">{peer.easySolved}</div>
                                    <div className="text-xs text-gray-600">Easy</div>
                                  </div>
                                  <div className="bg-yellow-50 p-2 rounded">
                                    <div className="text-sm font-bold text-yellow-600">{peer.mediumSolved}</div>
                                    <div className="text-xs text-gray-600">Med</div>
                                  </div>
                                  <div className="bg-red-50 p-2 rounded">
                                    <div className="text-sm font-bold text-red-600">{peer.hardSolved}</div>
                                    <div className="text-xs text-gray-600">Hard</div>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-sm font-bold text-gray-600">{peer.totalSolved}</div>
                                    <div className="text-xs text-gray-600">Total</div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex gap-3 mt-4">
                            <motion.button
                              onClick={() => handleSkip(peer.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                            >
                              Skip
                            </motion.button>
                            <motion.button
                              onClick={() => handleConnect(peer.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 py-2 px-4 bg-[#8b1538] hover:bg-[#7a1230] text-white rounded-lg font-medium transition-colors text-sm"
                            >
                              Connect
                            </motion.button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {currentPeers.length > 4 && (
              <div className="flex justify-center mt-4">
                <p className="text-sm text-gray-500">← Scroll to see more profiles →</p>
              </div>
            )}
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Collaborative Achievements</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="border border-cream-300 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={post.avatar || "/placeholder.svg"}
                        alt={post.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{post.author}</h4>
                          <span className="text-gray-500 text-sm">•</span>
                          <span className="text-gray-500 text-sm">{post.timestamp}</span>
                        </div>
                        <div className="bg-[#8b1538]/5 border border-[#8b1538]/20 rounded-lg p-3 mb-3">
                          <div className="text-[#8b1538] font-medium text-sm mb-1">🏆 Achievement Unlocked</div>
                          <div className="text-gray-900 font-semibold">{post.achievement}</div>
                        </div>
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <Badge key={tag} className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 text-gray-500">
                          <button className="flex items-center gap-2 hover:text-[#8b1538] transition-colors">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">{post.likes}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-[#8b1538] transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{post.comments}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-[#8b1538] transition-colors">
                            <Share2 className="h-4 w-4" />
                            <span className="text-sm">Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
