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

// Start GitHub OAuth flow
export async function GET(req: NextRequest) {
  console.log("GitHub connect API called");
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    console.log("Session in github-connect:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.error("No authenticated user found for GitHub connect");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Validate the GitHub app configuration
    if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
      console.error("Missing GitHub app configuration - check GITHUB_ID and GITHUB_SECRET env vars");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Make sure we have the NEXTAUTH_URL for callbacks
    if (!process.env.NEXTAUTH_URL) {
      console.error("Missing NEXTAUTH_URL environment variable");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Generate a random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // IMPORTANT: Use the exact same callback URL that's registered in GitHub OAuth app settings
    // This should match the "Authorization callback URL" in your GitHub OAuth app
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/github`;
    
    console.log("GitHub OAuth flow initiated with:");
    console.log("- Client ID:", process.env.GITHUB_ID);
    console.log("- Callback URL:", callbackUrl);
    console.log("- User ID:", session.user.id);
    
    // Create the GitHub authorization URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.append('client_id', process.env.GITHUB_ID);
    githubAuthUrl.searchParams.append('redirect_uri', callbackUrl);
    githubAuthUrl.searchParams.append('scope', 'read:user user:email repo');
    githubAuthUrl.searchParams.append('state', state);
    
    // Store the user ID in the state cookie so we can retrieve it in the callback
    const userIdCookieValue = JSON.stringify({
      state: state,
      userId: session.user.id
    });
    
    console.log("Full GitHub authorization URL:", githubAuthUrl.toString());
    
    // Store state and user ID in a secure HTTP-only cookie
    const cookieExpiryDate = new Date();
    cookieExpiryDate.setTime(cookieExpiryDate.getTime() + 10 * 60 * 1000); // 10 minutes
    
    return NextResponse.redirect(githubAuthUrl.toString(), {
      headers: {
        'Set-Cookie': `github_oauth_data=${userIdCookieValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${cookieExpiryDate.toUTCString()}`
      }
    });
  } catch (error) {
    console.error('Error starting GitHub OAuth flow:', error);
    return NextResponse.json({ 
      error: 'Failed to start GitHub connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 