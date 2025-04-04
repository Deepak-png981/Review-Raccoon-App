/**
 * Migration script to update user schema
 * This migration handles fixing the schema for GitHub users
 */

import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';

/**
 * Update user records to match new schema
 * - Ensures GitHub users don't need a googleId field
 * - Adds githubId field for users with GitHub integration
 */
export async function updateUserSchema() {
  await connectDB();
  console.log('Starting user schema migration...');
  
  try {
    // 1. Find all GitHub users with placeholder googleId (starts with github_)
    const githubUsers = await User.find({
      googleId: { $regex: /^github_/ }
    });
    
    console.log(`Found ${githubUsers.length} GitHub users with placeholder googleId`);
    
    // 2. Update these users to remove googleId and set githubId
    let updatedCount = 0;
    
    for (const user of githubUsers) {
      // Extract the actual GitHub ID from the googleId placeholder
      const githubId = user.googleId?.replace('github_', '');
      
      if (githubId) {
        // Update the user with proper fields
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { githubId },
            $unset: { googleId: 1 } // Remove the placeholder googleId
          }
        );
        updatedCount++;
        console.log(`Updated user ${user.email} (ID: ${user._id}): Removed placeholder googleId, set githubId=${githubId}`);
      }
    }
    
    // 3. Find users with GitHub integration but no githubId
    const usersWithGithubIntegration = await User.find({
      'githubIntegration.userId': { $exists: true },
      githubId: { $exists: false }
    });
    
    console.log(`Found ${usersWithGithubIntegration.length} users with GitHub integration but no githubId field`);
    
    // 4. Set githubId for these users
    for (const user of usersWithGithubIntegration) {
      const githubUserId = user.githubIntegration?.userId;
      
      if (githubUserId) {
        await User.updateOne(
          { _id: user._id },
          { $set: { githubId: githubUserId } }
        );
        updatedCount++;
        console.log(`Updated user ${user.email} (ID: ${user._id}): Set githubId=${githubUserId}`);
      }
    }
    
    console.log(`Migration complete: Updated ${updatedCount} users`);
    return { updated: updatedCount };
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

export default updateUserSchema; 