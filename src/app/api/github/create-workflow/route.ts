import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import { decryptToken } from '@/app/utils/crypto';
import { REVIEW_RACCOON_WORKFLOW_CONTENT } from '@/constants';
import { Octokit } from '@octokit/rest';

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

      // 4. Get the tree of the latest commit
      const { data: latestCommit } = await octokit.git.getCommit({
        owner: repoOwner,
        repo: repoName,
        commit_sha: latestCommitSha
      });

      // 5. Create a tree with the new file
      const { data: newTree } = await octokit.git.createTree({
        owner: repoOwner,
        repo: repoName,
        base_tree: latestCommit.tree.sha,
        tree: [{
          path: '.github/workflows/review-raccoon.yml',
          mode: '100644',
          type: 'blob',
          content: workflowContent
        }]
      });

      // 6. Create a commit with the new tree
      const { data: newCommit } = await octokit.git.createCommit({
        owner: repoOwner,
        repo: repoName,
        message: 'Add Review Raccoon workflow for automated code reviews',
        tree: newTree.sha,
        parents: [latestCommitSha]
      });

      // 7. Update the reference to point to the new commit
      await octokit.git.updateRef({
        owner: repoOwner,
        repo: repoName,
        ref: `heads/${branchName}`,
        sha: newCommit.sha
      });

      console.log(`Created workflow file and committed changes`);
      
      // 8. Create a pull request
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
      
    } catch (githubError: any) {
      console.error('GitHub API error:', githubError);
      
      const status = githubError.status || 500;
      const message = githubError.message || 'Unknown GitHub API error';
      
      return NextResponse.json({ 
        error: `GitHub API error: ${message}`,
        details: githubError.response?.data || {}
      }, { status });
    }
    
  } catch (error) {
    console.error('Error creating workflow PR:', error);
    return NextResponse.json({ 
      error: 'Failed to create workflow PR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 