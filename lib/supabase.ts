import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
}

export interface AuthResponse {
  user: User | null
  error: string | null
}

export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user' }
      }

      // Then, insert user data into our custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
          }
        ])
        .select()
        .single()

      if (userError) {
        // If user table insertion fails, we should clean up the auth user
        // For now, we'll just return the error
        return { user: null, error: userError.message }
      }

      return { user: userData, error: null }
    } catch (error: any) {
      return { user: null, error: error.message || 'An unexpected error occurred' }
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to sign in' }
      }

      // Get user data from our custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        return { user: null, error: userError.message }
      }

      return { user: userData, error: null }
    } catch (error: any) {
      return { user: null, error: error.message || 'An unexpected error occurred' }
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error: any) {
      return { error: error.message || 'An unexpected error occurred' }
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        return null
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        return null
      }

      return userData
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }
}
