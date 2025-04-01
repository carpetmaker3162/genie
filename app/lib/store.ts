import { Redis } from 'ioredis';

export const redis = new Redis({
  host: 'localhost',
  port: 6379
});

/* interface SessionData {
  random: Random;
  round: number;
}

export const clientDataStore: Record<string, SessionData> = {}; */



export async function incrRound(UUID: string) {
  const currRound = await redis.hget(`session-${UUID}`, 'round');
  if (!currRound) throw new Error(`No state found for ${UUID}`)
  await redis.hset(`session-${UUID}`, 'round', Number(currRound) + 1)
  return Number(currRound) + 1;
}

export async function resetRound(UUID: string) {
  await redis.hset(`session-${UUID}`, 'round', 1)
}