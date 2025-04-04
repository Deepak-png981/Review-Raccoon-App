import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { connectDB } from '@/lib/mongodb';
import { mergeUsersByEmail } from '@/lib/migrations/mergeUsers';
import { updateUserSchema } from '@/lib/migrations/updateUsersSchema';

// List of admin emails that can run migrations
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export async function POST(req: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectDB();
    
    // Run the schema migration first to fix any issues with user records
    console.log('Step 1: Running schema migration...');
    const schemaResult = await updateUserSchema();
    
    // Then run the merge migration to combine duplicate users
    console.log('Step 2: Running merge migration...');
    const mergeResult = await mergeUsersByEmail();
    
    return NextResponse.json({ 
      success: true, 
      message: `Migration complete: Updated ${schemaResult.updated} user records, merged ${mergeResult.merged} duplicate users.`,
      details: {
        schemaUpdates: schemaResult.updated,
        mergedUsers: mergeResult.merged
      }
    });
  } catch (error: any) {
    console.error('Error in user migration:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      message: error.message 
    }, { status: 500 });
  }
} 