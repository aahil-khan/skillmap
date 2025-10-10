import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'both';
    const limit = searchParams.get('limit') || '20';

    const response = await fetch(`${API_URL}/peer/matches?type=${type}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to fetch matches',
          details: data.details
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /peer/matches] Error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch matches',
        details: error.message
      },
      { status: 500 }
    );
  }
}
