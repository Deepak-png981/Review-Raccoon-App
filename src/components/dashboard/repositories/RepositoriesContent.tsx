'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

import { useGithubConnection } from './hooks/useGithubConnection';
import { useRepositories } from './hooks/useRepositories';

import { RepositoryHeader } from './components/RepositoryHeader';
import { StatusAlerts } from './components/StatusAlerts';
import { RepositorySearch } from './components/RepositorySearch';
import { RepositoryList } from './components/RepositoryList';
import { PaginationControls } from './components/PaginationControls';
import { 
  RepositoriesLoading, 
  RepositoriesFetching 
} from './components/LoadingState';
import { 
  NoGithubConnection, 
  NoRepositories, 
  NoSearchResults 
} from './components/EmptyStates';

const RepositoriesContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { 
    githubStatus, 
    isCheckingGithub,
    checkGithubConnection,
    handleReconnectGitHub, 
  } = useGithubConnection();
  
  const {
    repositories,
    filteredRepositories,
    isLoadingRepos,
    repoError,
    searchQuery,
    pagination,
    fetchRepositories,
    handlePageChange,
    setSearchQuery,
  } = useRepositories(githubStatus);

  useEffect(() => {
    checkGithubConnection();
  }, [checkGithubConnection]);
  
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

  const handleRefreshRepositories = () => {
    fetchRepositories(1);
  };

  const handleClearSearch = () => {
    console.log('Clearing search query');
    setSearchQuery('');
  };
  
  return (
    <>
      <RepositoryHeader 
        title={githubStatus?.username ?  `${githubStatus.username}` : 'My Repositories'}
        githubStatus={githubStatus}
        isLoading={isLoadingRepos}
        onRefresh={handleRefreshRepositories}
        onReconnect={handleReconnectGitHub}
        isCheckingGithub={isCheckingGithub}
        checkGithubConnection={checkGithubConnection}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCount={filteredRepositories.length}
        totalCount={repositories.length}
        showSearch={repositories.length > 0 && githubStatus?.isConnected && githubStatus?.tokenValid && !isLoadingRepos}
      />
      
      <StatusAlerts 
        githubStatus={githubStatus} 
        repoError={repoError} 
      />
      
      {isCheckingGithub && <RepositoriesLoading />}
      
      {!isCheckingGithub && (!githubStatus || !githubStatus.isConnected) && (
        <NoGithubConnection />
      )}
      
      {isLoadingRepos && <RepositoriesFetching />}
      
      {!isLoadingRepos && repositories.length === 0 && !repoError && githubStatus?.isConnected && githubStatus?.tokenValid && (
        <NoRepositories onRefresh={handleRefreshRepositories} />
      )}
      
      {!isLoadingRepos && repositories.length > 0 && filteredRepositories.length === 0 && searchQuery && (
        <NoSearchResults 
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
        />
      )}
      
      {filteredRepositories.length > 0 && !isLoadingRepos && (
        <RepositoryList repositories={filteredRepositories} />
      )}
      
      {repositories.length > 0 && !searchQuery && pagination.totalPages > 1 && (
        <div className="mt-8">
          <div className="flex items-center justify-center mb-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700"></div>
            <h3 className="text-center mx-4 text-sm font-medium text-slate-600 dark:text-slate-400 px-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              Page {pagination.currentPage} of {pagination.totalPages}
            </h3>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700"></div>
          </div>
          <PaginationControls 
            pagination={pagination}
            isLoading={isLoadingRepos}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default RepositoriesContent; 