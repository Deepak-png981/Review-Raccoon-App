
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, GitPullRequestDraft, Star, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const CodeReviewsContent: React.FC = () => {
  const codeReviews = [
    {
      id: 1,
      title: "Authentication Service Refactor",
      repository: "frontend-project",
      lines: 342,
      changed: 76,
      score: 92,
      issues: 2,
      status: "completed"
    },
    {
      id: 2,
      title: "API Rate Limiting Implementation",
      repository: "api-service",
      lines: 187,
      changed: 54,
      score: 78,
      issues: 5,
      status: "in-progress"
    },
    {
      id: 3,
      title: "Database Query Optimization",
      repository: "data-processor",
      lines: 231,
      changed: 119,
      score: 65,
      issues: 8,
      status: "in-progress"
    },
    {
      id: 4,
      title: "Mobile Navigation Fix",
      repository: "mobile-app",
      lines: 98,
      changed: 32,
      score: 89,
      issues: 3,
      status: "completed"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">In Progress</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Reviews</h1>
          <p className="text-muted-foreground mt-1">AI-assisted code quality analysis</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-2 py-1">
            Avg. Score: 81%
          </Badge>
          <Badge variant="outline" className="px-2 py-1">
            Total Issues: 18
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {codeReviews.map(review => (
          <Card key={review.id} className="hover:bg-accent/5 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{review.title}</CardTitle>
                  <CardDescription>{review.repository}</CardDescription>
                </div>
                {getStatusBadge(review.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Quality Score</div>
                <div className={`text-lg font-bold ${getScoreColor(review.score)}`}>{review.score}%</div>
              </div>
              <Progress value={review.score} className={`h-2 ${getProgressColor(review.score)}`} />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Lines of Code</span>
                  <span className="font-medium">{review.lines}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Changed Lines</span>
                  <span className="font-medium">{review.changed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Issues Found</span>
                  <span className="font-medium">{review.issues}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Review Status</span>
                  <span className="font-medium capitalize">{review.status.replace('-', ' ')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground border-t py-3">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Last analyzed 2 days ago</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default CodeReviewsContent;
