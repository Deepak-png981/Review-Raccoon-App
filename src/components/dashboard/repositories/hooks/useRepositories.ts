import { useState, useCallback, useMemo } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Repository, PaginationData } from '@/types/Repository';
import { GithubStatus } from '@/types/Repository';

export const useRepositories = (githubStatus: GithubStatus | null) => {
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

  const filteredRepositories = useMemo(() => {
    if (!searchQuery.trim()) return repositories;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return repositories.filter(repo => 
      repo.name.toLowerCase().includes(lowerCaseQuery) || 
      (repo.description && repo.description.toLowerCase().includes(lowerCaseQuery))
    );
  }, [repositories, searchQuery]);

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

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage === pagination.currentPage) return;
    
    setSearchQuery('');
    setIsLoadingRepos(true);
    fetchRepositories(newPage);
    
  }, [pagination.currentPage, fetchRepositories, setSearchQuery]);

  return {
    repositories,
    filteredRepositories,
    isLoadingRepos,
    repoError,
    searchQuery,
    pagination,
    fetchRepositories,
    handlePageChange,
    setSearchQuery,
  };
}; 