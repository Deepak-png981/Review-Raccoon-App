import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import * as github from '@/lib/github';

export async function GET(req: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Check if GitHub is connected
    const isConnected = await github.isGithubConnected(session.user.id);
    
    if (!isConnected) {
      return NextResponse.json(
        { error: 'GitHub account not connected' }, 
        { status: 400 }
      );
    }
    
    // Fetch repositories
    const repositories = await github.fetchUserRepositories(session.user.id);
    
    return NextResponse.json({
      repositories,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch repositories', message: (error as Error).message }, 
      { status: 500 }
    );
  }
} 