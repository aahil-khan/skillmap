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
  Loader2,
} from "lucide-react"
import {
  getPeerProfile,
  upsertPeerProfile,
  getRecommendedMatches,
  sendConnectionRequest,
  skipPeer,
  type PeerMatch,
  type CreatePeerProfileData,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Types
interface ProfileData {
  display_name: string
  title: string
  bio: string
  experience_level: 'Entry Level' | '1-3 years' | '3-5 years' | '5+ years' | 'Student'
  availability: 'Full-time' | 'Part-time' | 'Weekends only' | 'Evenings' | 'Flexible'
  looking_for: ('project' | 'dsa' | 'mentorship')[]
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
function ProfileSetupPage({ 
  onComplete, 
  onCancel,
  existingData 
}: { 
  onComplete: (data: ProfileData) => void
  onCancel: () => void
  existingData?: ProfileData | null
}) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProfileData>(
    existingData || {
      display_name: "",
      title: "",
      bio: "",
      experience_level: "1-3 years",
      availability: "Flexible",
      looking_for: [],
    }
  )

  const lookingForOptions: Array<{ value: 'project' | 'dsa' | 'mentorship'; label: string }> = [
    { value: "project", label: "Project Collaborators" },
    { value: "dsa", label: "Study Partners (DSA)" },
    { value: "mentorship", label: "Mentorship" },
  ]

  const handleLookingForChange = (option: 'project' | 'dsa' | 'mentorship', checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      looking_for: checked ? [...prev.looking_for, option] : prev.looking_for.filter((item) => item !== option),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await upsertPeerProfile(formData)
      toast({
        title: existingData ? "Profile updated!" : "Profile created!",
        description: existingData 
          ? "Your peer matching profile has been updated."
          : "Your peer matching profile is now active.",
      })
      onComplete(formData)
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      toast({
        title: existingData ? "Failed to update profile" : "Failed to create profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
            <h2 className="text-2xl font-bold text-gray-900">
              {existingData ? "Edit Your Profile" : "Setup Your Profile"}
            </h2>
            <div className="w-16"></div>
          </div>
          <p className="text-gray-600">
            {existingData 
              ? "Update your profile to refine your matches"
              : "Tell us about yourself to find the perfect coding partners"}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                required
                className="border-cream-300 focus:border-[#8b1538]"
                placeholder="How should we call you?"
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
                <Label htmlFor="experience_level">Experience Level *</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value: 'Entry Level' | '1-3 years' | '3-5 years' | '5+ years' | 'Student') => 
                    setFormData((prev) => ({ ...prev, experience_level: value }))
                  }
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
              <div>
                <Label htmlFor="availability">Availability *</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value: 'Full-time' | 'Part-time' | 'Weekends only' | 'Evenings' | 'Flexible') => 
                    setFormData((prev) => ({ ...prev, availability: value }))
                  }
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
            </div>

            <div>
              <Label>What are you looking for? *</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {lookingForOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={formData.looking_for.includes(option.value)}
                      onCheckedChange={(checked) => handleLookingForChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#8b1538] hover:bg-[#7a1230] text-white"
                disabled={
                  isSubmitting ||
                  !formData.display_name ||
                  !formData.title ||
                  !formData.bio ||
                  !formData.experience_level ||
                  !formData.availability ||
                  formData.looking_for.length === 0
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {existingData ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  existingData ? "Update Profile" : "Create Profile"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PeerMatchingPage() {
  const { toast } = useToast()
  const [mode, setMode] = useState<"resume" | "dsa">("resume")
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showProfileView, setShowProfileView] = useState(false)
  const [isPublicProfile, setIsPublicProfile] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [matches, setMatches] = useState<PeerMatch[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [hasLeetCodeData, setHasLeetCodeData] = useState(false)
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set())
  const [posts, setPosts] = useState<Post[]>([])

  // Load profile on mount
  useEffect(() => {
    loadPeerProfile()
  }, [])

  const loadPeerProfile = async () => {
    setLoadingProfile(true)
    try {
      const profile = await getPeerProfile()
      if (profile) {
        setIsPublicProfile(true)
        setProfileData({
          display_name: profile.display_name,
          title: profile.title,
          bio: profile.bio,
          experience_level: profile.experience_level,
          availability: profile.availability,
          looking_for: profile.looking_for,
        })
        // Load matches if profile exists
        loadMatches()
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadMatches = async (matchType: 'project' | 'dsa' | 'both' = 'both') => {
    setLoadingMatches(true)
    try {
      const fetchedMatches = await getRecommendedMatches(matchType, 20)
      setMatches(Array.isArray(fetchedMatches) ? fetchedMatches : [])
    } catch (error: any) {
      console.error("Failed to load matches:", error)
      setMatches([]) // Set empty array on error
      toast({
        title: "Failed to load matches",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingMatches(false)
    }
  }

  useEffect(() => {
    // Check if user has LeetCode data
    const leetcodeData = localStorage.getItem("leetcode-connected")
    setHasLeetCodeData(!!leetcodeData)

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

  const handleModeChange = (newMode: "resume" | "dsa") => {
    if (!isPublicProfile) {
      setShowProfileSetup(true)
      return
    }

    setMode(newMode)
    
    // Reload matches with new filter
    const matchType = newMode === "resume" ? "project" : "dsa"
    loadMatches(matchType)
  }

  const handleProfileSetupComplete = (data: ProfileData) => {
    setProfileData(data)
    setIsPublicProfile(true)
    setShowProfileSetup(false)
    // Load matches after profile setup
    loadMatches()
  }

  const handleSkip = async (peerId: string) => {
    setAnimatingCards((prev) => new Set(prev).add(`${peerId}-skip`))

    // Find match score for this peer
    const peer = matches.find(m => m.peerUserId === peerId)
    const matchScore = peer?.overallScore || 0

    try {
      await skipPeer(peerId, matchScore)
    } catch (error) {
      console.error("Failed to track skip:", error)
    }

    setTimeout(() => {
      setMatches((prev) => prev.filter((match) => match.peerUserId !== peerId))
      setAnimatingCards((prev) => {
        const newSet = new Set(prev)
        newSet.delete(`${peerId}-skip`)
        return newSet
      })
    }, 600)
  }

  const handleConnect = async (peerId: string) => {
    setAnimatingCards((prev) => new Set(prev).add(`${peerId}-connect`))

    // Determine connection type based on mode
    const connectionType = mode === "resume" ? "project" : "dsa"

    try {
      await sendConnectionRequest({
        receiverId: peerId,
        connectionType,
      })
      
      toast({
        title: "Connection request sent!",
        description: "You'll be notified when they respond.",
      })
    } catch (error: any) {
      console.error("Failed to send connection:", error)
      toast({
        title: "Failed to send request",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    }

    setTimeout(() => {
      setMatches((prev) => prev.filter((match) => match.peerUserId !== peerId))
      setAnimatingCards((prev) => {
        const newSet = new Set(prev)
        newSet.delete(`${peerId}-connect`)
        return newSet
      })
    }, 600)
  }

  if (showProfileSetup) {
    return (
      <ProfileSetupPage 
        onComplete={handleProfileSetupComplete} 
        onCancel={() => setShowProfileSetup(false)}
        existingData={profileData}
      />
    )
  }

  if (showProfileView && profileData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-cream-300 bg-cream-100 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-[#8b1538] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{profileData.display_name}</h2>
            <p className="text-[#8b1538] font-medium">{profileData.title}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700">{profileData.bio}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Experience</h4>
                <p className="text-gray-600 capitalize">{profileData.experience_level}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Availability</h4>
                <p className="text-gray-600 capitalize">{profileData.availability}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Looking For</h4>
              <div className="flex flex-wrap gap-2">
                {profileData.looking_for.map((item) => (
                  <Badge key={item} className="bg-[#8b1538]/10 text-[#8b1538] border-[#8b1538]/20 capitalize">
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
    if (loadingProfile) {
      return (
        <div className="text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-[#8b1538] mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      )
    }

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

    if (loadingMatches) {
      return (
        <div className="text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-[#8b1538] mx-auto mb-4" />
          <p className="text-gray-600">Finding your perfect matches...</p>
        </div>
      )
    }

    if (matches.length === 0) {
      return (
        <div className="text-center py-16">
          <h3 className="text-xl font-bold text-gray-900 mb-3">No matches found</h3>
          <p className="text-gray-600 mb-6">Check back later for new potential connections!</p>
        </div>
      )
    }

    return null
  }

  if (!isPublicProfile || loadingProfile) {
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

          {/* Profile Summary Card */}
          {profileData && (
            <Card className="border-2 border-cream-300 bg-cream-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-[#8b1538] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{profileData.display_name}</h3>
                      <p className="text-[#8b1538] font-medium text-sm mb-2">{profileData.title}</p>
                      <p className="text-gray-700 text-sm line-clamp-2 mb-3">{profileData.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {profileData.experience_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {profileData.availability}
                        </Badge>
                        {profileData.looking_for.map((item) => (
                          <Badge key={item} className="bg-[#8b1538]/10 text-[#8b1538] border-[#8b1538]/20 capitalize text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowProfileSetup(true)}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <ModeToggle mode={mode} onModeChange={handleModeChange} />

          {/* Empty states and loading */}
          {loadingMatches ? (
            <div className="text-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-[#8b1538] mx-auto mb-4" />
              <p className="text-gray-600">Finding your perfect matches...</p>
            </div>
          ) : mode === "dsa" && !hasLeetCodeData ? (
            <div className="text-center py-16">
              <Card className="max-w-md mx-auto border-2 border-cream-300 bg-cream-50">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-[#2f5f5f] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Code className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Connect Your LeetCode</h3>
                  <p className="text-gray-600 mb-6">
                    To find algorithm study partners with complementary strengths, connect your LeetCode profile for analysis.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild className="bg-[#2f5f5f] hover:bg-[#1f4f4f] text-white border-0">
                      <Link href="/leetcode">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect LeetCode
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16">
              <Card className="max-w-md mx-auto border-2 border-cream-300 bg-cream-50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No matches found</h3>
                  <p className="text-gray-600 mb-4">
                    {mode === "dsa" 
                      ? "We couldn't find any study partners matching your LeetCode profile right now."
                      : "We couldn't find any project partners matching your profile right now."}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Check back later as more developers join the platform!
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Matches display */
            <div className="w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {mode === "dsa" ? "Your Study Partner Matches" : "Your Project Partner Matches"}
              </h2>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max px-4">
                <AnimatePresence>
                  {matches.slice(0, 8).map((peer) => (
                    <motion.div
                      key={peer.peerUserId}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 50 }}
                      animate={
                        animatingCards.has(`${peer.peerUserId}-skip`)
                          ? { opacity: 0, scale: 0.8, y: 100 }
                          : animatingCards.has(`${peer.peerUserId}-connect`)
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
                              <div className="w-12 h-12 bg-[#8b1538] rounded-full flex items-center justify-center text-white font-bold border-2 border-cream-300">
                                {peer.displayName.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate">{peer.displayName}</h3>
                              <p className="text-[#8b1538] font-medium text-sm truncate">{peer.title}</p>
                              <p className="text-gray-600 text-xs capitalize">{peer.experienceLevel}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-[#8b1538]">{Math.round(peer.overallScore)}</div>
                              <div className="text-xs text-gray-500">Match</div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-3 overflow-y-auto">
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{peer.bio}</p>

                            {peer.sharedSkills && peer.sharedSkills.length > 0 && (
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
                            )}

                            {peer.complementarySkills && peer.complementarySkills.length > 0 && (
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
                            )}

                            {peer.leetcodeStats && (
                              <div className="grid grid-cols-4 gap-1 text-center">
                                <div className="bg-green-50 p-2 rounded">
                                  <div className="text-sm font-bold text-green-600">{peer.leetcodeStats.easy_solved}</div>
                                  <div className="text-xs text-gray-600">Easy</div>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded">
                                  <div className="text-sm font-bold text-yellow-600">{peer.leetcodeStats.medium_solved}</div>
                                  <div className="text-xs text-gray-600">Med</div>
                                </div>
                                <div className="bg-red-50 p-2 rounded">
                                  <div className="text-sm font-bold text-red-600">{peer.leetcodeStats.hard_solved}</div>
                                  <div className="text-xs text-gray-600">Hard</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="text-sm font-bold text-gray-600">{peer.leetcodeStats.total_solved}</div>
                                  <div className="text-xs text-gray-600">Total</div>
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Looking For</h4>
                              <div className="flex flex-wrap gap-1">
                                {peer.lookingFor.slice(0, 3).map((item) => (
                                  <Badge key={item} className="bg-gray-100 text-gray-700 border-gray-200 text-xs capitalize">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-4">
                            <motion.button
                              onClick={() => handleSkip(peer.peerUserId)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                            >
                              Skip
                            </motion.button>
                            <motion.button
                              onClick={() => handleConnect(peer.peerUserId)}
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

            {matches.length > 4 && (
              <div className="flex justify-center mt-4">
                <p className="text-sm text-gray-500">← Scroll to see more profiles →</p>
              </div>
            )}
            </div>
          )}

          {/* Collaborative Achievements section - only show if there are matches */}
          {matches.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  )
}
