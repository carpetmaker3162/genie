import { NextRequest, NextResponse } from 'next/server';
import { clientDataStore } from '../../lib/store';
import { Random } from '../../lib/random';
// import { Redis } from 'ioredis';


// const redis = new Redis();


// ends the session
export async function DELETE(request: NextRequest) {
  console.log('deleted bozinado');
  const clientUUID = request.cookies.get('clientUUID')?.value;
  if (clientUUID && clientDataStore[clientUUID]) {
    delete clientDataStore[clientUUID];
  }
  // Optionally clear the cookie by returning a Set-Cookie header with expired date
  const response = NextResponse.json({ success: true });
  //response.cookies.set('clientUUID', '', { expires: new Date(0) });
  return response;
}


// begins the session
export async function POST(request: NextRequest) {
  const clientUUID = crypto.randomUUID();

  clientDataStore[clientUUID] = { 
    random: new Random(),
    round: 1
  };
  console.log(clientDataStore);

  // Create response and set HTTP-only cookie with the generated UUID
  const response = NextResponse.json({ success: true, clientUUID });
  response.cookies.set('clientUUID', clientUUID, {
    httpOnly: true,
    sameSite: 'lax',
    // Set secure flag in production environments
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}


// retrieve client state from server
export async function GET(request: NextRequest) {
  const clientUUID = request.cookies.get('clientUUID')?.value;
  if (!clientUUID || !clientDataStore[clientUUID]) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { round } = clientDataStore[clientUUID];
  return NextResponse.json({ round });
}
