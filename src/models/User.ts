import mongoose from 'mongoose';

interface IGithubIntegration {
  accessToken?: string;
  username?: string;
  connectedAt?: Date;
  avatarUrl?: string;
  profileUrl?: string;
  login?: string;
  userId?: string; // GitHub user ID
  email?: string;  // GitHub email, which might differ from primary email
}

export interface IUser {
  email: string;          // Primary email
  additionalEmails?: string[]; // Additional emails from connected accounts
  name: string;
  googleId?: string;      // Google ID (when user has connected Google)
  githubId?: string;      // GitHub ID (when user has connected GitHub)
  userId: string;         // Primary user ID (consistent across auth methods)
  createdAt: Date;
  avatarUrl?: string;
  preferredAuthProvider?: string; // 'google' or 'github'
  githubIntegration?: IGithubIntegration;
  organizationId?: string; // For compatibility with existing code
  lastUpdated?: Date;     // Track when the user was last updated
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    index: true,  // Index for faster lookups
  },
  additionalEmails: [{
    type: String,
  }],
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    required: false, // Explicitly marked as not required
    index: true,  // Index for faster lookups
  },
  githubId: {
    type: String,
    index: true,  // Index for faster lookups
  },
  userId: {
    type: String,
    required: true,
    unique: true,  // This should be unique across all users
    index: true,   // Index for faster lookups
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  avatarUrl: String,
  preferredAuthProvider: {
    type: String,
    enum: ['google', 'github'],
    default: 'google'
  },
  organizationId: String, // For compatibility with existing code
  githubIntegration: {
    accessToken: String,
    username: String,
    connectedAt: Date,
    avatarUrl: String,
    profileUrl: String,
    login: String,
    userId: String, // GitHub user ID
    email: String,  // GitHub email
  }
});

// Index the combination of IDs and email to prevent duplicates
userSchema.index({ googleId: 1, email: 1 });
userSchema.index({ githubId: 1, email: 1 });

// Check if models already exists to prevent recompilation in dev mode
let User: mongoose.Model<IUser>;
try {
  // Try to get the existing model
  User = mongoose.model<IUser>('User');
} catch {
  // If it doesn't exist, create a new one
  User = mongoose.model<IUser>('User', userSchema);
}

export { User }; 