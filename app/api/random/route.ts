// API that returns the next random number from the user's RNG instance


import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../lib/store";
import { parseRandom, serializeRandom } from "../../lib/utils";


export async function GET(request: NextRequest) {
  const clientUUID = request.cookies.get('clientUUID')?.value;
  if (!clientUUID || !await redis.exists(`session-${clientUUID}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const rngState = await redis.hget(`session-${clientUUID}`, 'randstate');
  if (!rngState) {
    return NextResponse.json({ error: `No RNG state found for ${clientUUID}` }, { status: 500 });
  }
  
  let random = parseRandom(rngState);
  const num = random.random();
  await redis.hset(`session-${clientUUID}`, 'randstate', serializeRandom(random));

  return NextResponse.json({ num });
}