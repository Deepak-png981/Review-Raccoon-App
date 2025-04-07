import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error("No authenticated user found for GitHub connect");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
      console.error("Missing GitHub app configuration - check GITHUB_ID and GITHUB_SECRET env vars");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
  
    if (!process.env.NEXTAUTH_URL) {
      console.error("Missing NEXTAUTH_URL environment variable");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const state = crypto.randomBytes(16).toString('hex');
    
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/github`;
    
    console.log("GitHub OAuth flow initiated with:");
    console.log("- Client ID:", process.env.GITHUB_ID);
    console.log("- Callback URL:", callbackUrl);
    console.log("- User ID:", session.user.id);
    
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.append('client_id', process.env.GITHUB_ID);
    githubAuthUrl.searchParams.append('redirect_uri', callbackUrl);
    githubAuthUrl.searchParams.append('scope', 'read:user user:email repo workflow');
    githubAuthUrl.searchParams.append('state', state);
    
    const userIdCookieValue = JSON.stringify({
      state: state,
      userId: session.user.id
    });
    
    console.log("Full GitHub authorization URL:", githubAuthUrl.toString());
    
    const cookieExpiryDate = new Date();
    cookieExpiryDate.setTime(cookieExpiryDate.getTime() + 10 * 60 * 1000);
    
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