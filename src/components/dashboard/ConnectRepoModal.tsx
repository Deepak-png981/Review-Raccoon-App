import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Github, GitBranch, Box, Loader2 } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useToast } from "@/components/ui/use-toast";

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const isGithubConnected = (session?.user as any)?.hasGithubConnected;

  const handleGitHubConnect = async () => {
    // If already connected, just close the modal
    if (isGithubConnected) {
      onClose();
      return;
    }
    
    if (!session?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You need to be signed in to connect your GitHub account.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      // Use a timestamp to prevent caching issues
      await signIn('github', { 
        callbackUrl: `/dashboard?timestamp=${new Date().getTime()}`,
        redirect: true
      });
      // Note: we won't reach this point with redirect: true
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
      setIsConnecting(false);
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect your GitHub account. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Repository</DialogTitle>
          <DialogDescription>
            {isGithubConnected 
              ? "Your GitHub account is connected. You can now choose repositories to analyze."
              : "Choose a platform to connect your repositories. This will allow Review Raccoon to analyze and monitor your code."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={handleGitHubConnect}
            className={`flex items-center justify-start gap-3 w-full ${isGithubConnected ? 'bg-green-600 hover:bg-green-700' : ''}`}
            variant={isGithubConnected ? "default" : "outline"}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Github className="h-5 w-5" />
            )}
            {isConnecting 
              ? "Connecting..." 
              : isGithubConnected 
                ? "GitHub Connected" 
                : "Connect with GitHub"}
          </Button>
          <Button
            disabled
            className="flex items-center justify-start gap-3 w-full"
            variant="outline"
          >
            <GitBranch className="h-5 w-5" />
            Connect with GitLab (Coming Soon)
          </Button>
          <Button
            disabled
            className="flex items-center justify-start gap-3 w-full"
            variant="outline"
          >
            <Box className="h-5 w-5" />
            Connect with Bitbucket (Coming Soon)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectRepoModal; 