
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Star, GitFork, Clock, Code, Activity } from 'lucide-react';

const RepositoriesContent: React.FC = () => {
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
        <Button className="button-glow flex items-center gap-2">
          <GitBranch size={16} />
          New Repository
        </Button>
      </div>
      
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
