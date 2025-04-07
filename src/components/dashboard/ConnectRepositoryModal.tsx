'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GitBranch, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { ConnectRepositoryModalProps } from '@/types/Repository';

export default function ConnectRepositoryModal({ trigger }: ConnectRepositoryModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleGitHubConnect = async () => {
    try {
      setIsConnecting(true);
      setOpen(false);
      window.location.href = '/api/user/github-connect';
    } catch (error) {
      console.error('GitHub connection error:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate GitHub connection',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const handleGitLabConnect = () => {
    toast({
      title: 'Coming Soon',
      description: 'GitLab integration is coming soon!',
    });
  };

  const handleBitbucketConnect = () => {
    toast({
      title: 'Coming Soon',
      description: 'Bitbucket integration is coming soon!',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="button-glow flex items-center gap-2">
            <GitBranch size={16} />
            Connect Repository
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Repository</DialogTitle>
          <DialogDescription>
            Choose a repository provider to connect with your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 p-6 h-auto"
            onClick={handleGitHubConnect}
            disabled={isConnecting}
          >
            <div className="flex-shrink-0">
              <Image
                src="/github-mark.svg"
                alt="GitHub Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">GitHub</span>
              <span className="text-xs text-muted-foreground">Connect to your GitHub repositories</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 p-6 h-auto opacity-70"
            onClick={handleGitLabConnect}
            disabled={true}
          >
            <div className="flex-shrink-0">
              <Image
                src="/gitlab-logo.svg"
                alt="GitLab Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="font-semibold">GitLab</span>
                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">Coming soon</span>
              </div>
              <span className="text-xs text-muted-foreground">Connect to your GitLab repositories</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 p-6 h-auto opacity-70"
            onClick={handleBitbucketConnect}
            disabled={true}
          >
            <div className="flex-shrink-0">
              <Image
                src="/bitbucket-logo.svg"
                alt="Bitbucket Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="font-semibold">Bitbucket</span>
                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">Coming soon</span>
              </div>
              <span className="text-xs text-muted-foreground">Connect to your Bitbucket repositories</span>
            </div>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle size={14} />
            <span>You'll be redirected to complete authentication</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 