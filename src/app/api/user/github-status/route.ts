import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import crypto from 'crypto';

// Helper function to get consistent key for encryption
function getDerivedEncryptionKey(secret: string): Buffer {
  // Use SHA-256 to get a consistent 32-byte key from any secret
  return crypto.createHash('sha256').update(secret).digest();
}

// Direct token decryption function
function decryptToken(hash: string, iv: string) {
  try {
    if (!hash || !iv) {
      console.error('Cannot decrypt without hash and IV');
      throw new Error('Hash and IV are required for decryption');
    }
    
    const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret';
    const key = getDerivedEncryptionKey(secret);
    
    console.log(`Direct decryption with key length: ${key.length} bytes`);
    
    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
    
    let decrypted = decipher.update(hash, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Direct decryption error:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  console.log("GitHub status API called");
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    console.log("Session in github-status:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("Unauthorized: No user ID in session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find the user by user ID
    const userId = session.user.id;
    console.log("Looking for user with userId:", userId);
    
    // First try by userId
    let user = await User.findOne({ userId });
    
    if (!user && session.user.email) {
      console.log("User not found by userId, trying by email:", session.user.email);
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user) {
      console.log("User not found, dumping session data for debugging:", 
        JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        }));
      
      return NextResponse.json({ 
        error: 'User not found',
        isConnected: false,
        username: null,
        tokenValid: false
      }, { status: 404 });
    }

    console.log("User found:", user.userId);
    return processUserForGitHubStatus(user);
    
  } catch (error) {
    console.error('Error checking GitHub status:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to process user and check GitHub status
async function processUserForGitHubStatus(user: any) {
  // Dump the user's githubAccount data for debugging
  console.log("User githubAccount data:", JSON.stringify(user.githubAccount || null, null, 2));
  
  // Check GitHub connection - more robust check
  const isGitHubConnected = !!user.githubAccount && 
                         typeof user.githubAccount === 'object' &&
                         !!user.githubAccount.username &&
                         !!user.githubAccount.accessTokenHash;
                         
  const githubUsername = user.githubAccount?.username || null;
  
  console.log("GitHub connected status check:", {
    hasGithubAccount: !!user.githubAccount,
    hasUsername: !!user.githubAccount?.username,
    hasToken: !!user.githubAccount?.accessTokenHash,
    connectedFlag: !!user.githubAccount?.connected,
    finalResult: isGitHubConnected
  });
  
  console.log("GitHub username:", githubUsername);

  // If GitHub is not connected, return early
  if (!isGitHubConnected) {
    return NextResponse.json({ 
      isConnected: false,
      username: null,
      tokenValid: false
    });
  }

  // If GitHub is connected, try to validate the token
  let tokenValid = false;
  let tokenError = null;
  
  try {
    // Use our direct decryption function instead of the User model method
    const accessToken = decryptToken(
      user.githubAccount.accessTokenHash,
      user.githubAccount.accessTokenIV
    );
    
    // Make a simple API call to validate the token
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
      console.log("GitHub token is valid");
      
      // Make sure to update the connected flag if it's not already set
      if (!user.githubAccount.connected) {
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
      username: user.githubAccount.username,
      connectedAt: user.githubAccount.connectedAt,
      connected: user.githubAccount.connected,
    } : null
  });
} 