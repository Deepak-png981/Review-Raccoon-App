import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import { decryptToken } from '@/app/utils/crypto';
import { REVIEW_RACCOON_WORKFLOW_CONTENT } from '@/constants';
import { Octokit } from '@octokit/rest';
import { RequestError } from '@octokit/request-error';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log("Unauthorized: No user ID in session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { repoName, repoOwner } = body;
    
    if (!repoName || !repoOwner) {
      return NextResponse.json({ error: 'Repository name and owner are required' }, { status: 400 });
    }

    await connectDB();

    const userId = session.user.id;
    
    // Find user by userId first
    const userByUserId = await User.findOne({ userId });
    
    // If not found and email is available, try finding by email
    const userByEmail = !userByUserId && session.user.email 
      ? await User.findOne({ email: session.user.email })
      : null;
      
    // Use the first valid user record found
    const user = userByUserId || userByEmail;
    
    if (!user) {
      console.error("User not found");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.githubAccount || !user.githubAccount.accessTokenHash || !user.githubAccount.accessTokenIV) {
      console.log("User has no GitHub account connected");
      return NextResponse.json({ error: 'GitHub account not connected' }, { status: 400 });
    }

    const accessToken = decryptToken(
      user.githubAccount.accessTokenHash,
      user.githubAccount.accessTokenIV
    );

    const octokit = new Octokit({
      auth: accessToken
    });

    const workflowContent = REVIEW_RACCOON_WORKFLOW_CONTENT(userId);

    try {
      console.log(`Starting workflow creation for ${repoOwner}/${repoName}`);
      
      // 1. Get repository details
      const { data: repository } = await octokit.repos.get({
        owner: repoOwner,
        repo: repoName
      });
      
      const defaultBranch = repository.default_branch;
      console.log(`Default branch: ${defaultBranch}`);

      // 2. Get the latest commit SHA
      const { data: refData } = await octokit.git.getRef({
        owner: repoOwner,
        repo: repoName,
        ref: `heads/${defaultBranch}`
      });
      
      const latestCommitSha = refData.object.sha;
      console.log(`Latest commit SHA: ${latestCommitSha}`);
      
      // 3. Create a new branch
      const branchName = `review-raccoon-integration-${Date.now()}`;
      await octokit.git.createRef({
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: latestCommitSha
      });
      
      console.log(`Created branch: ${branchName}`);

      // 4. Create the workflow file directly using the content API
      try {
        console.log(`Attempting to create workflow file at: .github/workflows/review-raccoon.yml on branch ${branchName}`);
        await octokit.repos.createOrUpdateFileContents({
          owner: repoOwner,
          repo: repoName,
          path: '.github/workflows/review-raccoon.yml',
          message: 'Add Review Raccoon workflow for automated code reviews',
          content: Buffer.from(workflowContent).toString('base64'),
          branch: branchName
        });
        
        console.log('Created workflow file successfully on first attempt.');

      } catch (error) {
        if (error instanceof RequestError && error.status === 404) {
          console.log('Initial workflow file creation failed (404). Attempting to create directory structure...');
          
          try {
            // Attempt to create the .github directory placeholder
            console.log(`Attempting to create placeholder file at: .github/.gitkeep on branch ${branchName}`);
            await octokit.repos.createOrUpdateFileContents({
              owner: repoOwner,
              repo: repoName,
              path: '.github/.gitkeep',
              message: 'Create .github directory',
              content: '', // Empty content for placeholder
              branch: branchName
            });
            console.log('Successfully created .github/.gitkeep placeholder.');

            // Now, immediately retry creating the actual workflow file
            console.log(`Retrying to create workflow file at: .github/workflows/review-raccoon.yml on branch ${branchName}`);
            await octokit.repos.createOrUpdateFileContents({
              owner: repoOwner,
              repo: repoName,
              path: '.github/workflows/review-raccoon.yml',
              message: 'Add Review Raccoon workflow for automated code reviews',
              content: Buffer.from(workflowContent).toString('base64'),
              branch: branchName
            });
            console.log('Created workflow file successfully on second attempt after creating directory.');

          } catch (nestedError) {
            console.error('Error during directory structure creation or retry:', nestedError);
            // Re-throw the original error or a new one indicating the failure
            throw new Error(`Failed to create workflow file even after attempting directory creation. Error: ${nestedError instanceof Error ? nestedError.message : nestedError}`);
          }
        } else {
          // Re-throw other errors (non-404)
          console.error('Non-404 error during initial workflow file creation:', error);
          throw error;
        }
      }

      // 5. Create a pull request
      const { data: pullRequest } = await octokit.pulls.create({
        owner: repoOwner,
        repo: repoName,
        title: 'Add Review Raccoon GitHub Action',
        body: `This PR adds the Review Raccoon GitHub Action for automated code reviews on pull requests.

## What is Review Raccoon?
Review Raccoon is an AI-powered code review tool that automatically analyzes pull requests and provides feedback to improve code quality.

## Benefits
- Catch issues early before human code reviews
- Improve code quality and consistency
- Save developer time
- Receive detailed, contextual feedback

## Required Secrets
Please add the following secret to your repository settings:
- \`OPENAI_API_KEY\`: Your OpenAI API key to power the AI code reviews

[Learn more about Review Raccoon](${process.env.NEXTAUTH_URL})
`,
        head: branchName,
        base: defaultBranch
      });
      
      console.log(`Created pull request #${pullRequest.number}`);
      
      return NextResponse.json({ 
        success: true, 
        pullRequest: {
          number: pullRequest.number,
          url: pullRequest.html_url
        }
      });
      
    } catch (githubError: unknown) {
      console.error('GitHub API error:', githubError);
      
      if (githubError instanceof RequestError) {
        const status = githubError.status || 500;
        const message = githubError.message || 'Unknown GitHub API error';
        
        return NextResponse.json({ 
          error: `GitHub API error: ${message}`,
          details: githubError.response?.data || {}
        }, { status });
      }
      
      return NextResponse.json({ 
        error: 'Unknown GitHub API error',
        details: {}
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error creating workflow PR:', error);
    return NextResponse.json({ 
      error: 'Failed to create workflow PR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 