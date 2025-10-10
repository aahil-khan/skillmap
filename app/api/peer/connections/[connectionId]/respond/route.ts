/**
 * Next.js API Route: Respond to connection request
 * POST /api/peer/connections/[connectionId]/respond
 */

import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005';

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

    const body = await request.json();
    const { action } = body;

    const response = await fetch(
      `${API_URL}/peer/connections/${params.connectionId}/respond`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({ action })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to respond to connection',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /peer/connections/respond] Error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to respond to connection',
        details: error.message
      },
      { status: 500 }
    );
  }
}
