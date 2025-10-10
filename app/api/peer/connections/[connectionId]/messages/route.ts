/**
 * Next.js API Route: Messages for a connection
 * GET/POST /api/peer/connections/[connectionId]/messages
 */

import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

export async function GET(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
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

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';

    const url = new URL(`${API_URL}/peer/connections/${params.connectionId}/messages`);
    url.searchParams.append('user_id', user_id);
    url.searchParams.append('limit', limit);

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
          error: data.error || 'Failed to fetch messages',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /peer/connections/messages GET] Error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch messages',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
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

    const body = await request.json();
    const { message } = body;

    const response = await fetch(
      `${API_URL}/peer/connections/${params.connectionId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id, message })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to send message',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /peer/connections/messages POST] Error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send message',
        details: error.message
      },
      { status: 500 }
    );
  }
}
