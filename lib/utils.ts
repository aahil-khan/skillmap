
// Helper to send API requests with JWT from localStorage
export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = null
  
  if (typeof window !== 'undefined') {
    // Try multiple potential token storage keys
    token = localStorage.getItem('sb-jwt') || 
            localStorage.getItem('supabase.auth.token') || 
            localStorage.getItem('sb-auth-token')
    
    // If no direct token, try parsing Supabase session data
    if (!token) {
      try {
        const supabaseSession = localStorage.getItem('sb-' + window.location.hostname + '-auth-token')
        if (supabaseSession) {
          const sessionData = JSON.parse(supabaseSession)
          token = sessionData?.access_token
        }
      } catch (e) {
        console.warn('Could not parse Supabase session data:', e)
      }
    }
    
    console.log('📊 apiFetch token check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 20) + '...'
    })
  }
  
  // Create headers object
  const headers: Record<string, string> = {}
  
  // Add existing headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value
      }
    })
  }
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('📊 Added Authorization header with token')
  } else {
    console.warn('⚠️ No authentication token found in localStorage')
  }
  
  // Only add Content-Type if it's not a FormData request (file upload)
  const isFormData = options.body instanceof FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  
  return fetch(url, { ...options, headers })
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
