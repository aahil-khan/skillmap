import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005'

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

    const formData = await request.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(`Processing uploaded file: ${file.name}`)
    
    // Forward the file to your backend server
    const backendFormData = new FormData()
    backendFormData.append('resume', file)

    const response = await fetch(`${BACKEND_URL}/upload-resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: backendFormData,
    })
    
    if (!response.ok) {
      throw new Error(`Backend server responded with status: ${response.status}`)
    }
    
    const profileData = await response.json()
    
    return NextResponse.json({
      success: true,
      profile: profileData
    })

  } catch (error) {
    console.error('Error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to process resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
