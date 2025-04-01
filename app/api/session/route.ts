import { NextRequest, NextResponse } from 'next/server';
import { Random } from '../../lib/random';
import { redis } from '../../lib/store';
import { serializeRandom } from '../../lib/utils';


// ends the session
export async function DELETE(request: NextRequest) {
  console.log('deleted bozino')
  const clientUUID = request.cookies.get('clientUUID')?.value;
  if (clientUUID && await redis.exists('session-${clientUUID}')) {
    await redis.del('session-${clientUUID}');
  }
  const response = NextResponse.json({ success: true });
  return response;
}


// begins the session
// TODO: check if not exists (in layout.tsx? or return status)
export async function POST(request: NextRequest) {
  const clientUUID = request.cookies.get('clientUUID');

  if (!clientUUID) {
    const newClientUUID = crypto.randomUUID();

    await redis.hset(`session-${newClientUUID}`, 'round', 1, 'randstate', serializeRandom(new Random()))

    const response = NextResponse.json({ success: true, clientUUID: newClientUUID });
    response.cookies.set('clientUUID', newClientUUID, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true,
    });

    return response;

  } else {
    return NextResponse.json({ status: 200 });
  }
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
