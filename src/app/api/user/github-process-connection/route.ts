import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import crypto from 'crypto';

// Helper function to get consistent key for encryption
function getDerivedEncryptionKey(secret: string): Buffer {
  // Use SHA-256 to get a consistent 32-byte key from any secret
  return crypto.createHash('sha256').update(secret).digest();
}

// Direct token encryption function
function encryptToken(token: string) {
  try {
    const iv = crypto.randomBytes(16);
    const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret';
    const key = getDerivedEncryptionKey(secret);
    
    console.log(`Direct encryption with key length: ${key.length} bytes`);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      accessTokenHash: encrypted,
      accessTokenIV: iv.toString('hex')
    };
  } catch (error) {
    console.error('Direct encryption error:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  console.log("GitHub process connection API called");
  try {
    // Get query parameters
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const userId = url.searchParams.get('userId');
    
    console.log("Processing GitHub connection for:", { code: code?.substring(0, 5) + '...', userId });
    
    if (!code) {
      console.error('No code provided for GitHub connection processing');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_code`);
    }
    
    if (!userId) {
      console.error('No userId provided for GitHub connection processing');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=no_user_id`);
    }
    
    // Exchange code for access token using GitHub's OAuth API
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
    
    console.log('GitHub access token obtained successfully');
    
    // Check if we have a refresh token in the response
    const refreshToken = tokenData.refresh_token;
    if (refreshToken) {
      console.log('GitHub refresh token also obtained');
    }
    
    // Get user details from GitHub API
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
    
    // Fetch the user's emails since they are not included in the main user profile API
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let primaryEmail = null;
    
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      console.log('GitHub user emails:', JSON.stringify(emails, null, 2));
      
      // Find the primary email
      const primary = emails.find((email: any) => email.primary === true);
      if (primary) {
        primaryEmail = primary.email;
        console.log('Found primary email:', primaryEmail);
      } else if (emails.length > 0) {
        primaryEmail = emails[0].email;
        console.log('Using first email as primary:', primaryEmail);
      }
    } else {
      console.error('Error fetching GitHub user emails');
    }
    
    // Connect to database
    await connectDB();
    
    // Find the user by ID
    console.log('Looking for user in database with userId:', userId);
    let user = await User.findOne({ userId });
    
    // If we found a user, update the user with GitHub information
    if (user) {
      try {
        console.log('Found user in DB, updating with GitHub information');
        
        // Encrypt the access token
        const { accessTokenHash, accessTokenIV } = encryptToken(tokenData.access_token);
        
        // Default to the email from user profile or use user's existing email
        const githubEmail = primaryEmail || githubUserData.email || user.email || null;
        console.log('Final GitHub email to use:', githubEmail);

        // Handle refresh token if present
        let refreshTokenData = {};
        if (refreshToken) {
          const encryptedRefreshToken = encryptToken(refreshToken);
          refreshTokenData = {
            refreshTokenHash: encryptedRefreshToken.accessTokenHash,
            refreshTokenIV: encryptedRefreshToken.accessTokenIV
          };
          console.log('Refresh token encrypted successfully');
        }

        // Create GitHub account data to save
        const githubAccount = {
          username: githubUserData.login,
          email: githubEmail, // Use the primary email if available
          accessTokenHash,
          accessTokenIV,
          ...(refreshToken ? refreshTokenData : {}), // Include refresh token data if present
          connectedAt: new Date(),
          connected: true, // Explicitly set to true
        };

        console.log('Saving GitHub account data:', {
          username: githubUserData.login,
          email: githubEmail,
          hasAccessToken: !!accessTokenHash,
          connected: true
        });

        // Update the user with GitHub information
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { githubAccount },
          { new: true }
        );

        console.log('User updated with GitHub info:', updatedUser ? 'success' : 'failed', 
                    'ID:', updatedUser?._id, 
                    'Username:', updatedUser?.githubAccount?.username,
                    'Email:', updatedUser?.githubAccount?.email);
        
        console.log('✅ GITHUB CONNECTION SUCCESSFUL - Redirecting to dashboard');
        
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?github_success=true`);
      } catch (error) {
        console.error('Error updating user with GitHub info:', error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=github_update_failed`);
      }
    }
    
    if (!user) {
      console.error('User not found in database after all lookup attempts');
      
      // Last resort: create a dummy user record for debugging
      const dummyUser = {
        userId: 'DEBUG_NOT_FOUND',
        email: primaryEmail || githubUserData.email || 'unknown',
        name: githubUserData.name || githubUserData.login,
        createdAt: new Date()
      };
      console.log('Would have created user:', dummyUser);
      
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=user_not_found`);
    }
  } catch (error) {
    console.error('Error processing GitHub connection:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/repositories?error=server_error`);
  }
} 