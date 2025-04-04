/**
 * Migration script to merge duplicate user accounts
 * This should be run once after updating the schema
 */

import { User, IUser } from '@/models/User';
import { connectDB } from '@/lib/mongodb';

/**
 * Merge users with the same email but different auth providers
 */
export async function mergeUsersByEmail() {
  await connectDB();
  console.log('Starting user migration: Merging duplicate accounts by email');

  // Get all users
  const allUsers = await User.find({});
  console.log(`Found ${allUsers.length} total users`);

  // Group users by email
  const usersByEmail = new Map<string, IUser[]>();
  
  // Group all users by their primary email
  allUsers.forEach(user => {
    if (!user.email) return;
    
    if (!usersByEmail.has(user.email)) {
      usersByEmail.set(user.email, []);
    }
    usersByEmail.get(user.email)?.push(user);
  });
  
  // Also consider additional emails
  allUsers.forEach(user => {
    if (!user.additionalEmails?.length) return;
    
    user.additionalEmails.forEach(email => {
      // Check if any other user has this as their primary email
      if (!usersByEmail.has(email)) {
        usersByEmail.set(email, []);
      }
      
      // Add this user to the email group if not already there
      const existingUsers = usersByEmail.get(email) || [];
      if (!existingUsers.some(u => u._id.toString() === user._id.toString())) {
        existingUsers.push(user);
        usersByEmail.set(email, existingUsers);
      }
    });
  });
  
  // Find emails with multiple users
  let mergeCount = 0;
  
  for (const [email, users] of usersByEmail.entries()) {
    if (users.length <= 1) continue;
    
    console.log(`Found ${users.length} users with email ${email}`);
    
    // Sort users by creation date (oldest first)
    users.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // The first (oldest) user is the primary one
    const primaryUser = users[0];
    const duplicateUsers = users.slice(1);
    
    console.log(`Primary user: ${primaryUser._id} (${primaryUser.preferredAuthProvider || 'unknown'})`);
    
    // Merge info from duplicate users into the primary user
    const updates: any = {};
    
    for (const dupUser of duplicateUsers) {
      console.log(`Merging duplicate user: ${dupUser._id} (${dupUser.preferredAuthProvider || 'unknown'})`);
      
      // Collect all emails
      const emails = new Set<string>(primaryUser.additionalEmails || []);
      if (dupUser.email !== primaryUser.email) {
        emails.add(dupUser.email);
      }
      (dupUser.additionalEmails || []).forEach(e => emails.add(e));
      
      if (emails.size > 0) {
        updates.additionalEmails = Array.from(emails);
      }
      
      // Set GitHub info if the duplicate has it
      if (dupUser.githubIntegration && !primaryUser.githubIntegration) {
        updates.githubIntegration = dupUser.githubIntegration;
        
        // Also set the githubId
        if (dupUser.githubIntegration.userId) {
          updates.githubId = dupUser.githubIntegration.userId;
        }
      }
      
      // Set Google ID if the duplicate has it and primary doesn't
      if (dupUser.googleId && 
         (!primaryUser.googleId || primaryUser.googleId.startsWith('github_'))) {
        updates.googleId = dupUser.googleId;
      }
      
      // If the duplicate is a GitHub user and primary isn't, set GitHub as preferred
      if (dupUser.preferredAuthProvider === 'github' && 
          primaryUser.preferredAuthProvider !== 'github') {
        updates.preferredAuthProvider = 'github';
      }
      
      // Update avatar if missing
      if (!primaryUser.avatarUrl && dupUser.avatarUrl) {
        updates.avatarUrl = dupUser.avatarUrl;
      }
    }
    
    // Apply updates to the primary user
    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: primaryUser._id }, { $set: updates });
      console.log(`Updated primary user ${primaryUser._id} with merged data`);
    }
    
    // Delete the duplicate users
    for (const dupUser of duplicateUsers) {
      await User.deleteOne({ _id: dupUser._id });
      console.log(`Deleted duplicate user ${dupUser._id}`);
      mergeCount++;
    }
  }
  
  console.log(`Migration complete: Merged ${mergeCount} duplicate user accounts`);
  return { merged: mergeCount };
}

export default mergeUsersByEmail; 