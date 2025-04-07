import React from 'react';
import { RepositoryCard } from './RepositoryCard';
import { Repository } from '@/types/Repository';

interface RepositoryListProps {
  repositories: Repository[];
}

export const RepositoryList: React.FC<RepositoryListProps> = ({ repositories }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {repositories.map(repo => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
}; 