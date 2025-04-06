import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import { encryptToken } from '@/app/utils/crypto';


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const userId = url.searchParams.get('userId');
    
    if (!code) {
      console.error('No code provided for GitHub connection processing');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_code`);
    }
    
    if (!userId) {
      console.error('No userId provided for GitHub connection processing');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_user_id`);
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
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`
      })
    });
    
    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text());
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=token_exchange_failed`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_access_token`);
    }

    const refreshToken = tokenData.refresh_token;
    if (refreshToken) {
      console.log('GitHub refresh token also obtained');
    }
    
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!userResponse.ok) {
      console.error('Failed to fetch GitHub user data:', await userResponse.text());
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=github_api_error`);
    }
    
    const githubUserData = await userResponse.json();
    
    if (!githubUserData.login) {
      console.error('Invalid GitHub user data:', githubUserData);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=invalid_github_user`);
    }
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let primaryEmail = null;
    
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      
      const primary = emails.find((email: any) => email.primary === true);
      if (primary) {
        primaryEmail = primary.email;
      } else if (emails.length > 0) {
        primaryEmail = emails[0].email;
      }
    } else {
      console.error('Error fetching GitHub user emails');
    }
    
    await connectDB();
    
    let user = await User.findOne({ userId });

    if (user) {
      try {
        const { accessTokenHash, accessTokenIV } = encryptToken(tokenData.access_token);
        
        const githubEmail = primaryEmail || githubUserData.email || user.email || null;

        let refreshTokenData = {};
        if (refreshToken) {
          const encryptedRefreshToken = encryptToken(refreshToken);
          refreshTokenData = {
            refreshTokenHash: encryptedRefreshToken.accessTokenHash,
            refreshTokenIV: encryptedRefreshToken.accessTokenIV
          };
          console.log('Refresh token encrypted successfully');
        }

        const githubAccount = {
          username: githubUserData.login,
          email: githubEmail,
          accessTokenHash,
          accessTokenIV,
          ...(refreshToken ? refreshTokenData : {}),
          connectedAt: new Date(),
          connected: true,
        };

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { githubAccount },
          { new: true }
        );

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?github_success=true`);
      } catch (error) {
        console.error('Error updating user with GitHub info:', error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=github_update_failed`);
      }
    }
    
    if (!user) {
      console.error('User not found in database after all lookup attempts');
      
      const dummyUser = {
        userId: 'DEBUG_NOT_FOUND',
        email: primaryEmail || githubUserData.email || 'unknown',
        name: githubUserData.name || githubUserData.login,
        createdAt: new Date()
      };
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=user_not_found`);
    }
  } catch (error) {
    console.error('Error processing GitHub connection:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=server_error`);
  }
} 