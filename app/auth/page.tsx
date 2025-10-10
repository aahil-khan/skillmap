"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Lock, ArrowRight, User, LogIn, UserPlus, Eye, EyeOff } from "lucide-react"
import Navbar from "@/components/Navbar"
import { PageErrorBoundary } from "@/components/GlobalErrorBoundary"

function AuthPageContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [retypePassword, setRetypePassword] = useState("")
  const [fullname, setFullname] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleAuth = useCallback(async (type: "login" | "signup") => {
    setLoading(true)
    setError("")
    
    if (type === "signup" && password !== retypePassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      let result
      if (type === "login") {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
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
          
          if (!result.data.session) {
            // Clear form and instruct user to check email (including spam)
            // Mark this email as just-signed-up so the subsequent first sign-in goes to /upload
            try {
              if (typeof window !== "undefined") {
                localStorage.setItem("justSignedUpEmail", email)
              }
            } catch (e) {
              console.warn("Could not set justSignedUpEmail:", e)
            }
            setError("Account created. Check your email (and spam) for the confirmation link. After confirming you'll be redirected to Upload.")
            setTimeout(() => {
              setIsSignup(false)
              setError("")
              setEmail("")
              setPassword("")
              setRetypePassword("")
              setFullname("")
            }, 4000)
            setLoading(false)
            return
          }
        }
      }
      
      if (result.error) {
        console.error("Auth error:", result.error)
        setError(result.error.message)
      } else if (result && result.data && result.data.session) {
        // store token
        localStorage.setItem("sb-jwt", result.data.session.access_token)
        
        // fetch profile full_name from users table (prefer custom profile)
        try {
          const userId = result.data.user?.id
          if (userId) {
            const { data: profile } = await supabase.from('users').select('full_name').eq('id', userId).single()
            const name = profile?.full_name ?? result.data.user?.user_metadata?.full_name ?? ""
            if (name) localStorage.setItem("sb-user", name)
          }
        } catch (e) {
          console.warn("Failed to fetch profile after auth:", e)
        }

        // Determine "first-time" more robustly:
        // Treat as new if metadata.is_new is true OR if we have a justSignedUpEmail matching the current email.
        // This avoids misrouting existing users whose metadata might be incorrect.
        const userMetadata = result.data.user?.user_metadata as any
        const metadataIsNew = userMetadata?.is_new === true || userMetadata?.is_new === "true"
        let localIsNew = false
        try {
          if (typeof window !== "undefined") {
            const marker = localStorage.getItem("justSignedUpEmail")
            if (marker && marker === email) {
              localIsNew = true
            }
          }
        } catch (e) {
          console.warn("Could not read justSignedUpEmail:", e)
        }

        const isNew = metadataIsNew || localIsNew

        if (isNew) {
          // clear the is_new flag server-side if possible and remove local marker
          try {
            await supabase.auth.updateUser({ data: { ...userMetadata, is_new: false } })
          } catch (e) {
            console.warn("Failed to update user metadata is_new flag:", e)
          }
          try {
            if (typeof window !== "undefined") {
              localStorage.removeItem("justSignedUpEmail")
            }
          } catch (e) {
            console.warn("Could not remove justSignedUpEmail:", e)
          }
          router.push("/upload")
        } else {
          //TODO  fix later
          router.push("/upload")
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    
    setLoading(false)
  }, [email, password, retypePassword, fullname, router])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        const isSignupValid = isSignup && fullname.trim() && password.length >= 6 && password === retypePassword
        const isLoginValid = !isSignup && password.trim()
        
        const isFormValid = email.trim() && (isLoginValid || isSignupValid)
        
        if (isFormValid && !loading) {
          handleAuth(isSignup ? "signup" : "login")
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [email, password, retypePassword, fullname, isSignup, loading, handleAuth])

  const passwordInputClass = `pl-10 pr-12 h-12 border-2 focus:border-${isSignup ? 'green' : 'blue'}-500 transition-colors`

  return (
    <div className="min-h-screen skillmap-bg">
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password (min 6 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={passwordInputClass}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {isSignup && (
                <div className="relative animate-fadeIn">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Retype your password"
                    value={retypePassword}
                    onChange={e => setRetypePassword(e.target.value)}
                    className={passwordInputClass}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              )}
              
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
                disabled={loading || (isSignup && (!fullname.trim() || password.length < 6 || password !== retypePassword)) || (!email.trim() || !password.trim())}
                className={`w-full h-12 text-lg font-semibold hover-lift ${
                  isSignup 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white" 
                    : "skillmap-button text-white"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isSignup ? "Create Account" : "Sign In"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsSignup(!isSignup)
                    setError("")
                  }}
                  className="font-semibold text-blue-600 hover:underline ml-1"
                >
                  {isSignup ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <PageErrorBoundary>
      <AuthPageContent />
    </PageErrorBoundary>
  )
}