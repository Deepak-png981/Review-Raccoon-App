import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Star, GitFork, Clock, Code, ExternalLink, Eye } from 'lucide-react';
import { Repository } from '@/types/Repository';

interface RepositoryCardProps {
  repository: Repository;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  // Function to generate a deterministic color based on repository name
  const getRepositoryColor = (name: string) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-blue-600',
    ];
    
    // Simple hash function to get consistent color for same repo name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const repoColor = getRepositoryColor(repository.name);
  
  return (
    <Card className="group overflow-hidden border border-border/40 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 relative">
      {/* Top color bar */}
      <div className={`h-2 w-full bg-gradient-to-r ${repoColor} absolute top-0 left-0`}></div>
      
      <CardHeader className="pt-6 pb-2">
        <div className="flex justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${repoColor} text-white mr-2 flex-shrink-0`}>
                <GitBranch size={16} />
              </div>
              <span className="truncate font-bold">{repository.name}</span>
              {repository.private && (
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground flex-shrink-0">Private</span>
              )}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {repository.description || 'No description provided'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mb-4">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/10">
            <Star size={14} className="text-amber-500" />
            <span className="font-medium">{repository.stars}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/10">
            <GitFork size={14} className="text-indigo-500" />
            <span className="font-medium">{repository.forks}</span>
          </div>
          {repository.language && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/10">
              <Code size={14} className="text-emerald-500" />
              <span className="font-medium">{repository.language}</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 text-xs">
            <Clock size={12} className="text-gray-400" />
            <span>Updated {repository.updatedAt}</span>
          </div>
        </div>
        
        <div className="flex justify-end items-center mt-2 pt-3 border-t border-border/40">
          <a href={repository.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <Button variant="outline" size="sm" className="flex items-center gap-1 transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
              <Eye size={14} />
              <span className="mr-1">View</span>
              <ExternalLink size={14} />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}; 