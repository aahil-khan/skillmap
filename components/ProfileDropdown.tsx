"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, LogOut, ChevronDown, Home } from "lucide-react"
import { supabase } from "@/lib/supabase"
import gsap from "gsap"

interface ProfileDropdownProps {
  userDetails: { email: string; full_name: string } | null
  showProfileMenu: boolean
  setShowProfileMenu: (show: boolean) => void
  isAuthenticated: boolean
}

export default function ProfileDropdown({
  userDetails,
  showProfileMenu,
  setShowProfileMenu,
  isAuthenticated,
}: ProfileDropdownProps) {
  const router = useRouter()

  // Animate profile menu when it opens
  useEffect(() => {
    if (showProfileMenu) {
      gsap.fromTo(
        ".profile-menu-dropdown",
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out" }
      )
    }
  }, [showProfileMenu])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sb-jwt')
    localStorage.removeItem('profile-data')
    localStorage.removeItem('extracted-skills')
    localStorage.removeItem('user-skills')
    setShowProfileMenu(false)
    router.push('/')
  }

  if (!isAuthenticated || !userDetails) {
    return null
  }

  return (
    <>
      <div className="profile-menu-dropdown absolute right-0 top-full mt-3 z-50">
        <Card className="shadow-xl border-0 min-w-72 overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-skillmap-header/5 to-transparent">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</p>
              <p className="text-base font-semibold text-gray-900">{userDetails?.full_name || 'User'}</p>
            </div>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-700 break-all">{userDetails?.email}</p>
            </div>
            <hr className="my-3" />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group/btn"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                Dashboard
              </Link>
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-300 group/btn"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Click outside to close profile menu */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setShowProfileMenu(false)}
      />
    </>
  )
}
