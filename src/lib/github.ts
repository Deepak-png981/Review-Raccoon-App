import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import { decryptToken } from '@/app/utils/crypto';

export const getGitHubAccessToken = async (userId: string): Promise<string | null> => {
  try {
    await connectDB();
    const user = await User.findOne({ userId });
    if (!user || !user.githubAccount) {
      return null;
    }
    
    return decryptToken(
      user.githubAccount.accessTokenHash,
      user.githubAccount.accessTokenIV
    );
  } catch (error) {
    console.error('Error getting GitHub access token:', error);
    return null;
  }
}

export const hasGitHubConnection = async (userId: string): Promise<boolean> => {
  try {
    await connectDB();
    const user = await User.findOne({ userId });
    return !!user && !!user.githubAccount;
  } catch (error) {
    console.error('Error checking GitHub connection:', error);
    return false;
  }
}

export const fetchUserRepositories = async (accessToken: string) => {
  try {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    throw error;
  }
}

export async function disconnectGitHub(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const result = await User.updateOne(
      { userId },
      { $unset: { githubAccount: 1 } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error disconnecting GitHub account:', error);
    return false;
  }
} 