// /**
//  * This script fixes GitHub users by setting the githubId field and removing any
//  * placeholder googleId field that might be causing validation errors
//  */

// const { MongoClient } = require('mongodb');

// // Get connection string from environment variable or use a default
// const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/review-raccoon';

// async function main() {
//   console.log('Starting GitHub users fix script...');
//   const client = new MongoClient(uri);
  
//   try {
//     await client.connect();
//     console.log('Connected to MongoDB');
    
//     const db = client.db();
//     const userCollection = db.collection('users');
    
//     // 1. Find GitHub users by using the githubIntegration field
//     const githubUsers = await userCollection.find({
//       'githubIntegration.userId': { $exists: true }
//     }).toArray();
    
//     console.log(`Found ${githubUsers.length} users with GitHub integration`);
    
//     let updatedCount = 0;
    
//     for (const user of githubUsers) {
//       const updates = {};
//       let needsUpdate = false;
      
//       // Get GitHub ID from integration data
//       if (user.githubIntegration && user.githubIntegration.userId && !user.githubId) {
//         updates.githubId = user.githubIntegration.userId;
//         needsUpdate = true;
//       }
      
//       // Check if we need to remove placeholder googleId
//       if (user.googleId && user.googleId.startsWith('github_')) {
//         // Use $unset to remove the field completely
//         await userCollection.updateOne(
//           { _id: user._id },
//           { $unset: { googleId: "" } }
//         );
//         console.log(`Removed placeholder googleId from user ${user.email || user._id}`);
//         updatedCount++;
//       }
      
//       // Apply other updates if needed
//       if (needsUpdate) {
//         await userCollection.updateOne(
//           { _id: user._id },
//           { $set: updates }
//         );
//         console.log(`Updated user ${user.email || user._id} with proper fields`);
//         updatedCount++;
//       }
//     }
    
//     console.log(`Completed: Updated ${updatedCount} GitHub user records`);
//   } catch (err) {
//     console.error('Error fixing GitHub users:', err);
//   } finally {
//     await client.close();
//     console.log('Disconnected from MongoDB');
//   }
// }

// main().catch(console.error); 