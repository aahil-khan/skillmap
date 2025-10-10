import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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
    const connectionId = params.id;

    const response = await fetch(`${API_URL}/peer/connections/${connectionId}/respond`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to respond to connection',
          details: data.details
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /peer/connections/:id/respond] Error:', error.message);
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
