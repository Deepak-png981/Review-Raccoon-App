import { Button } from "@/components/ui/button";
import { Github, Loader2 } from "lucide-react";
import { signIn, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

export default function GitHubConnectButton() {
  const { data: session, update } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Check if GitHub is connected
  useEffect(() => {
    if (session?.user) {
      setIsConnected(!!(session.user as any).hasGithubConnected);
    }
  }, [session]);

  // Handle GitHub connect button click
  const handleConnectGitHub = useCallback(async () => {
    if (isConnected) {
      toast({
        title: "Already Connected",
        description: "Your GitHub account is already connected.",
      });
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
      
      // Use signIn to connect to GitHub
      await signIn('github', { 
        callbackUrl: `/dashboard?timestamp=${new Date().getTime()}`,
        redirect: true
      });
      
      // Note: We won't reach this point if redirect is true
      // But if we change it to false in the future, this will handle refreshing the session
      await update();
      setIsConnecting(false);
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
      setIsConnecting(false);
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect your GitHub account. Please try again.",
        variant: "destructive"
      });
    }
  }, [isConnected, session?.user?.id, update, toast]);

  return (
    <Button
      onClick={handleConnectGitHub}
      variant={isConnected ? "default" : "outline"}
      className={`flex items-center gap-2 ${
        isConnected ? "bg-green-600 hover:bg-green-700" : ""
      }`}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Github size={18} />
      )}
      {isConnecting 
        ? "Connecting..." 
        : isConnected 
          ? "GitHub Connected" 
          : "Connect GitHub"}
    </Button>
  );
} 