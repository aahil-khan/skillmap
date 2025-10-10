const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params
    
    console.log('=== Next.js API Route: Fetching stats for:', username);
    
    // This is a public API, no authentication required
    const backendResponse = await fetch(`${BACKEND_URL}/api/leetcode/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching
    })
    
    console.log('Backend response status:', backendResponse.status);
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend error:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to fetch LeetCode data' },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    console.log('=== Backend returned (stats) ===');
    console.log('Type:', typeof data);
    console.log('Has success?:', data.success);
    console.log('Has data?:', !!data.data);
    console.log('Data keys:', data.data ? Object.keys(data.data) : 'no data');
    console.log('===============================');
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
