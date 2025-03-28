'use client';

import { useState, FormEvent } from 'react';

// Generate a number between 1 to 1000 inclusive.
function generateRandom(): number {
  const num = Math.floor(Math.random() * 1000) + 1;
  console.log('Last number was ' + num);
  return num;
}

// Choose a random string from a list of strings.
function chooseRandom(options: string[]): string {
  if (options.length === 0) throw new Error("options should not be empty");
  return options[Math.floor(Math.random() * options.length)];
}

export default function Page() {
  const flag = process.env.NEXT_PUBLIC_FLAG;
  const [target, setTarget] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [round, setRound] = useState<number>(1);
  const [message, setMessage] = useState<string>('');
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [animate, setAnimate] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newTarget = generateRandom();
    setTarget(newTarget);
    
    const numGuess = parseInt(guess, 10);

    // Correct guess
    if (numGuess === newTarget) {
      // Trigger then stop animation
      setAnimate(true);
      setTimeout(() => setAnimate(false), 800);

      if (round === 5) {  // End game
        setMessage(flag ?? '<FLAG>');
        setGameComplete(true);
        
      } else {  // round + 1
        const message = chooseRandom([
          'Correct! You\'re not so bad at this after all.', 
          'Correct! Lucky guess...',
          'Correct! You won\'t get the next one...',
          'Correct! Next time you won\'t be so lucky.'])
        setMessage(message);
        setRound(round + 1);
      }

    } else {  // Wrong guess
      const message = chooseRandom([
        'Wrong. You aren\'t great at guessing are you?', 
        'Wrong. Ready to give up yet?',
        'Wrong. Try again.',
        'Wrong. Did you think I would go easy?'])
      setMessage(message);
      setRound(1);
    }

    setGuess('');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Genie</h1>
      {!gameComplete ? (
        <>
          <p className="quote" style={{ marginBottom: '2rem' }}>"I'm thinking of a number between 1 and 1000."</p>
          <b className={ animate ? "animate" : "" }>Round {round} of 5</b>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              min="1"
              max="1000"
              required
            />
            <button type="submit">Submit Guess</button>
          </form>
          {message && <p className="quote">"{message}"</p>}
        </>
      ) : (
        <div>
          <h2 className="quote" style={{ marginTop: '2rem', marginBottom: '2rem' }}>You've defeated me... HOW?!</h2>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
