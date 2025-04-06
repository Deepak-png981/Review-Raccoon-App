import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import crypto from 'crypto';

// Direct token decryption function
function decryptToken(hash: string, iv: string) {
  try {
    if (!hash || !iv) {
      console.error('Cannot decrypt without hash and IV');
      throw new Error('Hash and IV are required for decryption');
    }
    
    // Ensure we have a proper length key using SHA-256
    const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret';
    const key = crypto.createHash('sha256').update(secret).digest();
    
    console.log(`Repository API: Decryption with key length: ${key.length} bytes`);
    
    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
    
    let decrypted = decipher.update(hash, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Repository API: Decryption error:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  console.log("GitHub repositories API called");
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    console.log("Session in github-repositories:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("Unauthorized: No user ID in session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pagination parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '10');
    
    // Validate pagination parameters
    const validPage = page > 0 ? page : 1;
    const validPerPage = perPage > 0 && perPage <= 100 ? perPage : 10;
    
    console.log(`Pagination: page=${validPage}, perPage=${validPerPage}`);

    // Connect to database
    await connectDB();

    // Find the user by user ID
    const userId = session.user.id;
    console.log("Looking for user with userId:", userId);
    
    let user = await User.findOne({ userId });
    
    if (!user && session.user.email) {
      console.log("User not found by userId, trying by email:", session.user.email);
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user) {
      console.error("User not found");
      return NextResponse.json({ 
        error: 'User not found',
        repositories: []
      }, { status: 404 });
    }

    // Check if user has GitHub connected
    if (!user.githubAccount || !user.githubAccount.accessTokenHash || !user.githubAccount.accessTokenIV) {
      console.log("User has no GitHub account connected");
      return NextResponse.json({ 
        error: 'GitHub account not connected',
        repositories: []
      }, { status: 400 });
    }

    // Decrypt the access token
    const accessToken = decryptToken(
      user.githubAccount.accessTokenHash,
      user.githubAccount.accessTokenIV
    );

    // Fetch repositories from GitHub API with pagination
    console.log("Fetching repositories from GitHub API");
    const response = await fetch(`https://api.github.com/user/repos?sort=updated&page=${validPage}&per_page=${validPerPage}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to fetch repositories',
        message: errorData.message || 'Unknown error from GitHub API',
        repositories: []
      }, { status: response.status });
    }

    const repositories = await response.json();
    console.log(`Fetched ${repositories.length} repositories from GitHub`);

    // Get total repository count for pagination
    // Unfortunately GitHub API doesn't return a total count in the repositories response
    // We'll make an additional request to get the user data which includes the total repo count
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let totalRepos = 0;
    if (userResponse.ok) {
      const userData = await userResponse.json();
      totalRepos = userData.public_repos + (userData.total_private_repos || 0);
      console.log(`Total repositories: ${totalRepos}`);
    }

    // Format repositories for the client
    const formattedRepos = repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || 'No description provided',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || 'Unknown',
      updatedAt: new Date(repo.updated_at).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }),
      url: repo.html_url,
      private: repo.private,
      owner: repo.owner.login
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRepos / validPerPage);
    const hasNextPage = validPage < totalPages;
    const hasPreviousPage = validPage > 1;

    return NextResponse.json({ 
      repositories: formattedRepos,
      pagination: {
        currentPage: validPage,
        perPage: validPerPage,
        totalItems: totalRepos,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
    
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      repositories: []
    }, { status: 500 });
  }
} 