"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Menu, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/supabase"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (isLogin) {
        // Sign in existing user
        const { user, error: authError } = await authService.signIn(email, password)
        
        if (authError) {
          setError(authError)
          return
        }

        if (user) {
          // Store user session in localStorage
          localStorage.setItem("skillmap-user", JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.full_name
          }))

          setSuccess("Welcome back!")
          setTimeout(() => router.push("/upload"), 1000)
        }
      } else {
        // Sign up new user
        if (!name.trim()) {
          setError("Please enter your full name")
          return
        }

        const { user, error: authError } = await authService.signUp(email, password, name)
        
        if (authError) {
          setError(authError)
          return
        }

        if (user) {
          setSuccess("Account created successfully! Please check your email to verify your account.")
          // For now, we'll auto-login after signup
          localStorage.setItem("skillmap-user", JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.full_name
          }))
          
          setTimeout(() => router.push("/upload"), 2000)
        }
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen skillmap-bg">
      {/* Header */}
      <header className="skillmap-header text-white animate-fadeInDown">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <Menu className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
              <span className="ml-2 text-sm">explore</span>
            </Button>
          </div>

          <Link href="/" className="text-2xl font-bold hover:scale-105 transition-transform duration-300">
            skillMap
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <User className="h-5 w-5" />
            <span className="ml-2 text-sm">login</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card
          className={`shadow-lg border-0 card-hover transition-all duration-1000 ${isLoaded ? "animate-scaleIn" : "opacity-0 scale-90"}`}
        >
          <CardHeader className="text-center animate-fadeInUp">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-gray-600 animate-fadeInUp animate-delay-200">
              {isLogin ? "Sign in to continue your skill journey" : "Join SkillMap to start mapping your skills"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 animate-fadeInUp animate-delay-300">
            {error && (
              <Alert variant="destructive" className="animate-slideInLeft">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 animate-slideInLeft">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="animate-slideInLeft">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="mt-1 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                  />
                </div>
              )}

              <div className="animate-slideInLeft animate-delay-100">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                />
              </div>

              <div className="animate-slideInLeft animate-delay-200">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                />
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full skillmap-button text-white hover-lift animate-slideInLeft animate-delay-300"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Please wait<span className="loading-dots"></span>
                  </span>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>

            <div className="text-center animate-fadeIn animate-delay-400">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 text-sm transition-all duration-300 hover:scale-105"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="pt-4 animate-fadeIn animate-delay-500">
              <Button variant="outline" asChild className="w-full bg-transparent hover-lift">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
