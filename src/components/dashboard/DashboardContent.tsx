
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const DashboardContent: React.FC = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Developer!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your repositories today.</p>
        </div>
        <Button className="button-glow flex items-center gap-2">
          <GitBranch size={16} />
          Connect Repository
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Connected via GitHub</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Pull Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">Across all repositories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issues Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground mt-1">In last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.2 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">frontend-project</CardTitle>
                <CardDescription>PR #42: Add authentication flow</CardDescription>
              </div>
              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-medium">Approved</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5" />
              <div className="flex-1 text-sm">
                <p>Code meets all style guidelines</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5" />
              <div className="flex-1 text-sm">
                <p>No potential bugs detected</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Updated 2 hours ago</span>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">api-service</CardTitle>
                <CardDescription>PR #28: Implement rate limiting</CardDescription>
              </div>
              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-medium">Review</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-yellow-500 mt-0.5" />
              <div className="flex-1 text-sm">
                <p>Potential performance issue at line 127</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5" />
              <div className="flex-1 text-sm">
                <p>Security checks passed</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Updated 4 hours ago</span>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">data-processor</CardTitle>
                <CardDescription>PR #14: Optimize batch processing</CardDescription>
              </div>
              <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-medium">Issues</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5" />
              <div className="flex-1 text-sm">
                <p>Memory leak detected in worker thread</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5" />
              <div className="flex-1 text-sm">
                <p>Unhandled exception at line 245</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Updated 1 day ago</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default DashboardContent;
