import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(`Processing uploaded file: ${file.name}`)
    
    // Use environment variable or fallback to dummy URL
    const uploadApiUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'https://api.example.com/upload-resume'
    
    try {
      // Forward the file to your backend server
      const backendFormData = new FormData()
      backendFormData.append('resume', file)
      
      const response = await fetch(uploadApiUrl, {
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
    } catch (apiError) {
      console.warn('API call failed, using mock data:', apiError)
      
      // Fallback to mock data if API fails
      const mockProfileData = {
        name: "Demo User",
        email: "demo@example.com",
        technical_skills: [
          {
            category: "Web Development",
            skills: ["HTML", "CSS", "JavaScript", "React", "Node.js"]
          },
          {
            category: "Database Systems",
            skills: ["PostgreSQL", "MongoDB"]
          }
        ],
        goal: "Sample learning goal"
      }
      
      return NextResponse.json({
        success: true,
        profile: mockProfileData
      })
    }

  } catch (error) {
    console.error('Error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to process resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
