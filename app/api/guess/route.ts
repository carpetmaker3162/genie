
import { NextRequest, NextResponse } from "next/server";
import { resetRound, incrRound } from "../../lib/store";
import { redis } from '../../lib/store';
import { baseUrl } from "../../lib/config";


const correctMsgs = [
  'Correct! You\'re not so bad at this after all.', 
  'Correct! Lucky guess...',
  'Correct! You won\'t get the next one...',
  'Correct! Next time you won\'t be so lucky.']


const incorrectMsgs = [
  'Wrong. You aren\'t great at guessing are you?', 
  'Wrong. Ready to give up yet?',
  'Wrong. Try again.',
  'Wrong. Did you think I would go easy?']


async function getRandom(request: NextRequest) {
  const randomResponse = await fetch(`${baseUrl}/api/random`, {
    headers: request.headers,
  });
  if (!randomResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch random number" }, { status: randomResponse.status });
  }

  const { num } = await randomResponse.json();
  return Math.floor(num * 1000) + 1;
}


async function chooseRandom(request: NextRequest, options: string[]) {
  const randomResponse = await fetch(`${baseUrl}/api/random`, {
    headers: request.headers,
  });
  if (!randomResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch random number" }, { status: randomResponse.status });
  }

  const { num } = await randomResponse.json();
  return options[Math.floor(num * options.length)];
}


export async function POST(request: NextRequest) {
  const clientUUID = request.cookies.get("clientUUID")?.value;
  if (!clientUUID || !await redis.exists(`session-${clientUUID}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guess } = await request.json();
  if (typeof guess !== "number") {
    return NextResponse.json({ error: "Invalid guess; must be a number" }, { status: 400 });
  }

  const num = await getRandom(request);

  // check if the guess is correct
  if (num === guess) {
    const round = await incrRound(clientUUID);
    if (round > 5) {
      const flag: string = process.env.FLAG ?? "<FLAG>";
      return NextResponse.json({ flag, gameOver: true, correct: true });
    } else {
      const message = await chooseRandom(request, correctMsgs);
      return NextResponse.json({ message, round, gameOver: false, correct: true });
    }
  } else {
    resetRound(clientUUID);
    const message = await chooseRandom(request, incorrectMsgs);
    return NextResponse.json({ message, round: 1, correct: false });
  }
}