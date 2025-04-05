import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';

export async function POST(req: NextRequest) {
  console.log("GitHub disconnect API called");
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    console.log("Session in github-disconnect:", session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find user by ID
    const userId = session.user.id;
    console.log("Disconnecting GitHub for user with userId:", userId);
    
    // First try to find by userId
    let user = await User.findOne({ userId });
    
    // If user not found by userId, try by email
    if (!user && session.user.email) {
      console.log("User not found by userId, trying by email:", session.user.email);
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user) {
      console.error("User not found for GitHub disconnect");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove GitHub account data
    const result = await User.findByIdAndUpdate(
      user._id,
      { $unset: { githubAccount: 1 } },
      { new: true }
    );
    
    if (result) {
      console.log("GitHub account disconnected successfully for user:", userId);
      return NextResponse.json({ 
        success: true,
        message: 'GitHub account disconnected successfully' 
      });
    } else {
      console.error("Failed to disconnect GitHub account");
      return NextResponse.json({ 
        error: 'Failed to disconnect GitHub account' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error disconnecting GitHub account:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 