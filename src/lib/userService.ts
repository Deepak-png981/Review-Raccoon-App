import { User, IUser } from '@/models/User';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';

/**
 * Hash a GitHub token for secure storage
 */
function hashToken(token: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(token);
  return hash.digest('hex');
}

/**
 * Find user by any identifier (userId, email, googleId, or GitHub userId)
 */
export async function findUserByAnyId(identifiers: {
  userId?: string;
  email?: string;
  googleId?: string;
  githubId?: string;
}): Promise<IUser | null> {
  await connectDB();
  
  const { userId, email, googleId, githubId } = identifiers;
  
  // Try to find the user by any of the provided identifiers
  const query: any = {};
  
  if (userId) {
    query.userId = userId;
  }
  else if (email) {
    // Check both primary email and additional emails
    query.$or = [
      { email },
      { additionalEmails: email }
    ];
  }
  else if (googleId) {
    query.googleId = googleId;
  }
  else if (githubId) {
    query['githubIntegration.userId'] = githubId;
  }
  
  // No identifiers provided
  if (Object.keys(query).length === 0) {
    return null;
  }
  
  return await User.findOne(query);
}

/**
 * Connect GitHub account to an existing user by session userId
 * This supports different emails between Google and GitHub
 */
export async function connectGithubToUser(userId: string, token: string, profile: any) {
  await connectDB();
  
  console.log(`Connecting GitHub account for user ${userId} with GitHub ID ${profile.id}`);
  
  // Check if a user with this GitHub ID already exists but with a different userId
  const existingGithubUser = await User.findOne({ 
    $or: [
      { githubId: profile.id },
      { 'githubIntegration.userId': profile.id }
    ]
  });
  
  if (existingGithubUser && existingGithubUser.userId !== userId) {
    console.error(`GitHub account ${profile.id} is already connected to user ${existingGithubUser.userId}`);
    throw new Error('This GitHub account is already connected to another user');
  }
  
  // Find user by userId (from session)
  const user = await User.findOne({ userId });
  if (!user) {
    console.error(`User not found with userId ${userId}`);
    throw new Error('User not found');
  }

  // Hash the token for secure storage
  const hashedToken = hashToken(token);
  
  // Prepare the update object
  const updates: any = {
    lastUpdated: new Date(),
    githubId: profile.id, // Set the top-level githubId field
    
    // Update GitHub integration data
    githubIntegration: {
      accessToken: hashedToken,
      username: profile?.name || user.name,
      connectedAt: new Date(),
      avatarUrl: profile?.avatar_url,
      profileUrl: profile?.html_url,
      login: profile?.login,
      userId: profile?.id?.toString(),
      email: profile?.email
    }
  };
  
  // Save the GitHub email if it differs from the primary email
  if (profile.email && profile.email !== user.email) {
    // Add to additional emails if not already there
    const additionalEmails = user.additionalEmails || [];
    if (!additionalEmails.includes(profile.email)) {
      additionalEmails.push(profile.email);
      updates.additionalEmails = additionalEmails;
    }
  }

  // Set preferred auth provider to GitHub if specified
  if (profile?.preferGithub) {
    updates.preferredAuthProvider = 'github';
    
    // Update avatar to GitHub avatar if specified
    if (profile?.avatar_url) {
      updates.avatarUrl = profile.avatar_url;
    }
  }

  // Update the user record
  await User.updateOne({ _id: user._id }, { $set: updates });
  console.log(`Successfully connected GitHub account for user ${userId}`);
  
  // Return the updated user
  const updatedUser = await User.findOne({ _id: user._id });
  if (!updatedUser) {
    throw new Error('Failed to retrieve updated user');
  }
  
  return updatedUser;
}

/**
 * Create or update a user based on authentication
 */
export async function upsertUser(userData: {
  provider: string;
  email: string;
  name: string;
  id: string;
  image?: string;
  accessToken?: string;
  profile?: any;
}): Promise<IUser> {
  await connectDB();
  
  const { provider, email, name, id, image, accessToken, profile } = userData;
  const now = new Date();
  
  let user = null;
  
  // COMPREHENSIVE USER SEARCH (by priority):
  // 1. Look for user by email (primary or additional)
  user = await User.findOne({ 
    $or: [
      { email: email },
      { additionalEmails: email }
    ] 
  });
  console.log(`Looking for user by email ${email}: ${user ? 'Found' : 'Not found'}`);
  
  // 2. If not found by email, try provider-specific ID
  if (!user) {
    if (provider === 'google') {
      user = await User.findOne({ googleId: id });
      console.log(`Looking for user by Google ID ${id}: ${user ? 'Found' : 'Not found'}`);
    } 
    else if (provider === 'github') {
      // Try both the direct githubId field and the nested one for backward compatibility
      user = await User.findOne({ 
        $or: [
          { githubId: id },
          { 'githubIntegration.userId': id }
        ]
      });
      console.log(`Looking for user by GitHub ID ${id}: ${user ? 'Found' : 'Not found'}`);
      
      // Also try by GitHub email if provided and different from login email
      if (!user && profile?.email && profile.email !== email) {
        user = await User.findOne({ 
          $or: [
            { email: profile.email },
            { additionalEmails: profile.email }
          ]
        });
        console.log(`Looking for user by GitHub email ${profile.email}: ${user ? 'Found' : 'Not found'}`);
      }
    }
  }
  
  // USER EXISTS - Update with new provider information
  if (user) {
    console.log(`Updating existing user: ${user.email} with ${provider} auth provider`);

    // Build update object
    const updates: any = {
      lastUpdated: now
    };
    
    // Only update these if provided
    if (name) updates.name = name;
    if (image) updates.avatarUrl = image;
    
    // GOOGLE LOGIN
    if (provider === 'google') {
      // Set proper Google ID field (no more placeholder prefixes)
      updates.googleId = id;
      
      // If user doesn't have a userId yet, set it
      if (!user.userId) {
        updates.userId = id;
      }
      
      // If this is a Google login but the user prefers GitHub, don't change the preference
      if (!user.preferredAuthProvider) {
        updates.preferredAuthProvider = 'google';
      }
      
      console.log(`Updated Google ID for user ${user.email}`);
    } 
    // GITHUB LOGIN OR CONNECTION
    else if (provider === 'github' && accessToken) {
      // Set proper GitHub ID field
      updates.githubId = id;
      
      // If user doesn't have a userId yet, set it
      if (!user.userId) {
        updates.userId = id;
      }
      
      // Hash the access token for secure storage
      const hashedToken = hashToken(accessToken);
      
      // Add GitHub integration data
      updates.githubIntegration = {
        accessToken: hashedToken,
        username: profile?.name || user.name,
        connectedAt: now,
        avatarUrl: profile?.avatar_url,
        profileUrl: profile?.html_url,
        login: profile?.login,
        userId: id,
        email: profile?.email
      };
      
      // Handle email from GitHub
      if (profile?.email && profile.email !== user.email) {
        const additionalEmails = user.additionalEmails || [];
        if (!additionalEmails.includes(profile.email)) {
          updates.additionalEmails = [...additionalEmails, profile.email];
        }
      }
      
      // Update preferredAuthProvider if user wants to use GitHub as primary
      if (profile?.preferGithub || !user.preferredAuthProvider) {
        updates.preferredAuthProvider = 'github';
      }
      
      console.log(`Updated GitHub integration for user ${user.email}`);
    }
    
    // Perform the update
    await User.updateOne({ _id: user._id }, { $set: updates });
    console.log(`Successfully updated user ${user.email} with ${provider} information`);
    
    // Get the updated user
    const updatedUser = await User.findOne({ _id: user._id });
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }
    
    return updatedUser;
  } 
  // USER DOES NOT EXIST - Create new user
  else {
    console.log(`Creating new user with ${provider} auth for email ${email}`);
    
    // Base user object
    const newUser: any = {
      email,
      name,
      createdAt: now,
      lastUpdated: now,
      avatarUrl: image,
      preferredAuthProvider: provider,
      additionalEmails: []
    };
    
    // Set userId and provider-specific ID fields
    if (provider === 'google') {
      newUser.googleId = id;
      newUser.userId = id;  // Use Google ID as primary userId
    } 
    // GITHUB-FIRST USER
    else if (provider === 'github') {
      // IMPORTANT: We no longer need a placeholder googleId for GitHub users
      newUser.githubId = id;  // Use proper githubId field
      newUser.userId = id;    // Use GitHub ID as primary userId
      
      // Add GitHub integration data
      if (accessToken) {
        const hashedToken = hashToken(accessToken);
        newUser.githubIntegration = {
          accessToken: hashedToken,
          username: profile?.name || name,
          connectedAt: now,
          avatarUrl: profile?.avatar_url,
          profileUrl: profile?.html_url,
          login: profile?.login,
          userId: id,
          email: profile?.email
        };
      }
    }
    
    // Create user in database
    const createdUser = await User.create(newUser);
    console.log(`Successfully created new user for ${email} with ${provider} authentication`);
    
    return createdUser;
  }
}

/**
 * Get user's GitHub token for API calls
 */
export async function getGithubToken(userId: string): Promise<string | null> {
  await connectDB();
  
  // Look for a user with this userId that also has a GitHub integration
  const user = await User.findOne({ 
    userId,
    $or: [
      // Either has a githubId (new schema)
      { githubId: { $exists: true } },
      // Or has a github access token (backward compatibility)
      { 'githubIntegration.accessToken': { $exists: true } }
    ]
  });
  
  // If no user found or no GitHub integration, return null
  if (!user || !user.githubIntegration?.accessToken) {
    return null;
  }
  
  return user.githubIntegration.accessToken;
}

/**
 * Check if a user has GitHub connected
 */
export async function hasGithubConnected(userId: string): Promise<boolean> {
  await connectDB();
  
  const user = await User.findOne({ userId });
  
  // First check the githubId field (new schema)
  if (user && user.githubId) {
    return true;
  }
  
  // Then check the githubIntegration field (backward compatibility)
  return !!(user && user.githubIntegration?.accessToken);
}

/**
 * Get GitHub repositories for a user
 */
export async function getGithubRepositories(userId: string): Promise<any[]> {
  // This is a placeholder for now - will be implemented with GitHub API calls
  return [];
}
