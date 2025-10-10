"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, User, LogOut, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { clearLocalStorageData } from "@/lib/api"

import { AuthChangeEvent, Session } from "@supabase/supabase-js"

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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        const { data: userData } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUserDetails(userData);
        } else {
          setUserDetails({
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 'User'
          });
        }
      } else {
        setIsAuthenticated(false);
        setUserDetails(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        checkAuth();
      } else {
        setIsAuthenticated(false);
        setUserDetails(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    
    // Clear all non-auth localStorage data
    clearLocalStorageData()
    
    // Keep auth token removal separate
    localStorage.removeItem('sb-jwt')
    
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-all duration-300 shadow-lg"
                  asChild
                >
                  <Link href="/auth" className="flex items-center">
                    <User className="h-5 w-5" />
                    <span className="ml-2 text-sm font-semibold">Login</span>
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
