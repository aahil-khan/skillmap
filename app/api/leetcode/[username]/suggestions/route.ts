const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params
    
    console.log(`[PROXY] Fetching suggestions for ${username}`)
    
    // This is a public API, no authentication required
    const backendResponse = await fetch(`${BACKEND_URL}/api/leetcode/${username}/suggestions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('[PROXY] Backend error:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      
      return NextResponse.json(
        { recommended_problems: [], error: errorData.error || 'Failed to fetch suggestions' },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    console.log('[PROXY] Successfully fetched suggestions:', data)
    
    // Return the data directly (it already has recommended_problems)
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('[PROXY] API Route Error:', error)
    return NextResponse.json(
      { recommended_problems: [], error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
