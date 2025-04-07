import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { User } from '@/models/User';
import { connectDB } from '@/db/db';
import { decryptToken } from '@/app/utils/crypto';
import { REVIEW_RACCOON_WORKFLOW_CONTENT } from '@/constants';
import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
  const tempDir = path.join(os.tmpdir(), `rr-workflow-${Date.now()}`);
  
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
    
    let user = await User.findOne({ userId });
    
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }
    
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

    const workflowContent = REVIEW_RACCOON_WORKFLOW_CONTENT(userId);

    const branchName = `review-raccoon-integration-${Date.now()}`;
    
    const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    if (!repoResponse.ok) {
      const errorData = await repoResponse.json();
      console.error('GitHub API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch repository', details: errorData }, { status: repoResponse.status });
    }
    
    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;
    const repoUrl = `https://${accessToken}@github.com/${repoOwner}/${repoName}.git`;
    
    fs.mkdirSync(tempDir, { recursive: true });
    const git: SimpleGit = simpleGit(tempDir);
    
    await git.clone(repoUrl, tempDir);
    await git.checkout(['-b', branchName]);
    const workflowsDir = path.join(tempDir, '.github', 'workflows');
    fs.mkdirSync(workflowsDir, { recursive: true });
    
    const workflowPath = path.join(workflowsDir, 'review-raccoon.yml');
    fs.writeFileSync(workflowPath, workflowContent);
    
    await git.addConfig('user.name', 'Review Raccoon');
    await git.addConfig('user.email', 'noreply@review-raccoon.com');
    await git.add('.github');
    await git.commit('Add Review Raccoon workflow for automated code reviews');
    await git.push('origin', branchName, ['--set-upstream']);

    const prResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          base: defaultBranch,
        }),
      }
    );
    
    if (!prResponse.ok) {
      const errorData = await prResponse.json();
      console.error('GitHub API error:', errorData);
      return NextResponse.json({ error: 'Failed to create pull request', details: errorData }, { status: prResponse.status });
    }
    
    const prData = await prResponse.json();
    try {
      console.log(`Cleaning up temporary directory: ${tempDir}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Error cleaning up temp directory:', cleanupError);
    }
    
    return NextResponse.json({ 
      success: true, 
      pullRequest: {
        number: prData.number,
        url: prData.html_url
      }
    });
    
  } catch (error) {
    console.error('Error creating workflow PR:', error);
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temp directory after failure:', cleanupError);
    }
    
    return NextResponse.json({ 
      error: 'Failed to create workflow PR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 