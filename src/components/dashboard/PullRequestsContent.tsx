
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GitPullRequest, User, Calendar, MessageSquare, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PullRequestsContent: React.FC = () => {
  const pullRequests = [
    {
      id: 1,
      title: "Add authentication flow",
      repository: "frontend-project",
      author: "Alex Johnson",
      createdAt: "2 days ago",
      comments: 7,
      status: "approved",
      reviewers: ["Maria Garcia", "Sam Wilson"]
    },
    {
      id: 2,
      title: "Implement rate limiting",
      repository: "api-service",
      author: "Taylor Smith",
      createdAt: "4 days ago",
      comments: 4,
      status: "review",
      reviewers: ["Chris Lee", "Jordan Baker"]
    },
    {
      id: 3,
      title: "Optimize batch processing",
      repository: "data-processor",
      author: "Jamie Brown",
      createdAt: "1 week ago",
      comments: 12,
      status: "changes",
      reviewers: ["Casey Morgan", "Pat Johnson"]
    },
    {
      id: 4,
      title: "Update documentation",
      repository: "documentation-site",
      author: "Riley Cooper",
      createdAt: "3 days ago",
      comments: 2,
      status: "approved",
      reviewers: ["Morgan Freeman", "Blake Andrews"]
    },
    {
      id: 5,
      title: "Fix navigation issues",
      repository: "mobile-app",
      author: "Quinn Wilson",
      createdAt: "5 days ago",
      comments: 8,
      status: "review",
      reviewers: ["Dana Kim", "Jesse Martinez"]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Approved</Badge>;
      case 'review':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">In Review</Badge>;
      case 'changes':
        return <Badge variant="outline" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Changes Requested</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'review':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'changes':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <GitPullRequest size={16} />;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pull Requests</h1>
          <p className="text-muted-foreground mt-1">Review and manage code changes</p>
        </div>
        <Badge className="px-2 py-1 text-xs">
          {pullRequests.length} Open Pull Requests
        </Badge>
      </div>
      
      <div className="space-y-4">
        {pullRequests.map(pr => (
          <Card key={pr.id} className="hover:bg-accent/5 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-start">
                  {getStatusIcon(pr.status)}
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {pr.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <span>{pr.repository}</span>
                      <span className="text-muted-foreground mx-1">•</span>
                      <span>#{pr.id}</span>
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(pr.status)}
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{pr.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Created {pr.createdAt}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span>{pr.comments} comments</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs pt-0 flex justify-between items-center border-t py-3">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Last updated 6 hours ago</span>
              </div>
              <div className="flex -space-x-2">
                {pr.reviewers.map((reviewer, index) => (
                  <div key={index} className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border border-background" title={reviewer}>
                    {reviewer.charAt(0)}
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default PullRequestsContent;
