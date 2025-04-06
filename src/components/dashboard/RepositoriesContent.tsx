'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Star, GitFork, Clock, Code, Activity, AlertCircle, CheckCircle, RefreshCcw, Loader2, ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import ConnectRepositoryModal from './ConnectRepositoryModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Repository , PaginationData } from '@/types/Repository';

const RepositoriesContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isCheckingGithub, setIsCheckingGithub] = useState(false);
  const [isDisconnectingGithub, setIsDisconnectingGithub] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [repoError, setRepoError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [githubStatus, setGithubStatus] = useState<{
    isConnected: boolean;
    username: string | null;
    tokenValid: boolean;
    tokenError?: string | null;
    githubData?: {
      username: string;
      connectedAt: Date;
      connected: boolean;
    } | null;
  } | null>(null);
  
  const filteredRepositories = useMemo(() => {
    if (!searchQuery.trim()) return repositories;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return repositories.filter(repo => 
      repo.name.toLowerCase().includes(lowerCaseQuery) || 
      (repo.description && repo.description.toLowerCase().includes(lowerCaseQuery))
    );
  }, [repositories, searchQuery]);
  
  useEffect(() => {
    checkGithubConnection();
  }, []);
  
  const fetchRepositories = useCallback(async (page = 1) => {
    setIsLoadingRepos(true);
    setRepoError(null);
    
    try {
      const response = await fetch(`/api/user/github-repositories?page=${page}&per_page=${pagination.perPage}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch repositories');
      }
      
      const data = await response.json();
      setRepositories(data.repositories);
      setPagination(data.pagination);
      
      console.log('Fetched repositories:', data.repositories);
      console.log('Pagination:', data.pagination);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setRepoError(error instanceof Error ? error.message : 'Unknown error fetching repositories');
      toast({
        title: 'Error',
        description: 'Failed to fetch your GitHub repositories',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRepos(false);
    }
  }, [pagination.perPage]);
  
  useEffect(() => {
    if (githubStatus?.isConnected && githubStatus?.tokenValid) {
      fetchRepositories();
    }
  }, [githubStatus, fetchRepositories]);
  
  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get('github_connected') === 'true') {
      toast({
        title: 'Success!',
        description: 'Your GitHub account has been successfully connected.',
        variant: 'default',
      });
      router.replace('/dashboard/repositories');
    }
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

  const handlePageChange = (newPage: number) => {
    if (newPage === pagination.currentPage) return;
    
    setSearchQuery('');
    fetchRepositories(newPage);
  };
  
  const handlePreviousClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    handlePageChange(pagination.currentPage - 1);
  };
  
  const handleNextClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    handlePageChange(pagination.currentPage + 1);
  };
  
  const createPageClickHandler = (page: number): React.MouseEventHandler<HTMLButtonElement> => (e) => {
    e.preventDefault();
    handlePageChange(page);
  };

  const generatePaginationButtons = () => {
    const buttons = [];
    
    buttons.push({
      page: 1,
      isCurrent: pagination.currentPage === 1,
    });
    
    if (pagination.currentPage > 3) {
      buttons.push({ page: 'ellipsis1', isCurrent: false });
    }
    
    // Show the page before current if it's not the first page and not right after first page
    if (pagination.currentPage > 2) {
      buttons.push({
        page: pagination.currentPage - 1,
        isCurrent: false,
      });
    }
    
    // Show current page if it's not the first or last page
    if (pagination.currentPage !== 1 && pagination.currentPage !== pagination.totalPages) {
      buttons.push({
        page: pagination.currentPage,
        isCurrent: true,
      });
    }
    
    // Show the page after current if it's not the last page and not right before last page
    if (pagination.currentPage < pagination.totalPages - 1) {
      buttons.push({
        page: pagination.currentPage + 1,
        isCurrent: false,
      });
    }
    
    // If current page is less than totalPages - 2, show ellipsis before last page
    if (pagination.currentPage < pagination.totalPages - 2) {
      buttons.push({ page: 'ellipsis2', isCurrent: false });
    }
    
    // Always show the last page if there's more than one page
    if (pagination.totalPages > 1) {
      buttons.push({
        page: pagination.totalPages,
        isCurrent: pagination.currentPage === pagination.totalPages,
      });
    }
    
    return buttons;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Repositories</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your code repositories</p>
        </div>
        <div className="flex gap-2">
          {isCheckingGithub ? (
            <Button 
              className="flex items-center gap-2" 
              variant="outline"
              disabled
            >
              <Loader2 size={16} className="animate-spin" />
              Checking Connection...
            </Button>
          ) : (
            (!githubStatus || !githubStatus.isConnected || !githubStatus.tokenValid) ? (
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
            )
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
          
        </div>
      </div>
      
      {githubStatus && githubStatus.isConnected && githubStatus.tokenValid && searchParams && searchParams.get('github_connected') === 'true' && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Connected Successfully!</AlertTitle>
          <AlertDescription>
            Your GitHub account has been successfully connected. You can now access and manage your repositories.
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
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-medium">Your Repositories</h2>
          {githubStatus?.isConnected && githubStatus?.tokenValid && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected as {githubStatus.username}
            </div>
          )}
        </div>
        {githubStatus?.isConnected && githubStatus?.tokenValid && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => { e.preventDefault(); fetchRepositories(1); }} 
            disabled={isLoadingRepos}
          >
            {isLoadingRepos ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Repositories
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Repositories
              </>
            )}
          </Button>
        )}
      </div>
      
      {repositories.length > 0 && githubStatus?.isConnected && githubStatus?.tokenValid && !isLoadingRepos && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories by name or description..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Showing {filteredRepositories.length} of {repositories.length} repositories
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        </div>
      )}
      {/* Sekeleton loader */}
      {isCheckingGithub && (
        <div className="space-y-6">
          <div className="rounded-lg border p-6 mb-4 animate-pulse">
            <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-lg border p-4 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="ml-auto h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isCheckingGithub && (!githubStatus || !githubStatus.isConnected) && (
        <div className="rounded-lg border bg-card p-8 text-center mb-6">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10">
            <GitBranch size={32} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Connect Your GitHub Account</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Link your GitHub account to view and manage your repositories. Get insights, track pull requests, and more.
          </p>
          <ConnectRepositoryModal trigger={
            <Button className="button-glow flex items-center gap-2">
              <GitBranch size={16} />
              Connect GitHub Now
            </Button>
          } />
        </div>
      )}
      
      {isLoadingRepos && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading repositories...</p>
        </div>
      )}
      
      {repoError && !isLoadingRepos && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Repositories</AlertTitle>
          <AlertDescription>
            {repoError}
          </AlertDescription>
        </Alert>
      )}
      
      {!isLoadingRepos && repositories.length === 0 && !repoError && githubStatus?.isConnected && githubStatus?.tokenValid && (
        <div className="rounded-lg border bg-card p-8 text-center mb-6">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-amber-100">
            <GitBranch size={32} className="text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Repositories Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We couldn't find any repositories in your GitHub account. Create a new repository or refresh to try again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={(e) => { e.preventDefault(); fetchRepositories(1); }}
            >
              <RefreshCcw size={16} />
              Refresh
            </Button>
            <Button className="flex items-center gap-2">
              <GitBranch size={16} />
              Create Repository
            </Button>
          </div>
        </div>
      )}
      
      {!isLoadingRepos && repositories.length > 0 && filteredRepositories.length === 0 && searchQuery && (
        <div className="rounded-lg border bg-card p-8 text-center mb-6">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-100">
            <Search size={32} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Matching Repositories</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            No repositories match your search query "<span className="font-medium">{searchQuery}</span>". Try a different search term or clear your search.
          </p>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setSearchQuery('')}
          >
            <RefreshCcw size={16} />
            Clear Search
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredRepositories.map(repo => (
          <Card key={repo.id} className="hover:bg-accent/5 transition-colors overflow-hidden border border-border/40 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-1 rounded bg-primary/10 mr-1 flex-shrink-0">
                      <GitBranch size={16} className="text-primary" />
                    </div>
                    <span className="truncate">{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground flex-shrink-0">Private</span>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {repo.description || 'No description provided'}
                  </CardDescription>
                </div>
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ExternalLink size={14} />
                    View
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent">
                  <Star size={14} />
                  <span>{repo.stars}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent">
                  <GitFork size={14} />
                  <span>{repo.forks}</span>
                </div>
                {repo.language && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent">
                    <Code size={14} />
                    <span>{repo.language}</span>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-1 text-xs">
                  <Clock size={12} />
                  <span>Updated {repo.updatedAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {repositories.length > 0 && !searchQuery && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-4 mb-8">
          <div className="flex items-center space-x-2 bg-card border rounded-lg p-2 shadow-sm">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!pagination.hasPreviousPage || isLoadingRepos}
              onClick={handlePreviousClick}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-1">
              <Button
                variant={pagination.currentPage === 1 ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isLoadingRepos}
                onClick={createPageClickHandler(1)}
              >
                1
              </Button>
              
              {pagination.currentPage > 3 && (
                <span className="px-1 text-muted-foreground">•••</span>
              )}
              
              {pagination.currentPage > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoadingRepos}
                  onClick={createPageClickHandler(pagination.currentPage - 1)}
                >
                  {pagination.currentPage - 1}
                </Button>
              )}
              
              {pagination.currentPage > 1 && pagination.currentPage < pagination.totalPages && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoadingRepos}
                >
                  {pagination.currentPage}
                </Button>
              )}
              
              {pagination.currentPage < pagination.totalPages - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoadingRepos}
                  onClick={createPageClickHandler(pagination.currentPage + 1)}
                >
                  {pagination.currentPage + 1}
                </Button>
              )}
              
              {pagination.currentPage < pagination.totalPages - 2 && (
                <span className="px-1 text-muted-foreground">•••</span>
              )}
              
              {pagination.totalPages > 1 && (
                <Button
                  variant={pagination.currentPage === pagination.totalPages ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0" 
                  disabled={isLoadingRepos}
                  onClick={createPageClickHandler(pagination.totalPages)}
                >
                  {pagination.totalPages}
                </Button>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!pagination.hasNextPage || isLoadingRepos}
              onClick={handleNextClick}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default RepositoriesContent;
