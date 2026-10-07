// GitHub API integration for fetching repository data
import { GITHUB_USERNAME } from '../consts';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  topics: string[];
  fork: boolean;
  private: boolean;
  homepage: string | null;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

/**
 * Fetch repositories from GitHub API
 * @param username - GitHub username (defaults to GITHUB_USERNAME from consts)
 * @param perPage - Number of repos per page (max 100)
 * @param sort - Sort by 'created', 'updated', 'pushed', 'full_name' (default: 'updated')
 * @param direction - Sort direction 'asc' or 'desc' (default: 'desc')
 * @param includeForks - Whether to include forked repositories (default: false)
 */
export async function fetchRepositories(
  username: string = GITHUB_USERNAME,
  perPage: number = 30,
  sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated',
  direction: 'asc' | 'desc' = 'desc',
  includeForks: boolean = false
): Promise<GitHubRepository[]> {
  try {
    // Use authenticated endpoint to get private repos when token is available
    const hasToken = !!process.env.GITHUB_TOKEN;
    const url = hasToken
      ? new URL('https://api.github.com/user/repos')
      : new URL(`https://api.github.com/users/${username}/repos`);

    url.searchParams.set('per_page', perPage.toString());
    url.searchParams.set('sort', sort);
    url.searchParams.set('direction', direction);

    if (hasToken) {
      // For authenticated endpoint, filter by owner affiliation
      url.searchParams.set('affiliation', 'owner');
    } else {
      url.searchParams.set('type', 'all');
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'michelle-mayes-personal-site',
        ...(hasToken && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    let repos: GitHubRepository[] = await response.json();

    // Filter to only the specified user's repos (for authenticated endpoint)
    if (hasToken) {
      repos = repos.filter(repo => repo.full_name.startsWith(`${username}/`));
    }

    // Filter out forks if requested
    if (!includeForks) {
      return repos.filter(repo => !repo.fork);
    }

    return repos;
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return [];
  }
}

/**
 * Fetch user information from GitHub API
 * @param username - GitHub username (defaults to GITHUB_USERNAME from consts)
 */
export async function fetchUserInfo(username: string = GITHUB_USERNAME): Promise<GitHubUser | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'michelle-mayes-personal-site',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub user info:', error);
    return null;
  }
}

/**
 * Get pinned repositories (requires GitHub token and GraphQL API)
 * This is a placeholder - would need GraphQL implementation for actual pinned repos
 */
export async function fetchPinnedRepositories(username: string = GITHUB_USERNAME): Promise<GitHubRepository[]> {
  // For now, return the most starred repositories as "featured"
  const repos = await fetchRepositories(username, 6, 'updated', 'desc', false);
  return repos.slice(0, 6);
}

/**
 * Fetch weekly commit activity for the last 12 weeks
 * Returns an array of commit counts per week (most recent last)
 */
export async function fetchCommitActivity(owner: string, repo: string): Promise<number[]> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/stats/participation`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'michelle-mayes-personal-site',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    // GitHub returns 202 if stats are being computed, treat as empty
    if (response.status === 202 || !response.ok) {
      return [];
    }

    const data = await response.json();
    // owner array has weekly commits by the owner for the last 52 weeks
    // Take the last 12 weeks for a compact view
    const ownerCommits: number[] = data.owner || [];
    return ownerCommits.slice(-12);
  } catch {
    return [];
  }
}
