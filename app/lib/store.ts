import Redis from 'ioredis';


export const redis = new Redis();


export async function incrRound(UUID: string) {
  const currRound = await redis.hget(`session-${UUID}`, 'round');
  if (!currRound) throw new Error(`No state found for ${UUID}`)
  await redis.hset(`session-${UUID}`, 'round', Number(currRound) + 1)
  return Number(currRound) + 1;
}


export async function resetRound(UUID: string) {
  await redis.hset(`session-${UUID}`, 'round', 1)
}