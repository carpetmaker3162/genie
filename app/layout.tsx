'use client';
import { useEffect } from 'react';
import '../styles/globals.css';
import { baseUrl } from './lib/config';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch(`${baseUrl}/api/session`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        console.log('Session created:', data);
      })
      .catch((err) => {
        console.error('Session creation error:', err);
      });

    const cleanupSession = () => {
      fetch(`${baseUrl}/api/session`, { method: 'DELETE', keepalive: true });
      // delete clientUUID cookie
      document.cookie = "clientUUID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };
    window.addEventListener('beforeunload', cleanupSession);
    return () => window.removeEventListener('beforeunload', cleanupSession);
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
