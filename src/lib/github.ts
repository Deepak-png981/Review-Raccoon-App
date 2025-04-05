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
    
    console.log(`GitHub lib: Decryption with key length: ${key.length} bytes`);
    
    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
    
    let decrypted = decipher.update(hash, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('GitHub lib: Decryption error:', error);
    throw error;
  }
}

// Function to get a user's GitHub access token
export async function getGitHubAccessToken(userId: string): Promise<string | null> {
  try {
    await connectDB();
    
    const user = await User.findOne({ userId });
    if (!user || !user.githubAccount) {
      return null;
    }
    
    // Use our direct decryption instead of the User model
    return decryptToken(
      user.githubAccount.accessTokenHash,
      user.githubAccount.accessTokenIV
    );
  } catch (error) {
    console.error('Error getting GitHub access token:', error);
    return null;
  }
}

// Function to check if a user has connected their GitHub account
export async function hasGitHubConnection(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const user = await User.findOne({ userId });
    return !!user && !!user.githubAccount;
  } catch (error) {
    console.error('Error checking GitHub connection:', error);
    return false;
  }
}

// Function to fetch user's repositories
export async function fetchUserRepositories(accessToken: string) {
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

// Function to disconnect GitHub account
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