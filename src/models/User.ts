import mongoose from 'mongoose';
import crypto from 'crypto';

// Helper function to get consistent key for encryption
function getDerivedEncryptionKey(secret: string): Buffer {
  // Use SHA-256 to get a consistent 32-byte key from any secret
  return crypto.createHash('sha256').update(secret).digest();
}

// Interface for GitHub account info
interface IGithubAccount {
  username: string;
  email?: string;
  accessTokenHash: string;
  accessTokenIV: string;
  refreshTokenHash?: string;
  refreshTokenIV?: string;
  connectedAt: Date;
  connected: boolean;
}

const githubAccountSchema = new mongoose.Schema<IGithubAccount>({
  username: {
    type: String,
    required: true,
  },
  email: String,
  accessTokenHash: {
    type: String,
    required: true,
  },
  accessTokenIV: {
    type: String,
    required: true,
  },
  refreshTokenHash: String,
  refreshTokenIV: String,
  connectedAt: {
    type: Date,
    default: Date.now,
  },
  connected: {
    type: Boolean,
    default: true,
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add GitHub account integration
  githubAccount: githubAccountSchema,
  // Add fields for GitLab and Bitbucket for future integrations
  gitlabAccount: {
    type: Object,
    default: null,
  },
  bitbucketAccount: {
    type: Object,
    default: null,
  },
});

// Helper methods for token encryption/decryption
userSchema.statics.encryptToken = function(token: string) {
  try {
    if (!token) {
      console.error('Cannot encrypt empty token');
      throw new Error('Token is required for encryption');
    }
    
    const iv = crypto.randomBytes(16); // 16 bytes for AES
    
    // Ensure we have a proper length key (32 bytes for AES-256-CBC)
    const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret';
    const encryptionKey = crypto.createHash('sha256').update(secret).digest();
    
    // Log key details for debugging (without revealing the key)
    console.log(`User model: Encryption key length: ${encryptionKey.length} bytes`);
    
    // Use AES-256-CBC which requires a 32-byte key
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      hash: encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('Error encrypting token:', error);
    throw error;
  }
};

userSchema.statics.decryptToken = function(hash: string, iv: string) {
  try {
    if (!hash || !iv) {
      console.error('Cannot decrypt without hash and IV');
      throw new Error('Hash and IV are required for decryption');
    }
    
    // Ensure we have a proper length key (32 bytes for AES-256-CBC)
    const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret';
    const encryptionKey = crypto.createHash('sha256').update(secret).digest();
    
    // Log key details for debugging
    console.log(`User model: Decryption key length: ${encryptionKey.length} bytes`);
    
    // Convert hex IV back to Buffer
    const ivBuffer = Buffer.from(iv, 'hex');
    
    // Create decipher with the same algorithm and key
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, ivBuffer);
    
    // Decrypt the token
    let decrypted = decipher.update(hash, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting token:', error);
    throw error;
  }
};

export const User = mongoose.models.User || mongoose.model('User', userSchema); 