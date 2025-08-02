"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Lock, ArrowRight, User, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/Navbar"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullname, setFullname] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  const handleAuth = useCallback(async (type: "login" | "signup") => {
    setLoading(true)
    setError("")
    
    try {
      let result
      if (type === "login") {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
        // For signup, we need to create the user in auth and then in our custom table
        console.log("Starting signup process...")
        result = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullname
            }
          }
        })
        
        console.log("Auth signup result:", result)
        
        // If signup successful and we have a user, insert into our custom users table
        if (result.data.user && !result.error) {
          console.log("Inserting user into custom table...")
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: result.data.user.id,
                email: email,
                full_name: fullname
              }
            ])
          
          console.log("Insert result:", insertError)
          
          if (insertError) {
            setError(`Account created but profile setup failed: ${insertError.message}`)
            setLoading(false)
            return
          }
          
          // After successful signup, redirect to login
          if (!result.data.session) {
            setError("Account created successfully! Please check your email to confirm your account, then sign in.")
            // Switch to login mode after 2 seconds
            setTimeout(() => {
              setIsSignup(false)
              setError("")
              setEmail("")
              setPassword("")
              setFullname("")
            }, 3000)
            setLoading(false)
            return
          }
        }
      }
      
      if (result.error) {
        console.error("Auth error:", result.error)
        setError(result.error.message)
      } else if (result.data.session) {
        // Store JWT in localStorage
        localStorage.setItem("sb-jwt", result.data.session.access_token)
        router.push("/upload")
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    
    setLoading(false)
  }, [email, password, fullname, router])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    // Add event listener for Enter key
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        // Check if all required fields are filled
        const isFormValid = email.trim() && password.trim() && (!isSignup || fullname.trim())
        const isPasswordValid = !isSignup || password.length >= 6
        
        if (isFormValid && isPasswordValid && !loading) {
          handleAuth(isSignup ? "signup" : "login")
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [email, password, fullname, isSignup, loading, handleAuth])

  return (
    <div className="min-h-screen skillmap-bg">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card
          className={`shadow-xl border-0 card-hover transition-all duration-1000 ${isLoaded ? "animate-scaleIn" : "opacity-0 scale-90"}`}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {isSignup ? (
                <UserPlus className="h-8 w-8 text-green-600" />
              ) : (
                <LogIn className="h-8 w-8 text-blue-600" />
              )}
              <Badge variant="secondary" className={isSignup ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                {isSignup ? "Join SkillMap" : "Welcome Back"}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {isSignup ? "Create Account" : "Sign In"}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isSignup ? "Start your personalized skill journey" : "Access your personalized skill journey"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {isSignup && (
                <div className="relative animate-fadeIn">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullname}
                    onChange={e => setFullname(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-green-500 transition-colors"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`pl-10 h-12 border-2 focus:border-${isSignup ? 'green' : 'blue'}-500 transition-colors`}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter your password (min 6 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`pl-10 h-12 border-2 focus:border-${isSignup ? 'green' : 'blue'}-500 transition-colors`}
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <div className={`border px-4 py-3 rounded-lg text-sm animate-fadeIn ${
                  error.includes("successfully") || error.includes("created successfully")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleAuth(isSignup ? "signup" : "login")}
                disabled={loading || (isSignup && (!fullname.trim() || password.length < 6)) || (!email.trim() || !password.trim())}
                className={`w-full h-12 text-lg font-semibold hover-lift ${
                  isSignup 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white" 
                    : "skillmap-button text-white"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {isSignup ? "Creating Account" : "Signing In"}<span className="loading-dots"></span>
                  </span>
                ) : (
                  <>
                    {isSignup ? "Create Account" : "Sign In"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError("")
                  setFullname("")
                }}
                disabled={loading}
                variant="outline"
                className={`w-full h-12 text-lg font-semibold border-2 transition-all duration-300 ${
                  isSignup 
                    ? "hover:bg-blue-50 hover:border-blue-300" 
                    : "hover:bg-green-50 hover:border-green-300"
                }`}
              >
                {isSignup ? "Sign In Instead" : "Create Account"}
              </Button>
            </div>

            <div className="text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
