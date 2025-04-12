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

      // 4. Attempt to create the workflow file
      let workflowFileCreationFailed = false;
      let workflowCreationErrorDetails = null;
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
        
        console.log('Created workflow file successfully.');

      } catch (error) {
        if (error instanceof RequestError && error.status === 404) {
          console.warn('Workflow file creation failed with 404. Proceeding without workflow file.');
          workflowFileCreationFailed = true;
          workflowCreationErrorDetails = error.message;
        } else {
          // For other errors, re-throw to be caught by the outer catch block
          console.error('Unexpected error during workflow file creation:', error);
          throw error;
        }
      }

      // 5. Create a pull request (adjust content if workflow creation failed)
      let prTitle = 'Add Review Raccoon GitHub Action';
      let prBody = `This PR adds the Review Raccoon GitHub Action for automated code reviews on pull requests.

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
`;

      if (workflowFileCreationFailed) {
        prTitle = 'Setup Review Raccoon Integration Branch';
        prBody = `This PR creates the integration branch for Review Raccoon.

**Action Required:** The automated creation of the workflow file (\`.github/workflows/review-raccoon.yml\`) failed (Error: ${workflowCreationErrorDetails || 'Unknown 404'}). 

Please manually create the following file in this branch:

**Path:** \`.github/workflows/review-raccoon.yml\`

**Content:**
\`\`\`yaml
${workflowContent}
\`\`\`

Once the file is added, Review Raccoon will be active on future pull requests.

## Required Secrets
Please ensure the following secret is added to your repository settings:
- \`OPENAI_API_KEY\`: Your OpenAI API key to power the AI code reviews

[Learn more about Review Raccoon](${process.env.NEXTAUTH_URL})
`;
      }

      console.log(`Creating pull request with title: ${prTitle}`);
      const { data: pullRequest } = await octokit.pulls.create({
        owner: repoOwner,
        repo: repoName,
        title: prTitle,
        body: prBody,
        head: branchName,
        base: defaultBranch
      });
      
      console.log(`Created pull request #${pullRequest.number}`);
      
      return NextResponse.json({ 
        success: true, 
        pullRequest: {
          number: pullRequest.number,
          url: pullRequest.html_url
        },
        workflowCreated: !workflowFileCreationFailed,
        message: workflowFileCreationFailed ? 'Branch created, but workflow file needs manual setup.' : 'Workflow and PR created successfully.'
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