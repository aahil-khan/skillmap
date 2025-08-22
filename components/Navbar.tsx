"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, User, LogOut, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface NavbarProps {
  showExploreMenu?: boolean
  setShowExploreMenu?: (show: boolean) => void
}

export default function Navbar({ showExploreMenu, setShowExploreMenu }: NavbarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userDetails, setUserDetails] = useState<{ email: string; full_name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
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
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sb-jwt')
    localStorage.removeItem('profile-data')
    localStorage.removeItem('extracted-skills')
    localStorage.removeItem('user-skills')
    setIsAuthenticated(false)
    setUserDetails(null)
    setShowProfileMenu(false)
    router.push('/')
  }


  return (
    <header className="skillmap-header text-white animate-fadeInDown">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        <Link href="/" className="text-2xl font-bold hover:scale-105 transition-transform duration-300">
          skillMap
        </Link>

        <div className="flex items-center space-x-4">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm hidden sm:inline">{userDetails?.full_name || 'User'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 z-50 animate-fadeIn">
                      <Card className="shadow-lg border-0 min-w-64">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-gray-900">Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Name</p>
                            <p className="text-sm text-gray-600">{userDetails?.full_name || 'User'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Email</p>
                            <p className="text-sm text-gray-600">{userDetails?.email}</p>
                          </div>
                          <hr className="my-3" />
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full mb-2 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Link href="/dashboard" className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Dashboard
                            </Link>
                          </Button>
                          <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 mb-2"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
                  <Link href="/auth">
                    <User className="h-5 w-5" />
                    <span className="ml-2 text-sm">login</span>
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
