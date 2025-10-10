/**
 * Next.js API Route: Get unread message count
 * GET /api/peer/connections/unread-count
 */

import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/peer/connections/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
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
