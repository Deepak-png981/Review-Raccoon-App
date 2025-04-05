import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import crypto from 'crypto';

// Helper function to get consistent key for encryption
function getDerivedEncryptionKey(secret: string): Buffer {
  // Use SHA-256 to get a consistent 32-byte key from any secret
  return crypto.createHash('sha256').update(secret).digest();
}

export async function GET(req: NextRequest) {
  console.log("GitHub callback API called");
  try {
    // Get query parameters
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const user_id = url.searchParams.get('user_id'); // Get user ID from URL
    
    // Get state from cookie
    const cookieState = req.cookies.get('github_oauth_state')?.value;
    
    // Validate state to prevent CSRF
    if (!state || !cookieState || state !== cookieState) {
      console.error('State validation failed:', { state, cookieState });
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=state_mismatch`);
    }
    
    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_code`);
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_ID,
        client_secret: process.env.GITHUB_SECRET,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/user/github-callback`
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get access token:', tokenData);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=token_error`);
    }
    
    // Get user details from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const githubUser = await userResponse.json();
    
    if (!githubUser.login) {
      console.error('Failed to get GitHub user data:', githubUser);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=user_data_error`);
    }
    
    // Connect to database
    await connectDB();
    
    // Determine user ID to update
    let userId = user_id;
    
    // If we don't have a user ID from the URL params, try to find the user by GitHub email
    if (!userId && githubUser.email) {
      console.log('Looking for user by GitHub email:', githubUser.email);
      const userByEmail = await User.findOne({ email: githubUser.email });
      
      if (userByEmail) {
        userId = userByEmail.userId;
        console.log('Found user by GitHub email:', userId);
      }
    }
    
    if (!userId) {
      console.error('No user ID found to connect GitHub account');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_user`);
    }
    
    // Encrypt the access token
    const encryptionKey = getDerivedEncryptionKey(process.env.NEXTAUTH_SECRET || 'fallback_secret');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encryptedToken = cipher.update(tokenData.access_token, 'utf8', 'hex');
    encryptedToken += cipher.final('hex');
    
    // Create GitHub account data
    const githubAccount = {
      username: githubUser.login,
      accessTokenHash: encryptedToken,
      accessTokenIV: iv.toString('hex'),
      email: githubUser.email,
      connectedAt: new Date(),
      connected: true,
    };
    
    console.log('GitHub account data to save:', {
      username: githubUser.login,
      email: githubUser.email,
      userId: userId
    });
    
    // Update user with GitHub info - first try by userId
    let updated = false;
    
    const userByUserId = await User.findOne({ userId });
    
    if (userByUserId) {
      console.log('Updating user with GitHub account, userId:', userId);
      
      const updatedUser = await User.findByIdAndUpdate(
        userByUserId._id,
        { githubAccount },
        { new: true }
      );
      
      if (updatedUser) {
        console.log('GitHub account connected successfully for user:', userId);
        updated = true;
      }
    }
    
    if (!updated) {
      console.error('Failed to update user with GitHub account');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=update_failed`);
    }
    
    // Clear the state cookie and redirect back to repositories page
    const cookieExpiryDate = new Date(0);
    
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?github_connected=true`, {
      headers: {
        'Set-Cookie': `github_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${cookieExpiryDate.toUTCString()}`
      }
    });
    
  } catch (error) {
    console.error('Error handling GitHub callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/repositories?error=server_error`
    );
  }
} 