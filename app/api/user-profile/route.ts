import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization token' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Create Supabase client and verify the token
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Get the request body
    const body = await request.json()
    
    // Log what we're sending to backend for debugging
    console.log('Sending to backend /user-profile:', {
      hasName: !!body.name,
      hasTechnicalSkills: !!body.technical_skills,
      technicalSkillsCount: body.technical_skills?.length,
      hasGoal: !!body.goal,
    })
    
    // Forward the request to the backend
    const backendResponse = await fetch('http://localhost:5005/user-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend /user-profile error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorText
      })
      
      // Try to parse as JSON, otherwise return text
      let errorData
      try {
        errorData = JSON.parse(errorText)
        // Log validation details if present
        if (errorData.error?.details) {
          console.error('Validation details:', errorData.error.details)
        }
      } catch {
        errorData = { error: errorText }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || 'Backend error',
          ...(errorData.error?.details && { details: errorData.error.details })
        },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('API Route Error in /user-profile:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
