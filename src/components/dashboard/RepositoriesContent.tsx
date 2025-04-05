'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Star, GitFork, Clock, Code, Activity, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import ConnectRepositoryModal from './ConnectRepositoryModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';

const RepositoriesContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCheckingGithub, setIsCheckingGithub] = useState(false);
  const [isDisconnectingGithub, setIsDisconnectingGithub] = useState(false);
  const [githubStatus, setGithubStatus] = useState<{
    isConnected: boolean;
    username: string | null;
    tokenValid: boolean;
    tokenError?: string | null;
    githubData?: any;
  } | null>(null);
  
  // Automatically check GitHub connection status on page load
  useEffect(() => {
    checkGithubConnection();
  }, []);
  
  useEffect(() => {
    if (!searchParams) return;
    
    // Handle GitHub connection success
    if (searchParams.get('github_connected') === 'true') {
      toast({
        title: 'Success!',
        description: 'Your GitHub account has been successfully connected.',
        variant: 'default',
      });
      
      // Clear the URL parameters after showing the toast
      router.replace('/dashboard/repositories');
    }
    
    // Handle GitHub connection errors
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = 'There was an error connecting to GitHub.';
      
      switch (error) {
        // NextAuth standard errors
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
        case 'EmailCreateAccount':
        case 'Callback':
          errorMessage = 'There was a problem with the GitHub authentication flow. Please try again.';
          break;
        case 'OAuthAccountNotLinked':
          errorMessage = 'The GitHub account is already linked to another user.';
          break;
        case 'AccessDenied':
          errorMessage = 'Access was denied to your GitHub account.';
          break;
        case 'Configuration':
          errorMessage = 'There is a server configuration issue. Please contact support.';
          break;
          
        // Custom errors from our middleware and processing
        case 'no_oauth_data':
          errorMessage = 'Authentication data was missing. Please try again.';
          break;
        case 'invalid_oauth_data':
          errorMessage = 'Authentication data was invalid. Please try again.';
          break;
        case 'state_mismatch':
          errorMessage = 'Security validation failed. Please try again.';
          break;
        case 'no_code':
          errorMessage = 'No authentication code was provided by GitHub.';
          break;
        case 'no_user_id':
          errorMessage = 'User ID was missing from the connection request.';
          break;
        case 'token_exchange_failed':
          errorMessage = 'Failed to exchange code for GitHub token. Please try again.';
          break;
        case 'no_access_token':
          errorMessage = 'GitHub did not provide an access token.';
          break;
        case 'github_api_error':
          errorMessage = 'Failed to communicate with GitHub API. Please try again.';
          break;
        case 'invalid_github_user':
          errorMessage = 'Failed to retrieve your GitHub user data.';
          break;
        case 'user_not_found':
          errorMessage = 'User not found in the database. Please contact support.';
          break;
        case 'update_failed':
          errorMessage = 'Failed to update your user record with GitHub data.';
          break;
        case 'middleware_error':
          errorMessage = 'An error occurred while processing the GitHub callback.';
          break;
        case 'server_error':
          errorMessage = 'A server error occurred. Please try again or contact support.';
          break;
      }
      
      console.error(`GitHub connection error: ${error}`);
      
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Clear the URL parameters after showing the toast
      router.replace('/dashboard/repositories');
    }
  }, [searchParams, router]);
  
  const checkGithubConnection = async () => {
    setIsCheckingGithub(true);
    try {
      const res = await fetch('/api/user/github-status');
      if (!res.ok) {
        throw new Error('Failed to check GitHub connection');
      }
      
      const data = await res.json();
      setGithubStatus(data);
      
      if (data.isConnected && data.tokenValid) {
        toast({
          title: 'GitHub Connected',
          description: `Successfully connected to GitHub as ${data.username}`,
          variant: 'default',
        });
      } else if (data.isConnected && !data.tokenValid) {
        toast({
          title: 'GitHub Token Invalid',
          description: `Your GitHub connection exists but the token is invalid (${data.tokenError || 'Unknown error'}). Please reconnect.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Not Connected',
          description: 'You are not connected to GitHub. Please connect to access your repositories.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to check GitHub connection status',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingGithub(false);
    }
  };

  const handleReconnectGitHub = () => {
    // Use our custom GitHub connection API instead of NextAuth
    window.location.href = '/api/user/github-connect';
  };

  const handleDisconnectGitHub = async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account? This will remove access to your repositories.')) {
      return;
    }
    
    setIsDisconnectingGithub(true);
    try {
      const res = await fetch('/api/user/github-disconnect', {
        method: 'POST',
      });
      
      if (!res.ok) {
        throw new Error('Failed to disconnect GitHub account');
      }
      
      // Update the local state
      setGithubStatus(prev => ({
        ...prev!,
        isConnected: false,
        tokenValid: false,
        username: null,
        githubData: null,
      }));
      
      toast({
        title: 'GitHub Disconnected',
        description: 'Your GitHub account has been successfully disconnected.',
        variant: 'default',
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect GitHub account',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnectingGithub(false);
    }
  };

  const repositories = [
    {
      id: 1,
      name: "frontend-project",
      description: "React frontend application with TypeScript",
      stars: 42,
      forks: 12,
      language: "TypeScript",
      updatedAt: "3 days ago"
    },
    {
      id: 2,
      name: "api-service",
      description: "RESTful API service with Node.js and Express",
      stars: 28,
      forks: 7,
      language: "JavaScript",
      updatedAt: "1 week ago"
    },
    {
      id: 3,
      name: "data-processor",
      description: "Big data processing service with Python",
      stars: 15,
      forks: 3,
      language: "Python",
      updatedAt: "2 weeks ago"
    },
    {
      id: 4,
      name: "mobile-app",
      description: "React Native mobile application",
      stars: 36,
      forks: 9,
      language: "TypeScript",
      updatedAt: "4 days ago"
    },
    {
      id: 5,
      name: "documentation-site",
      description: "Documentation website with Docusaurus",
      stars: 8,
      forks: 2,
      language: "JavaScript",
      updatedAt: "1 month ago"
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Repositories</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your code repositories</p>
        </div>
        <div className="flex gap-2">
          {(!githubStatus || !githubStatus.isConnected || !githubStatus.tokenValid) ? (
            <ConnectRepositoryModal />
          ) : (
            <Button 
              className="flex items-center gap-2" 
              variant="default"
              disabled={isCheckingGithub}
            >
              <GitBranch size={16} />
              Connected to GitHub
            </Button>
          )}
          
          <Button 
            className="flex items-center gap-2" 
            variant="outline"
            onClick={checkGithubConnection}
            disabled={isCheckingGithub}
          >
            <RefreshCcw size={16} className={isCheckingGithub ? "animate-spin" : ""} />
            Check Connection
          </Button>
          
          {githubStatus && githubStatus.isConnected && !githubStatus.tokenValid && (
            <Button 
              className="flex items-center gap-2" 
              variant="destructive"
              onClick={handleReconnectGitHub}
            >
              <GitBranch size={16} />
              Reconnect GitHub
            </Button>
          )}
          
          {githubStatus && githubStatus.isConnected && githubStatus.tokenValid && (
            <Button 
              className="flex items-center gap-2" 
              variant="outline"
              onClick={handleDisconnectGitHub}
              disabled={isDisconnectingGithub}
            >
              <GitBranch size={16} />
              Disconnect GitHub
            </Button>
          )}
          
          <Button className="flex items-center gap-2" variant="outline">
            <GitBranch size={16} />
            New Repository
          </Button>
        </div>
      </div>
      
      {githubStatus && githubStatus.isConnected && githubStatus.tokenValid && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>GitHub Connected</AlertTitle>
          <AlertDescription>
            You are connected to GitHub as <span className="font-semibold">{githubStatus.username}</span>.
          </AlertDescription>
        </Alert>
      )}
      
      {githubStatus && githubStatus.isConnected && !githubStatus.tokenValid && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>GitHub Token Invalid</AlertTitle>
          <AlertDescription>
            Your GitHub account is connected, but the token is invalid: {githubStatus.tokenError || 'Unknown error'}. 
            Please use the "Reconnect GitHub" button above.
          </AlertDescription>
        </Alert>
      )}
      
      {searchParams && searchParams.get('github_connected') === 'true' && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Connected Successfully!</AlertTitle>
          <AlertDescription>
            Your GitHub account has been successfully connected. You can now access and manage your repositories.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4">
        {repositories.map(repo => (
          <Card key={repo.id} className="hover:bg-accent/5 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch size={18} className="text-primary" />
                    {repo.name}
                  </CardTitle>
                  <CardDescription>{repo.description}</CardDescription>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star size={14} />
                  <span>{repo.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork size={14} />
                  <span>{repo.forks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Code size={14} />
                  <span>{repo.language}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground border-t py-3">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Updated {repo.updatedAt}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default RepositoriesContent;
