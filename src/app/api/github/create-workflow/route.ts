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

    const octokit = new Octokit({
      auth: accessToken
    });

    const workflowContent = REVIEW_RACCOON_WORKFLOW_CONTENT(userId);

    try {
      const { data: repository } = await octokit.repos.get({
        owner: repoOwner,
        repo: repoName
      });
      
      const defaultBranch = repository.default_branch;

      const { data: refData } = await octokit.git.getRef({
        owner: repoOwner,
        repo: repoName,
        ref: `heads/${defaultBranch}`
      });
      
      const latestCommitSha = refData.object.sha;
      const branchName = `review-raccoon-integration-${Date.now()}`;
      await octokit.git.createRef({
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: latestCommitSha
      });
      
      const workflowPath = '.github/workflows/review-raccoon.yml';
      
      const getFileSha = async () => {
        try {
          const { data: fileData } = await octokit.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: workflowPath,
            ref: branchName
          });
          
          if ('sha' in fileData) {
            console.log(`File already exists with SHA: ${fileData.sha}`);
            return fileData.sha;
          }
          return undefined;
        } catch (error) {
          console.log('File does not exist yet, will create new');
          return undefined;
        }
      };
      
      const fileSha = await getFileSha();
      
      await octokit.repos.createOrUpdateFileContents({
        owner: repoOwner,
        repo: repoName,
        path: workflowPath,
        message: 'Add Review Raccoon workflow for automated code reviews',
        content: Buffer.from(workflowContent).toString('base64'),
        branch: branchName,
        sha: fileSha
      });
      
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