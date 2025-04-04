import type { NextAuthOptions } from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import * as userService from '@/lib/userService';
import crypto from 'crypto';

// For debugging, log that this file is being loaded
console.log('Loading auth options with userService:', !!userService);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          provider: 'google'
        };
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo repo:status repo_deployment'
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          provider: 'github'
        };
      }
    })
  ],
  callbacks: {
    // Handle JWT token creation
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.organizationId = (user as any).organizationId;
        // Add provider to token
        if (account) {
          token.provider = account.provider;
        }
      }
      return token;
    },
    
    // Handle session data
    async session({ session, token }) {
      // Start with basic user data
      if (session?.user) {
        // Add user ID from token
        session.user.id = token.id as string || token.sub || '';
        
        // Add organization ID if it exists
        if (token.organizationId) {
          session.user.organizationId = token.organizationId as string;
        }
        
        // Add provider information
        if (token.provider) {
          session.user.provider = token.provider as 'google' | 'github';
        }
        
        try {
          // Connect to database
          await connectDB();
          
          // Get user data directly
          const userId = session.user.id;
          const dbUser = await User.findOne({ userId });
          
          // If user exists, add avatar URL
          if (dbUser) {
            // Set avatar based on preferred provider
            if (dbUser.preferredAuthProvider === 'github' && dbUser.githubIntegration?.avatarUrl) {
              session.user.image = dbUser.githubIntegration.avatarUrl;
            } else if (dbUser.avatarUrl) {
              session.user.image = dbUser.avatarUrl;
            }
            
            // Check GitHub connection using the userService directly
            try {
              console.log('Checking GitHub connection for user:', userId);
              // Use the new userService and not model methods
              const isConnected = await userService.hasGithubConnected(userId);
              console.log('GitHub connection status:', isConnected);
              session.user.hasGithubConnected = isConnected;
            } catch (ghError) {
              console.error('Error checking GitHub connection:', ghError);
              session.user.hasGithubConnected = false;
            }
          }
        } catch (error) {
          console.error('Error enriching session:', error);
        }
      }
      
      return session;
    },
    
    // Handle sign in - updated to use the improved userService
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        await connectDB();
        
        // Use the new upsertUser function to handle user creation/update
        if (account?.provider && profile) {
          const userData = await userService.upsertUser({
            provider: account.provider,
            email: user.email,
            name: user.name || '',
            id: account.providerAccountId || user.id || '',
            image: user.image || '',
            accessToken: account.access_token,
            profile: profile
          });
          
          // Set user ID to ensure consistency across the auth flow
          user.id = userData.userId;
          
          // Set organizationId for compatibility with existing code
          if (userData.organizationId) {
            (user as any).organizationId = userData.organizationId;
          }
          
          console.log(`User ${userData.userId} authenticated with ${account.provider}`);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}; 