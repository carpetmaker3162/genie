'use client';

import { useState, FormEvent } from 'react';
import { baseUrl } from './lib/config';


export default function Page() {
  const [guess, setGuess] = useState<string>('');
  const [round, setRound] = useState<number>(1);
  const [message, setMessage] = useState<string>('');
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [animate, setAnimate] = useState(false);
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const numGuess = parseInt(guess, 10);

    const response = await fetch(`${baseUrl}/api/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ guess: numGuess })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Request failed");
    }
    
    // correct guess
    if (result.correct) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 800);

      if (result.gameOver) {  // end game
        setMessage(result.flag);
        setGameComplete(true);
      } else {  // round + 1
        setMessage(result.message);
        setRound(result.round);
      }

    } else {  // wrong guess
      setMessage(result.message);
      setRound(result.round);
    }

    setGuess('');
  };

  
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Genie</h1>
      {!gameComplete ? (
        <>
          <p className="quote" style={{ marginBottom: '2rem' }}>"I'm thinking of a number between 1 and 100."</p>
          <b className={ animate ? "animate" : "" }>Round {round} of 5</b>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              min="1"
              max="100"
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
