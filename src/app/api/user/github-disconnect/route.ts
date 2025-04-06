import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const userId = session.user.id;
    let user = await User.findOne({ userId });
    
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user) {
      console.error("User not found for GitHub disconnect");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await User.findByIdAndUpdate(
      user._id,
      { $unset: { githubAccount: 1 } },
      { new: true }
    );
    
    if (result) {
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