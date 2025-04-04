import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import * as userService from '@/lib/userService';

export async function GET(req: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user has GitHub connected using the user service
    const isConnected = await userService.hasGithubConnected(session.user.id);
    
    return NextResponse.json({
      isConnected,
      provider: (session.user as any).provider || 'unknown',
    });
  } catch (error) {
    console.error('GitHub status check error:', error);
    return NextResponse.json({ error: 'Failed to check GitHub status' }, { status: 500 });
  }
} 