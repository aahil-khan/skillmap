/**
 * Next.js API Route: Get unread message count
 * GET /api/peer/connections/unread-count
 */

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

    // Extract user_id from JWT token
    const token = authHeader.replace('Bearer ', '');
    let user_id;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      user_id = payload.sub;
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const url = new URL(`${API_URL}/peer/connections/unread-count`);
    url.searchParams.append('user_id', user_id);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to fetch unread count',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /peer/connections/unread-count] Error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch unread count',
        details: error.message
      },
      { status: 500 }
    );
  }
}
