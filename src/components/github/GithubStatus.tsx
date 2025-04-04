'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function GithubStatus() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<'loading' | 'connected' | 'not-connected'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // If session data includes GitHub status, use that
        if (session?.user && 'hasGithubConnected' in session.user) {
          setStatus(session.user.hasGithubConnected ? 'connected' : 'not-connected');
          return;
        }

        // Otherwise fetch from API
        const response = await fetch('/api/github/status');
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub status');
        }
        
        const data = await response.json();
        setStatus(data.isConnected ? 'connected' : 'not-connected');
      } catch (err) {
        console.error('Error checking GitHub status:', err);
        setError('Could not check GitHub connection status');
        setStatus('not-connected');
      }
    };

    if (session) {
      checkStatus();
    }
  }, [session]);

  if (status === 'loading') {
    return <div>Checking GitHub connection...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant={status === 'connected' ? 'default' : 'destructive'}>
      {status === 'connected' ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>GitHub Connected</AlertTitle>
          <AlertDescription>Your GitHub account is connected and ready to use.</AlertDescription>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>GitHub Not Connected</AlertTitle>
          <AlertDescription>
            You need to connect your GitHub account to use repository features.
          </AlertDescription>
        </>
      )}
    </Alert>
  );
} 