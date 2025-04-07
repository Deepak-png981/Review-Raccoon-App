import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import { decryptToken } from '@/app/utils/crypto';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("Unauthorized: No user ID in session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const userId = session.user.id;
    let user = await User.findOne({ userId });
    if (!user && session.user.email) {
      console.log("User not found by userId, trying by email:", session.user.email);
      user = await User.findOne({ email: session.user.email });
    }
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        isConnected: false,
        username: null,
        tokenValid: false
      }, { status: 404 });
    }
    return processUserForGitHubStatus(user);

  } catch (error) {
    console.error('Error checking GitHub status:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

const processUserForGitHubStatus = async (user: {
  _id: string | number | object;
  githubAccount?: {
    username?: string;
    accessTokenHash?: string;
    accessTokenIV?: string;
    connected?: boolean;
    connectedAt?: Date;
  };
}) => {
  const isGitHubConnected = !!user.githubAccount &&
    typeof user.githubAccount === 'object' &&
    !!user.githubAccount.username &&
    !!user.githubAccount.accessTokenHash;

  const githubUsername = user.githubAccount?.username || null;

  if (!isGitHubConnected) {
    return NextResponse.json({
      isConnected: false,
      username: null,
      tokenValid: false
    });
  }
  let tokenValid = false;
  let tokenError = null;

  try {
    const accessToken = decryptToken(
      user.githubAccount!.accessTokenHash!,
      user.githubAccount!.accessTokenIV!
    );

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    tokenValid = response.ok;

    if (!response.ok) {
      const errorData = await response.json();
      tokenError = errorData.message || 'Unknown error from GitHub API';
      console.error('GitHub API error:', errorData);
    } else {
      // Make sure to update the connected flag if it's not already set
      if (!user.githubAccount!.connected) {
        console.log("Updating connected flag to true");
        await User.findByIdAndUpdate(
          user._id,
          { 'githubAccount.connected': true },
          { new: true }
        );
      }
    }
  } catch (error) {
    console.error('Error validating GitHub token:', error);
    tokenError = error instanceof Error ? error.message : 'Unknown error';
  }

  return NextResponse.json({
    isConnected: isGitHubConnected,
    username: githubUsername,
    tokenValid: tokenValid,
    tokenError: tokenError,
    githubData: isGitHubConnected ? {
      username: user.githubAccount!.username,
      connectedAt: user.githubAccount!.connectedAt,
      connected: user.githubAccount!.connected,
    } : null
  });
} 