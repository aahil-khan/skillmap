"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ProfileDropdown from "./ProfileDropdown"

interface NavbarProps {
  showExploreMenu?: boolean
  setShowExploreMenu?: (show: boolean) => void
  isDashboard?: boolean
  userProfile?: { name: string; email: string } | null
}

export default function Navbar({ 
  showExploreMenu, 
  setShowExploreMenu,
  isDashboard = false,
  userProfile: dashboardUserProfile = null
}: NavbarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userDetails, setUserDetails] = useState<{ email: string; full_name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      // If using dashboard props, skip auth check
      if (isDashboard && dashboardUserProfile) {
        setIsAuthenticated(true)
        setUserDetails({
          email: dashboardUserProfile.email,
          full_name: dashboardUserProfile.name
        })
        setIsLoading(false)
        return
      }

      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Current session:', session, 'Session error:', sessionError)
      
      if (session?.user) {
        setIsAuthenticated(true)
        console.log('User from session:', session.user)
        
        // Update localStorage with current access token
        localStorage.setItem('sb-jwt', session.access_token)
        
        // Fetch user details from custom users table
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', session.user.id)
          .single() 
        
        console.log('Custom user data:', userData, 'Fetch error:', fetchError)
        
        if (userData) {
          setUserDetails(userData)
        } else {
          // User doesn't exist in custom table, let's try to create them or use auth data
          console.log('User not found in custom table, using auth data')
          
          const authUserData = {
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name || 
                      'User'
          }
          
          // Try to insert the user into custom table for future use
          if (session.user.email && authUserData.full_name !== 'User') {
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  full_name: authUserData.full_name
                }
              ])
            
            if (!insertError) {
              console.log('Successfully created user in custom table')
            } else {
              console.log('Failed to create user in custom table:', insertError)
            }
          }
          
          setUserDetails(authUserData)
        }
      } else {
        // No valid session, check stored token as backup
        const token = typeof window !== 'undefined' ? localStorage.getItem('sb-jwt') : null
        if (token) {
          console.log('No session but token exists, clearing invalid token')
          localStorage.removeItem('sb-jwt')
        }
        setIsAuthenticated(false)
        setUserDetails(null)
      }
      
      setIsLoading(false)
    }
    checkAuth()
  }, [isDashboard, dashboardUserProfile])

  // Animate profile menu when it opens
  useEffect(() => {
    if (showProfileMenu) {
      // Animation is handled in ProfileDropdown component
    }
  }, [showProfileMenu])

  const handleLogout = async () => {
    setShowProfileMenu(false)
  }


  return (
    <header className="skillmap-header text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        <Link href="/" className="text-2xl font-bold hover:scale-110 transition-transform duration-300 group flex items-center gap-2">
          <span className="group-hover:translate-x-1 transition-transform duration-300">SkillMap</span>
        </Link>

        <div className="flex items-center space-x-6">

          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center space-x-2 group"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm hidden sm:inline font-medium">{userDetails?.full_name || 'User'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </Button>

                  {showProfileMenu && (
                    <ProfileDropdown
                      userDetails={userDetails}
                      showProfileMenu={showProfileMenu}
                      setShowProfileMenu={setShowProfileMenu}
                      isAuthenticated={isAuthenticated}
                    />
                  )}
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 transition-all duration-300 group" 
                  asChild
                >
                  <Link href="/auth" className="flex items-center gap-2">
                    <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm hidden sm:inline">Login</span>
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  )
}
