"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer } from "recharts"
import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"
import {
  Menu,
  User,
  Code,
  Trophy,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  LinkIcon,
  Zap,
  BookOpen,
  BarChart3,
  Activity,
  Star,
  ArrowRight,
  X,
  UserCircle,
  FileText,
  Home,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"

interface LeetCodeProfile {
  username: string
  name?: string // realName from backend
  birthday?: string | null
  avatar?: string
  ranking: number
  reputation?: number | null
  gitHub?: string | null
  twitter?: string | null
  linkedIN?: string | null
  website?: string[]
  country?: string | null
  company?: string | null
  school?: string | null
  skillTags: string[]
  about?: string
  // Additional fields from other API calls
  totalSolved?: number
  totalQuestions?: number
  easySolved?: number
  mediumSolved?: number
  hardSolved?: number
  acceptanceRate?: number
  ranking_percentile?: number
}

interface ProblemStats {
  difficulty: "Easy" | "Medium" | "Hard"
  solved: number
  total: number
  percentage: number
  color: string
  avgTime: number // average time taken in minutes
}

interface SubmissionData {
  date: string
  count: number
}

interface TopicAnalysis {
  topic: string
  solved: number
  total: number
  percentage: number
  strength: "Strong" | "Good" | "Needs Work" | "Weak"
}

interface RecentSubmission {
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded"
  timestamp: string
  runtime: string
  memory: string
  language: string
}

/**
 * Calculate top percentile from LeetCode ranking
 * LeetCode has approximately 20 million users (as of 2024)
 * @param ranking - User's current ranking position
 * @param totalUsers - Total number of LeetCode users (default: 20,000,000)
 * @returns Percentile as a number (e.g., 85.5 for top 85.5%)
 */
const calculateTopPercentile = (ranking: number, totalUsers: number = 20000000): number => {
  if (!ranking || ranking <= 0) return 0;
  if (ranking > totalUsers) return 0;
  
  // Calculate what percentage of users this person is better than
  const percentile = ((totalUsers - ranking) / totalUsers) * 100;
  
  // Round to 1 decimal place for clean display
  return Math.round(percentile * 10) / 10;
};

export default function LeetCodePage() {

  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis[]>([
    {
      topic: "Array",
      solved: 42,
      total: 60,
      percentage: 70,
      strength: "Strong",
    },
    {
      topic: "Graph",
      solved: 19,
      total: 50,
      percentage: 38,
      strength: "Needs Work",
    },
    {
      topic: "Tree",
      solved: 28,
      total: 40,
      percentage: 70,
      strength: "Good",
    },
    {
      topic: "Dynamic Programming",
      solved: 15,
      total: 35,
      percentage: 43,
      strength: "Good",
    },
    {
      topic: "Backtracking",
      solved: 10,
      total: 30,
      percentage: 33,
      strength: "Needs Work",
    },
    {
      topic: "String",
      solved: 25,
      total: 40,
      percentage: 62.5,
      strength: "Good",
    },
  ]);

  
  // Handles disconnecting the user's LeetCode account
  const handleDisconnect = () => {
    setIsConnected(false);
    setProfile(null);
    localStorage.removeItem("leetcode-connected");
    localStorage.removeItem("leetcode-username");
    localStorage.removeItem("leetcode-profile");
  };
  // Handles connecting the user's LeetCode account
  const handleConnect = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5005/api/leetcode/${username}`);
      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      
      if (response.ok) {
        // Fetch detailed profile information
        let detailedProfile = {};
        try {
          const profileResponse = await fetch(`http://localhost:5005/api/leetcode/${username}/profile`);
          const profileData = await profileResponse.json();
          
          if (profileResponse.ok) {
            detailedProfile = {
              name: profileData.name,
              avatar: profileData.avatar,
              ranking: profileData.ranking,
              reputation: profileData.reputation,
              gitHub: profileData.gitHub,
              twitter: profileData.twitter,
              linkedIN: profileData.linkedIN,
              website: profileData.website,
              country: profileData.country,
              company: profileData.company,
              school: profileData.school,
              skillTags: profileData.skillTags || [],
              about: profileData.about,
            };
          }
        } catch (profileError) {
          console.error('Error fetching detailed profile:', profileError);
        }
        
        // Create profile object with API data + detailed profile + mock data for other fields
        const finalRanking = (detailedProfile as any).ranking || data.ranking;
        const profileData = {
          ...mockProfile, // Keep all mock data as defaults
          ...detailedProfile, // Override with detailed profile data
          username: data.username,
          totalSolved: data.totalSolved,
          acceptanceRate: parseFloat(data.acceptanceRate.replace('%', '')), // Remove % and convert to number
          ranking: finalRanking,
          ranking_percentile: calculateTopPercentile(finalRanking), // Calculate percentile from ranking
        };
        
        // Update problem stats with backend data
        const updatedProblemStats: ProblemStats[] = [
          { 
            difficulty: "Easy", 
            solved: data.problemStats.easy.solved, 
            total: data.problemStats.easy.total, 
            percentage: data.problemStats.easy.percentage, 
            color: "#10b981", 
            avgTime: data.problemStats.easy.avgTime 
          },
          { 
            difficulty: "Medium", 
            solved: data.problemStats.medium.solved, 
            total: data.problemStats.medium.total, 
            percentage: data.problemStats.medium.percentage, 
            color: "#f59e0b", 
            avgTime: data.problemStats.medium.avgTime 
          },
          { 
            difficulty: "Hard", 
            solved: data.problemStats.hard.solved, 
            total: data.problemStats.hard.total, 
            percentage: data.problemStats.hard.percentage, 
            color: "#ef4444", 
            avgTime: data.problemStats.hard.avgTime 
          },
        ];
        
        console.log('Profile Data to Save:', profileData); // Debug log
        
        setIsConnected(true);
        setProfile(profileData);
        setProblemStats(updatedProblemStats);
        
        // Fetch recent submissions from backend
        try {
          const submissionsResponse = await fetch(`http://localhost:5005/api/leetcode/${username}/submission?limit=5`);
          const submissionsData = await submissionsResponse.json();
          
          if (submissionsResponse.ok) {
            // Transform backend submissions to match frontend interface
            const transformedSubmissions: RecentSubmission[] = submissionsData.submissions.map((sub: any) => ({
              title: sub.title,
              difficulty: "Medium", // Default since backend doesn't provide this
              status: sub.statusDisplay,
              timestamp: new Date(parseInt(sub.timestamp) * 1000).toLocaleString(), // Convert Unix timestamp
              runtime: "N/A", // Backend doesn't provide this
              memory: "N/A", // Backend doesn't provide this
              language: sub.lang === "cpp" ? "C++" : sub.lang.charAt(0).toUpperCase() + sub.lang.slice(1),
            }));
            
            setRecentSubmissions(transformedSubmissions);
          }
        } catch (submissionError) {
          console.error('Error fetching submissions:', submissionError);
          // Keep mock data if submissions fetch fails
        }
        
        // Fetch languages data from backend
        try {
          const languagesResponse = await fetch(`http://localhost:5005/api/leetcode/${username}/languages`);
          const languagesData = await languagesResponse.json();
          
          if (languagesResponse.ok) {
            // Define color palette for languages
            const languageColors = ["#4F8EF7", "#E76F51", "#2A9D8F", "#F59E0B", "#8B5CF6", "#10B981"];
            
            // Transform backend languages to match frontend interface
            const transformedLanguages = languagesData.languages.map((lang: any, index: number) => ({
              language: lang.languageName,
              submissions: lang.problemsSolved, // Use problemsSolved as submissions count
              accepted: Math.floor(lang.problemsSolved * 0.8), // Estimate 80% acceptance rate
              successRate: 80.0, // Default success rate since backend doesn't provide this
              trend: "+0.0%", // Default trend since backend doesn't provide this
              color: languageColors[index % languageColors.length],
            }));
            
            setLanguageBreakdown(transformedLanguages);
          }
        } catch (languageError) {
          console.error('Error fetching languages:', languageError);
          // Keep mock data if languages fetch fails
        }
        
        // Fetch topics data from backend
        try {
          const topicsResponse = await fetch(`http://localhost:5005/api/leetcode/${username}/topics`);
          const topicsData = await topicsResponse.json();
          
          if (topicsResponse.ok) {
            // Combine all topics from different difficulty levels
            const allTopics = [
              ...(topicsData.topics.fundamental || []),
              ...(topicsData.topics.intermediate || []),
              ...(topicsData.topics.advanced || [])
            ];
            
            // Transform backend topics to match frontend interface
            const transformedTopics: TopicAnalysis[] = allTopics.map((topic: any) => {
              // Estimate total problems based on solved count and difficulty level
              const estimatedTotal = Math.ceil(topic.problemsSolved / 0.6); // Assume 60% completion rate
              const percentage = (topic.problemsSolved / estimatedTotal) * 100;
              
              // Determine strength based on problems solved and percentage
              let strength: "Strong" | "Good" | "Needs Work" | "Weak";
              if (percentage >= 80) strength = "Strong";
              else if (percentage >= 60) strength = "Good";
              else if (percentage >= 40) strength = "Needs Work";
              else strength = "Weak";
              
              return {
                topic: topic.tagName,
                solved: topic.problemsSolved,
                total: estimatedTotal,
                percentage: percentage,
                strength: strength,
              };
            }).sort((a, b) => b.solved - a.solved); // Sort by problems solved in descending order
            
            setTopicAnalysis(transformedTopics);
          }
        } catch (topicError) {
          console.error('Error fetching topics:', topicError);
          // Keep mock data if topics fetch fails
        }
        
        // Fetch activity data from backend
        try {
          const activityResponse = await fetch(`http://localhost:5005/api/leetcode/${username}/activity`);
          const activityData = await activityResponse.json();
          
          if (activityResponse.ok) {
            // Create a full year calendar with backend data
            const submissionMap = new Map();
            activityData.submissions.forEach((sub: any) => {
              submissionMap.set(sub.date, sub.count);
            });
            
            // Generate full year data (current year)
            const currentYear = new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);
            const fullYearData: SubmissionData[] = [];
            
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().slice(0, 10);
              fullYearData.push({
                date: dateStr,
                count: submissionMap.get(dateStr) || 0
              });
            }
            
            // Calculate daily average
            const totalDays = activityData.totalActiveDays || 1; // Avoid division by zero
            const totalSubmissions = activityData.submissions.reduce((sum: number, sub: any) => sum + sub.count, 0);
            const dailyAverage = parseFloat((totalSubmissions / totalDays).toFixed(1));
            
            setSubmissionData(fullYearData);
            setActivityStats({
              streak: activityData.streak || 0,
              totalActiveDays: activityData.totalActiveDays || 0,
              dailyAverage: dailyAverage
            });
          }
        } catch (activityError) {
          console.error('Error fetching activity:', activityError);
          // Keep mock data if activity fetch fails
        }
        
        localStorage.setItem("leetcode-connected", "true");
        localStorage.setItem("leetcode-username", username);
        localStorage.setItem("leetcode-profile", JSON.stringify(profileData));
      } else {
        console.error('Failed to fetch LeetCode data:', data.error);
        // You could show an error message to the user here
      }
    } catch (error) {
      console.error('Error connecting to LeetCode:', error);
      // You could show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };




  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [problemStats, setProblemStats] = useState<ProblemStats[]>([
    { difficulty: "Easy", solved: 156, total: 800, percentage: 19.5, color: "#10b981", avgTime: 7 },
    { difficulty: "Medium", solved: 142, total: 1200, percentage: 11.8, color: "#f59e0b", avgTime: 18 },
    { difficulty: "Hard", solved: 44, total: 500, percentage: 8.8, color: "#ef4444", avgTime: 41 },
  ])
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([
    {
      title: "Two Sum",
      difficulty: "Easy",
      status: "Accepted",
      timestamp: "2025-08-15 10:23",
      runtime: "1 ms",
      memory: "39 MB",
      language: "JavaScript",
    },
    {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      status: "Wrong Answer",
      timestamp: "2025-08-14 18:02",
      runtime: "N/A",
      memory: "N/A",
      language: "Python",
    },
    {
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      status: "Time Limit Exceeded",
      timestamp: "2025-08-13 21:45",
      runtime: "N/A",
      memory: "N/A",
      language: "C++",
    },
    {
      title: "Add Two Numbers",
      difficulty: "Medium",
      status: "Accepted",
      timestamp: "2025-08-12 14:10",
      runtime: "52 ms",
      memory: "45 MB",
      language: "Java",
    },
  ])

  // Mock data - in real app, this would come from LeetCode API
  const mockProfile: LeetCodeProfile = {
    username: "john_coder",
    name: "John Doe",
    avatar: "/leetcode-avatar.png",
    ranking: 125847,
    reputation: 1250,
    country: "United States",
    skillTags: ["Dynamic Programming", "Array", "String", "Tree", "Graph", "Backtracking"],
    totalSolved: 342,
    totalQuestions: 2500,
    easySolved: 156,
    mediumSolved: 142,
    hardSolved: 44,
    acceptanceRate: 68.5,
    ranking_percentile: 15.2,
  }

  const [languageBreakdown, setLanguageBreakdown] = useState([
    {
      language: "Python",
      submissions: 210,
      accepted: 180,
      successRate: 85.7,
      trend: "+3.2%",
      color: "#4F8EF7",
    },
    {
      language: "Java",
      submissions: 80,
      accepted: 60,
      successRate: 75.0,
      trend: "-1.1%",
      color: "#E76F51",
    },
    {
      language: "C++",
      submissions: 52,
      accepted: 40,
      successRate: 76.9,
      trend: "+0.5%",
      color: "#2A9D8F",
    },
  ]);

  // Activity data state
  const [submissionData, setSubmissionData] = useState<SubmissionData[]>(Array.from({ length: 365 }, (_, i) => ({
    date: new Date(2024, 0, 1 + i).toISOString().slice(0, 10),
    count: Math.floor(Math.random() * 3),
    accepted: Math.random() > 0.2,
    difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)]
  })));
  
  const [activityStats, setActivityStats] = useState({
    streak: 15,
    totalActiveDays: 28,
    dailyAverage: 4.2
  });

  const handleLogout = () => {
    localStorage.removeItem("skillmap-user")
    localStorage.removeItem("skill-analysis")
    localStorage.removeItem("user-skills")
    localStorage.removeItem("user-intent")
    localStorage.removeItem("extracted-skills")
    router.push("/")
  }

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("skillmap-user")
    if (!userData) {
      router.push("/auth")
      return
    }

    const user = JSON.parse(userData)
    setUserProfile({
      name: user.name || "John Doe",
      email: user.email,
      profilePicture: user.profilePicture,
    })

    // Check if LeetCode is already connected
    const connected = localStorage.getItem("leetcode-connected")
    const savedUsername = localStorage.getItem("leetcode-username")
    const savedProfile = localStorage.getItem("leetcode-profile")

    if (connected && savedUsername && savedProfile) {
      setIsConnected(true)
      setUsername(savedUsername)
      setProfile(JSON.parse(savedProfile))
    }
  }, [router])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest(".user-menu-container")) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showUserMenu])

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Strong":
        return "bg-green-100 text-green-800"
      case "Good":
        return "bg-blue-100 text-blue-800"
      case "Needs Work":
        return "bg-yellow-100 text-yellow-800"
      case "Weak":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Wrong Answer":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Time Limit Exceeded":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen skillmap-bg">
      {/* Header */}
      <header className="skillmap-header text-white animate-fadeInDown relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 user-menu-container">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Menu className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
              <span className="ml-2 text-sm">explore</span>
            </Button>

            {/* User Dropdown Menu */}
            {showUserMenu && userProfile && (
              <div className="absolute top-full left-4 mt-2 w-80 bg-white rounded-2xl shadow-2xl border-4 border-blue-500 z-50 animate-scaleIn overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                        {userProfile.profilePicture ? (
                          <img
                            src={userProfile.profilePicture || "/placeholder.svg"}
                            alt={userProfile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircle className="h-8 w-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{userProfile.name}</h3>
                        <p className="text-blue-100 text-sm">{userProfile.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUserMenu(false)}
                      className="text-white hover:bg-white/20 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Navigation Section */}
                <div className="p-2">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl p-3 transition-all duration-200"
                      asChild
                    >
                      <Link href="/">
                        <Home className="h-5 w-5 mr-3" />
                        <span className="font-medium">Home</span>
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl p-3 transition-all duration-200"
                      asChild
                    >
                      <Link href="/dashboard">
                        <BarChart3 className="h-5 w-5 mr-3" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl p-3 transition-all duration-200"
                      asChild
                    >
                      <Link href="/leetcode">
                        <Code className="h-5 w-5 mr-3" />
                        <span className="font-medium">LeetCode Analysis</span>
                        <Badge className="ml-auto bg-green-100 text-green-700 text-xs">Current</Badge>
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl p-3 transition-all duration-200"
                      asChild
                    >
                      <Link href="/results">
                        <FileText className="h-5 w-5 mr-3" />
                        <span className="font-medium">Skill Analysis</span>
                      </Link>
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  {/* Settings & Support */}
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-50 rounded-xl p-3 transition-all duration-200"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      <span className="font-medium">Settings</span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-50 rounded-xl p-3 transition-all duration-200"
                    >
                      <HelpCircle className="h-5 w-5 mr-3" />
                      <span className="font-medium">Help & Support</span>
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl p-3 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span className="font-medium">Sign Out</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Link href="/" className="text-2xl font-bold">
            skillMap
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
              <Link href="/auth">
                {userProfile?.profilePicture ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    <img
                      src={userProfile.profilePicture || "/placeholder.svg"}
                      alt={userProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="ml-2 text-sm">{userProfile?.name}</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8 animate-fadeInUp">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Code className="h-8 w-8 mr-3 text-orange-600" />
              LeetCode Analysis
            </h1>
            <p className="text-gray-600">Connect your LeetCode account to analyze your problem-solving skills</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="hover-lift bg-transparent">
              <Link href="/leetcode">
                <Code className="mr-2 h-4 w-4 text-orange-600" />
                LeetCode Analysis
              </Link>
            </Button>
            <Button variant="outline" className="hover-lift bg-transparent">
              <span className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-blue-600" />
                Export PDF
              </span>
            </Button>
            <Button asChild variant="outline" className="hover-lift bg-transparent">
              <Link href="/dashboard">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {!isConnected ? (
          /* Connection Card */
          <Card className="shadow-lg border-0 rounded-2xl max-w-2xl mx-auto animate-scaleIn">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="h-10 w-10 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Connect Your LeetCode Account</CardTitle>
              <p className="text-gray-600 mt-2">
                Analyze your problem-solving patterns and get personalized recommendations based on your LeetCode
                progress
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-base font-medium">
                  LeetCode Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your LeetCode username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What we'll analyze:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Problem-solving patterns and strengths</li>
                  <li>• Topic-wise performance analysis</li>
                  <li>• Difficulty progression recommendations</li>
                  <li>• Submission frequency and consistency</li>
                  <li>• Areas for improvement and focus</li>
                </ul>
              </div>

              <Button
                onClick={handleConnect}
                disabled={!username.trim() || isLoading}
                className="w-full skillmap-button text-white hover-lift"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Connect LeetCode Account
                  </span>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                We only access your public profile and submission statistics. Your account credentials are never stored.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Connected Dashboard */
          <div className="space-y-6">
            {/* Profile Overview */}
            <Card className="shadow-lg border-0 rounded-2xl animate-slideInLeft">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={profile?.avatar || "/placeholder.svg?height=64&width=64&query=leetcode+avatar"}
                        alt={profile?.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profile?.name || profile?.username}</h2>
                      <p className="text-gray-600">@{profile?.username}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className="bg-orange-100 text-orange-800">
                          <Trophy className="w-3 h-3 mr-1" />
                          Rank #{profile?.ranking?.toLocaleString() || 'N/A'}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Star className="w-3 h-3 mr-1" />
                          {profile?.reputation || 0} reputation
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{profile?.totalSolved || 0}</div>
                    <div className="text-sm text-gray-600">Problems Solved</div>
                    <div className="text-xs text-gray-500">of {profile?.totalQuestions?.toLocaleString() || 'N/A'} total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{profile?.acceptanceRate || 0}%</div>
                    <div className="text-sm text-gray-600">Acceptance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{profile?.ranking_percentile || 0}%</div>
                    <div className="text-sm text-gray-600">Top Percentile</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{profile?.skillTags?.length || 0}</div>
                    <div className="text-sm text-gray-600">Skill Tags</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Trends Card (after profile card) */}
            <Card className="shadow-lg border-0 rounded-2xl animate-fadeInUp">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                  <span>Learning Trends</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">Track your progress and get smart suggestions for your next steps</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Growth in Acceptance Rate */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col items-center">
                    <span className="text-xs text-blue-700 mb-1">Acceptance Rate Growth (6 months)</span>
                    <span className="text-2xl font-bold text-blue-700">+6.2%</span>
                    <span className="text-xs text-gray-500">from 62.3% to 68.5%</span>
                  </div>
                  {/* Unique Topics Covered */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex flex-col items-center">
                    <span className="text-xs text-green-700 mb-1">Unique Topics (Last 3 Months)</span>
                    <span className="text-2xl font-bold text-green-700">5</span>
                    <span className="text-xs text-gray-500">(Array, Graph, Tree, DP, String)</span>
                  </div>
                  {/* 30 Days vs Overall Comparison */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 flex flex-col items-center">
                    <span className="text-xs text-purple-700 mb-1">Last 30 Days vs Overall</span>
                    <span className="text-2xl font-bold text-purple-700">32 / 342</span>
                    <span className="text-xs text-gray-500">Problems solved (last 30d / total)</span>
                  </div>
                </div>
                {/* AI Suggestions */}
                <div className="mt-8">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span>SkillMap Suggests</span>
                    </CardTitle>
                    <p className="text-gray-500 mt-1 text-sm">Based on your recent activity, try these next:</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Binary Tree Maximum Path Sum</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="text-xs bg-red-100 text-red-800">Hard</Badge>
                            <span className="text-xs text-gray-500">Tree</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Improve tree/recursion mastery</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Longest Substring Without Repeating Characters</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>
                            <span className="text-xs text-gray-500">String</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Practice sliding window technique</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Word Ladder</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>
                            <span className="text-xs text-gray-500">Graph</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Strengthen BFS/graph skills</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {/* <TabsTrigger value="topics">Topics</TabsTrigger> */}
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Problem Distribution */}
                  <Card className="shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        <span>Problem Distribution</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {problemStats.map((stat) => (
                          <div key={stat.difficulty}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">{stat.difficulty}</span>
                              <span className="text-sm text-gray-600">
                                {stat.solved} / {stat.total}
                              </span>
                            </div>
                            <Progress value={stat.percentage} className="h-3" />
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">{stat.percentage.toFixed(1)}% completed</span>
                              <Badge
                                style={{ backgroundColor: stat.color + "20", color: stat.color }}
                                className="text-xs"
                              >
                                {stat.solved} solved
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">Avg. Time Taken:</span>
                              <span className="text-xs font-semibold text-blue-700">{stat.avgTime} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Language Breakdown */}
                  <Card className="shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Code className="h-6 w-6 text-purple-600" />
                        <span>Language Breakdown</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {languageBreakdown.map((lang) => (
                          <div key={lang.language} className="flex flex-col gap-1 p-2 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 flex items-center">
                                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: lang.color }}></span>
                                {lang.language}
                              </span>
                              <span className="text-xs text-gray-500">{lang.submissions} submissions</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Accepted: {lang.accepted}</span>
                              <span className="text-xs text-gray-600">Success Rate: <span className="font-semibold text-green-700">{lang.successRate}%</span></span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Trend:</span>
                              <span className={`text-xs font-semibold ${lang.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{lang.trend}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Submissions */}
                  <Card className="shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-6 w-6 text-green-600" />
                        <span>Recent Submissions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentSubmissions.map((submission, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(submission.status)}
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{submission.title}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    className={`text-xs ${
                                      submission.difficulty === "Easy"
                                        ? "bg-green-100 text-green-800"
                                        : submission.difficulty === "Medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {submission.difficulty}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{submission.language}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{submission.timestamp}</p>
                              {submission.status === "Accepted" && (
                                <p className="text-xs text-green-600">{submission.runtime}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* <TabsContent value="topics" className="space-y-6">
                ...Topics card removed...
              </TabsContent> */}

              <TabsContent value="activity" className="space-y-6">
                <Card className="shadow-xl border border-gray-200 rounded-2xl bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      <span>Submission Activity</span>
                    </CardTitle>
                    <p className="text-gray-500 mt-2 text-sm">Your coding consistency over time</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center">
                      <div style={{ width: '100%', maxWidth: 800 }}>
                        <CalendarHeatmap
                          startDate={submissionData.length > 0 ? submissionData[0].date : new Date(2024, 0, 1).toISOString().slice(0, 10)}
                          endDate={submissionData.length > 0 ? submissionData[submissionData.length - 1].date : new Date(2024, 11, 31).toISOString().slice(0, 10)}
                          values={submissionData.map((d) => ({ date: d.date, count: d.count }))}
                          classForValue={(value: { date: string; count: number } | undefined) => {
                            if (!value || value.count === 0) return "color-empty"
                            if (value.count < 2) return "color-scale-1"
                            if (value.count < 4) return "color-scale-2"
                            if (value.count < 6) return "color-scale-3"
                            return "color-scale-4"
                          }}
                          tooltipDataAttrs={(value: { date: string; count: number } | undefined) => {
                            if (!value || !value.date) return null;
                            // Format date for better readability
                            const dateObj = new Date(value.date);
                            const formatted = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                            return {
                              'data-tip': `<div style='font-size:13px;'><strong>${formatted}</strong><br/>Submissions: <b>${value.count || 0}</b></div>`
                            };
                          }}
                          showWeekdayLabels={false}
                        />
                      </div>
                      {/* Tooltip style for react-tooltip (if used) */}
                      <style>{`
                        /* Container styling */
                        .react-calendar-heatmap {
                          background: #ffffff;
                          border-radius: 8px;
                          padding: 16px;
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                        }
                        
                        /* Color scheme - using existing blue shades from your design */
                        .color-empty { 
                          fill: #f1f5f9;
                          stroke: #ffffff;
                          stroke-width: 1px;
                        }
                        .color-scale-1 { 
                          fill: #dbeafe;
                          stroke: #ffffff;
                          stroke-width: 1px;
                        }
                        .color-scale-2 { 
                          fill: #93c5fd;
                          stroke: #ffffff;
                          stroke-width: 1px;
                        }
                        .color-scale-3 { 
                          fill: #3b82f6;
                          stroke: #ffffff;
                          stroke-width: 1px;
                        }
                        .color-scale-4 { 
                          fill: #1d4ed8;
                          stroke: #ffffff;
                          stroke-width: 1px;
                        }
                        
                        /* Hover effects */
                        .react-calendar-heatmap rect:hover {
                          stroke: #1f2937 !important;
                          stroke-width: 2px !important;
                          filter: brightness(0.9);
                          cursor: pointer;
                        }
                        
                        /* Month labels styling */
                        .react-calendar-heatmap .react-calendar-heatmap-month-label {
                          font-size: 12px !important;
                          fill: #6b7280;
                          font-weight: 500;
                          dominant-baseline: middle;
                        }
                        
                        /* Hide weekday labels */
                        .react-calendar-heatmap .react-calendar-heatmap-weekday-label { 
                          display: none; 
                        }
                        
                        /* Individual day squares */
                        .react-calendar-heatmap rect {
                          rx: 2px;
                          ry: 2px;
                          width: 11px !important;
                          height: 11px !important;
                          shape-rendering: geometricPrecision;
                          transition: all 0.2s ease;
                        }
                        
                        /* Spacing between squares */
                        .react-calendar-heatmap .react-calendar-heatmap-days > g {
                          transform: translateX(0px);
                        }
                        
                        .react-calendar-heatmap .react-calendar-heatmap-days > g > rect {
                          transform: translate(0px, 0px);
                        }
                        
                        /* Add proper spacing between columns (weeks) */
                        .react-calendar-heatmap .react-calendar-heatmap-days {
                          transform: translateX(8px);
                        }
                        
                        /* Month separators - subtle */
                        .react-calendar-heatmap .react-calendar-heatmap-month-separator {
                          stroke: transparent;
                          stroke-width: 0;
                        }
                        
                        /* Custom tooltip style */
                        [data-tip] {
                          position: relative;
                        }
                        .__react_component_tooltip {
                          font-size: 12px !important;
                          background: #1f2937 !important;
                          color: #ffffff !important;
                          border: none !important;
                          border-radius: 6px !important;
                          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                          padding: 8px 12px !important;
                          z-index: 9999;
                          font-weight: 500;
                        }
                        .__react_component_tooltip:after {
                          border-top-color: #1f2937 !important;
                        }
                        
                        /* Responsive adjustments */
                        @media (max-width: 768px) {
                          .react-calendar-heatmap rect {
                            width: 9px !important;
                            height: 9px !important;
                          }
                          .react-calendar-heatmap .react-calendar-heatmap-month-label {
                            font-size: 10px !important;
                          }
                        }
                      `}</style>
                    </div>
                    
                    {/* Activity Legend - using existing color scheme */}
                    <div className="flex items-center justify-end mt-4 gap-2 text-sm text-gray-600">
                      <span>Less</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm border border-white" style={{ backgroundColor: '#f1f5f9' }}></div>
                        <div className="w-3 h-3 rounded-sm border border-white" style={{ backgroundColor: '#dbeafe' }}></div>
                        <div className="w-3 h-3 rounded-sm border border-white" style={{ backgroundColor: '#93c5fd' }}></div>
                        <div className="w-3 h-3 rounded-sm border border-white" style={{ backgroundColor: '#3b82f6' }}></div>
                        <div className="w-3 h-3 rounded-sm border border-white" style={{ backgroundColor: '#1d4ed8' }}></div>
                      </div>
                      <span>More</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">{activityStats.totalActiveDays}</div>
                        <div className="text-sm text-blue-700">Total Active Days</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="text-2xl font-bold text-green-600">{activityStats.dailyAverage}</div>
                        <div className="text-sm text-green-700">Daily Average</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="text-2xl font-bold text-purple-600">{activityStats.streak}</div>
                        <div className="text-sm text-purple-700">Streak Days</div>
                      </div>
                    </div>
                    {/* Topics Section Below Activity */}
                    <div className="mt-10">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="h-6 w-6 text-purple-600" />
                          <span>Topic Analysis</span>
                        </CardTitle>
                        <p className="text-gray-600 mt-2">Your performance across different algorithm topics</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {topicAnalysis.map((topic, index) => (
                            <div key={topic.topic} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{topic.topic}</h3>
                                  <p className="text-sm text-gray-600">
                                    {topic.solved} / {topic.total} problems
                                  </p>
                                </div>
                                <Badge className={getStrengthColor(topic.strength)}>{topic.strength}</Badge>
                              </div>
                              <Progress value={topic.percentage} className="h-2 mb-2" />
                              <p className="text-xs text-gray-500">{topic.percentage.toFixed(1)}% mastery</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-6 w-6 text-yellow-600" />
                        <span>Focus Areas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h3 className="font-semibold text-red-900 mb-2">Immediate Priority</h3>
                          <p className="text-sm text-red-800 mb-3">
                            Focus on <strong>Graph Algorithms</strong> - you're at 38% mastery
                          </p>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            Practice Graph Problems
                          </Button>
                        </div>
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h3 className="font-semibold text-yellow-900 mb-2">Secondary Focus</h3>
                          <p className="text-sm text-yellow-800 mb-3">
                            Strengthen <strong>Backtracking</strong> skills - currently at 33% mastery
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-600 text-yellow-700 bg-transparent"
                          >
                            View Backtracking Problems
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-6 w-6 text-green-600" />
                        <span>Recommended Problems</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            title: "Number of Islands",
                            difficulty: "Medium",
                            topic: "Graph",
                            reason: "BFS/DFS practice",
                          },
                          {
                            title: "Course Schedule",
                            difficulty: "Medium",
                            topic: "Graph",
                            reason: "Topological sort",
                          },
                          {
                            title: "Word Search",
                            difficulty: "Medium",
                            topic: "Backtracking",
                            reason: "2D backtracking",
                          },
                          {
                            title: "N-Queens",
                            difficulty: "Hard",
                            topic: "Backtracking",
                            reason: "Classic backtracking",
                          },
                        ].map((problem, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{problem.title}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge
                                  className={`text-xs ${
                                    problem.difficulty === "Medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {problem.difficulty}
                                </Badge>
                                <span className="text-xs text-gray-500">{problem.topic}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{problem.reason}</p>
                            </div>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
