import axios from 'axios';
import * as userService from '@/lib/userService';

/**
 * Utility for making authenticated GitHub API requests
 */
export class GitHubAPI {
  private token: string | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize the API with the user's GitHub token
   */
  async init() {
    try {
      // Get the token from the database using the user service
      if (!this.token) {
        const userToken = await userService.getGithubToken(this.userId);
        this.token = userToken;
      }
      return !!this.token;
    } catch (error) {
      console.error('Error initializing GitHub API:', error);
      return false;
    }
  }

  /**
   * Make an authenticated request to the GitHub API
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      const initialized = await this.init();
      if (!initialized) {
        throw new Error('GitHub API not initialized. User may not have connected GitHub.');
      }
    }

    const url = `https://api.github.com${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${this.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API error: ${error.message}`);
    }

    return response.json();
  }

  /**
   * Get the user's repositories
   */
  async getRepositories() {
    return this.request<any[]>('/user/repos?sort=updated&per_page=100');
  }

  /**
   * Get pull requests for a repository
   */
  async getPullRequests(owner: string, repo: string) {
    return this.request<any[]>(`/repos/${owner}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=20`);
  }

  /**
   * Get issues for a repository
   */
  async getIssues(owner: string, repo: string) {
    return this.request<any[]>(`/repos/${owner}/${repo}/issues?state=all&sort=updated&direction=desc&per_page=20`);
  }
}

/**
 * Create a GitHub API instance for a user
 */
export function createGitHubAPI(userId: string) {
  return new GitHubAPI(userId);
}

/**
 * Fetch repositories for an authenticated user
 */
export async function fetchUserRepositories(userId: string) {
  try {
    // Get the GitHub token from the user service
    const token = await userService.getGithubToken(userId);
    
    if (!token) {
      throw new Error('No GitHub token available');
    }
    
    // Make request to GitHub API
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 100,
        visibility: 'all'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    throw error;
  }
}

/**
 * Check if a user is connected to GitHub
 */
export async function isGithubConnected(userId: string) {
  try {
    return await userService.hasGithubConnected(userId);
  } catch (error) {
    console.error('Error checking GitHub connection:', error);
    return false;
  }
}

/**
 * Connect GitHub account using session userId
 */
export async function connectGithubAccount(userId: string, token: string, profile: any) {
  try {
    await userService.connectGithubToUser(userId, token, profile);
    return true;
  } catch (error) {
    console.error('Error connecting GitHub account:', error);
    throw error;
  }
} 