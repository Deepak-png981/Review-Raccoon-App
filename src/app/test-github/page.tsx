'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import GithubStatus from '@/components/github/GithubStatus';

export default function TestGithubPage() {
  const { data: session, status: sessionStatus, update } = useSession();
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function testApi() {
    if (!session?.user?.id) return;
    
    setApiLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/debug?userId=${session.user.id}`);
      if (!response.ok) throw new Error('API test failed');
      const data = await response.json();
      setApiStatus(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setApiLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      testApi();
    }
  }, [session?.user?.id]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>GitHub Integration Test</CardTitle>
          <CardDescription>
            This page tests the GitHub integration and helps debug any issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status">
            <TabsList>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="session">Session Data</TabsTrigger>
              <TabsTrigger value="api-test">API Test</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-4 pt-4">
              <Alert variant="default">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Session Status</AlertTitle>
                <AlertDescription>
                  {sessionStatus === 'authenticated' ? (
                    <span className="text-green-500 flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" /> Authenticated as {session?.user?.email}
                    </span>
                  ) : sessionStatus === 'loading' ? (
                    <span className="text-amber-500 flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading session...
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <XCircle className="mr-2 h-4 w-4" /> Not authenticated
                    </span>
                  )}
                </AlertDescription>
              </Alert>
              
              <div className="py-2">
                <h3 className="text-lg font-semibold mb-2">GitHub Status Component:</h3>
                <GithubStatus />
              </div>
              
              <div className="py-2">
                <h3 className="text-lg font-semibold mb-2">GitHub Status from Session:</h3>
                {session?.user ? (
                  <div className="px-4 py-3 rounded-md bg-slate-100 dark:bg-slate-800">
                    <p>hasGithubConnected property exists: {('hasGithubConnected' in (session.user || {})) ? 'Yes' : 'No'}</p>
                    <p>GitHub Connected: {(session.user as any)?.hasGithubConnected ? 'Yes' : 'No'}</p>
                  </div>
                ) : (
                  <p>No session data available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="session" className="pt-4">
              <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-4">
                <pre className="whitespace-pre-wrap overflow-auto max-h-[400px]">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="api-test" className="space-y-4 pt-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-4">
                <h3 className="text-md font-semibold mb-2">API Test Results:</h3>
                {apiLoading ? (
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : apiStatus ? (
                  <pre className="whitespace-pre-wrap overflow-auto max-h-[400px]">
                    {JSON.stringify(apiStatus, null, 2)}
                  </pre>
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => update()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Session
          </Button>
          <Button onClick={testApi} disabled={apiLoading || !session?.user?.id}>
            {apiLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Testing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Test API
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 