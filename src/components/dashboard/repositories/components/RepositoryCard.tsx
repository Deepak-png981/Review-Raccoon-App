import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Star, GitFork, Clock, Code, ExternalLink, Eye, Link } from 'lucide-react';
import { Repository } from '@/types/Repository';
import { useToast } from '@/components/ui/use-toast';

interface RepositoryCardProps {
  repository: Repository;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

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
  
  const handleConnectRepository = async () => {
    try {
      setIsConnecting(true);
      const response = await fetch('/api/github/create-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoName: repository.name,
          repoOwner: repository.owner,
        }),
      });

      const data = await response.json();
      console.log("data", data);
      if (response.ok && data.success) {
        const newWindow = window.open(data.pullRequest.url, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          toast({
            title: 'Success!',
            description: (
              <div>
                Pull request created for Review Raccoon integration.
                <br />
                <a 
                  href={data.pullRequest.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Click here to open the PR
                </a>
              </div>
            ),
            variant: 'default',
          });
        } else {
          toast({
            title: 'Success!',
            description: `Pull request created for Review Raccoon integration. PR #${data.pullRequest.number}`,
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Failed to create pull request',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error connecting repository:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect repository',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

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
        
        <div className="flex justify-end items-center gap-2 mt-2 pt-3 border-t border-border/40">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 transition-all duration-300 hover:bg-blue-500 hover:text-white"
            onClick={handleConnectRepository}
            disabled={isConnecting}
          >
            <Link size={14} />
            <span className="mr-1">{isConnecting ? 'Connecting...' : 'Connect'}</span>
          </Button>
          
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