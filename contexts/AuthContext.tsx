"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, User } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      
      // Also update localStorage for compatibility with existing code
      if (currentUser) {
        localStorage.setItem("skillmap-user", JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.full_name
        }))
      } else {
        localStorage.removeItem("skillmap-user")
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      localStorage.removeItem("skillmap-user")
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
