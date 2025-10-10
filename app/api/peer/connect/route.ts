import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[PROXY /peer/connect] Received body:', JSON.stringify(body, null, 2));
    console.log('[PROXY /peer/connect] Body keys:', Object.keys(body));
    console.log('[PROXY /peer/connect] receiverId value:', body.receiverId);
    console.log('[PROXY /peer/connect] connectionType value:', body.connectionType);

    const response = await fetch(`${API_URL}/peer/connect`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('[PROXY /peer/connect] Backend response status:', response.status);

    const data = await response.json();
    console.log('[PROXY /peer/connect] Backend response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to send connection request',
          details: data.details
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /peer/connect] Error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send connection request',
        details: error.message
      },
      { status: 500 }
    );
  }
}
