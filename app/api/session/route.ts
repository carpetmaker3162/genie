// session-related APIs


import { NextRequest, NextResponse } from 'next/server';
import Random from '../../lib/random';
import { redis } from '../../lib/store';
import { serializeRandom } from '../../lib/utils';


// begins the session
export async function POST(request: NextRequest) {
  let clientUUID: any = request.cookies.get('clientUUID');
  
  if (!clientUUID) {
    clientUUID = crypto.randomUUID();
  } else {
    clientUUID = clientUUID.value;
  }

  if (!await redis.exists(`session-${clientUUID}`))
  {
    await redis.hset(`session-${clientUUID}`, 'round', 1, 'randstate', serializeRandom(new Random()))
  }

  const response = NextResponse.json({ success: true, clientUUID });
  response.cookies.set('clientUUID', clientUUID, {
    httpOnly: true,
    sameSite: 'lax',
    // secure: true, // if https
  });
    
  return response;
}


// retrieve client state from server
export async function GET(request: NextRequest) {
  const clientUUID = request.cookies.get('clientUUID')?.value;
  if (!clientUUID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const currRoundStr = await redis.hget(`session-${clientUUID}`, 'round');
  if (!currRoundStr) {
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
  }
  
  const round = Number(currRoundStr);
  return NextResponse.json({ round });
}


// ends the session
export async function DELETE(request: NextRequest) {
  const clientUUID = request.cookies.get('clientUUID')?.value;
  if (clientUUID && await redis.exists(`session-${clientUUID}`)) {
    await redis.hdel(`session-${clientUUID}`, 'round', 'randstate');
  }
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('clientUUID');

  return response;
}