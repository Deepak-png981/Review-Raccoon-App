import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import crypto from 'crypto';
import { getDerivedEncryptionKey } from '@/app/utils/crypto';

export async function GET(req: NextRequest) {
  console.log("GitHub callback API called");
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const user_id = url.searchParams.get('user_id');
    const cookieState = req.cookies.get('github_oauth_state')?.value;
    
    if (!state || !cookieState || state !== cookieState) {
      console.error('State validation failed:', { state, cookieState });
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=state_mismatch`);
    }
    
    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_code`);
    }
    
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
    
    await connectDB();
    
    // Determine user ID to update
    let userId = user_id;
    
    if (!userId && githubUser.email) {
      const userByEmail = await User.findOne({ email: githubUser.email });
      
      if (userByEmail) {
        userId = userByEmail.userId;
      }
    }
    
    if (!userId) {
      console.error('No user ID found to connect GitHub account');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_user`);
    }
    
    const encryptionKey = getDerivedEncryptionKey(process.env.NEXTAUTH_SECRET || 'fallback_secret');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encryptedToken = cipher.update(tokenData.access_token, 'utf8', 'hex');
    encryptedToken += cipher.final('hex');
    
    const githubAccount = {
      username: githubUser.login,
      accessTokenHash: encryptedToken,
      accessTokenIV: iv.toString('hex'),
      email: githubUser.email,
      connectedAt: new Date(),
      connected: true,
    };
    let updated = false;
    
    const userByUserId = await User.findOne({ userId });
    
    if (userByUserId) {
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