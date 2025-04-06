import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { GithubStatus } from '@/types/Repository';


export const useGithubConnection = () => {
  const router = useRouter();
  const [isCheckingGithub, setIsCheckingGithub] = useState(false);
  const [isDisconnectingGithub, setIsDisconnectingGithub] = useState(false);
  const [githubStatus, setGithubStatus] = useState<GithubStatus | null>(null);

  const checkGithubConnection = useCallback(async () => {
    setIsCheckingGithub(true);
    try {
      const res = await fetch('/api/user/github-status');
      if (!res.ok) {
        throw new Error('Failed to check GitHub connection');
      }
      
      const data = await res.json();
      setGithubStatus(data);
      
      if (data.isConnected && data.tokenValid) {
        toast({
          title: 'GitHub Connected',
          description: `Successfully connected to GitHub as ${data.username}`,
          variant: 'default',
        });
      } else if (data.isConnected && !data.tokenValid) {
        toast({
          title: 'GitHub Token Invalid',
          description: `Your GitHub connection exists but the token is invalid (${data.tokenError || 'Unknown error'}). Please reconnect.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Not Connected',
          description: 'You are not connected to GitHub. Please connect to access your repositories.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to check GitHub connection status',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingGithub(false);
    }
  }, []);

  const handleReconnectGitHub = useCallback(() => {
    window.location.href = '/api/user/github-connect';
  }, []);

  const handleDisconnectGitHub = useCallback(async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account? This will remove access to your repositories.')) {
      return;
    }
    
    setIsDisconnectingGithub(true);
    try {
      const res = await fetch('/api/user/github-disconnect', {
        method: 'POST',
      });
      
      if (!res.ok) {
        throw new Error('Failed to disconnect GitHub account');
      }
      
      setGithubStatus(prev => ({
        ...prev!,
        isConnected: false,
        tokenValid: false,
        username: null,
        githubData: null,
      }));
      
      toast({
        title: 'GitHub Disconnected',
        description: 'Your GitHub account has been successfully disconnected.',
        variant: 'default',
      });
      
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect GitHub account',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnectingGithub(false);
    }
  }, [router]);

  return {
    githubStatus,
    isCheckingGithub,
    isDisconnectingGithub,
    checkGithubConnection,
    handleReconnectGitHub,
    handleDisconnectGitHub,
  };
}; 