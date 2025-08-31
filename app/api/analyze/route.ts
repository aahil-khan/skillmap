import { type NextRequest, NextResponse } from "next/server"
import { apiFetch } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(`Processing uploaded file: ${file.name}`)
    
    // Forward the file to your backend server
    const backendFormData = new FormData()
    backendFormData.append('resume', file)

    const response = await apiFetch('http://localhost:5005/upload-resume', {
      method: 'POST',
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
