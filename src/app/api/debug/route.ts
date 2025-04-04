import { NextRequest, NextResponse } from 'next/server';
import * as userService from '@/lib/userService';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    // Get userId from query string
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'No userId provided' }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    // Test each method
    const methods = {
      // Get user directly from database
      getUserFromDb: async () => {
        const user = await User.findOne({ userId });
        return {
          found: !!user,
          email: user?.email,
          hasGithubIntegration: !!(user?.githubIntegration?.accessToken),
        };
      },
      
      // Test userService.hasGithubConnected
      hasGithubConnectedTest: async () => {
        try {
          const result = await userService.hasGithubConnected(userId);
          return {
            success: true,
            result
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message
          };
        }
      },
      
      // Test userService.getGithubToken
      getGithubTokenTest: async () => {
        try {
          const result = await userService.getGithubToken(userId);
          return {
            success: true,
            hasToken: !!result,
            // Don't return actual token for security
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message
          };
        }
      }
    };
    
    // Run all tests
    const results = {
      userServiceExists: !!userService,
      userServiceMethods: Object.keys(userService),
      getUserFromDb: await methods.getUserFromDb(),
      hasGithubConnectedTest: await methods.hasGithubConnectedTest(),
      getGithubTokenTest: await methods.getGithubTokenTest(),
    };
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Error in debug endpoint',
      message: (error as Error).message,
      stack: (error as Error).stack,
    }, { status: 500 });
  }
} 