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
    const url = new URL(`https://api.github.com/users/${username}/repos`);
    url.searchParams.set('per_page', perPage.toString());
    url.searchParams.set('sort', sort);
    url.searchParams.set('direction', direction);
    url.searchParams.set('type', 'all'); // Include all repo types

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'michelle-mayes-personal-site',
        // Add Authorization header if GITHUB_TOKEN is available
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos: GitHubRepository[] = await response.json();
    
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
 * Fetch the date of the first PR for a repository
 * Returns null if no PRs exist or on error
 */
export async function fetchFirstPRDate(owner: string, repo: string): Promise<Date | null> {
  try {
    const url = new URL(`https://api.github.com/repos/${owner}/${repo}/pulls`);
    url.searchParams.set('state', 'all');
    url.searchParams.set('sort', 'created');
    url.searchParams.set('direction', 'asc');
    url.searchParams.set('per_page', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'michelle-mayes-personal-site',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) return null;

    const prs = await response.json();
    if (prs.length > 0 && prs[0].created_at) {
      return new Date(prs[0].created_at);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch the date of the first commit for a repository
 * Returns null on error
 */
export async function fetchFirstCommitDate(owner: string, repo: string): Promise<Date | null> {
  try {
    // First get the default branch's commit count via the repo stats
    const commitsUrl = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`);
    commitsUrl.searchParams.set('per_page', '1');

    const response = await fetch(commitsUrl.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'michelle-mayes-personal-site',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) return null;

    // Get the last page from Link header to find oldest commit
    const linkHeader = response.headers.get('Link');
    if (!linkHeader) {
      // Only one page of commits, get it directly
      const commits = await response.json();
      if (commits.length > 0) {
        return new Date(commits[0].commit.author.date);
      }
      return null;
    }

    // Parse last page from Link header
    const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (!lastPageMatch) return null;

    const lastPage = lastPageMatch[1];
    commitsUrl.searchParams.set('page', lastPage);

    const lastPageResponse = await fetch(commitsUrl.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'michelle-mayes-personal-site',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!lastPageResponse.ok) return null;

    const lastPageCommits = await lastPageResponse.json();
    if (lastPageCommits.length > 0) {
      // Last commit on last page is the oldest
      return new Date(lastPageCommits[lastPageCommits.length - 1].commit.author.date);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get the "ship date" for a repo - first PR date, or first commit if no PRs
 */
export async function fetchShipDate(owner: string, repo: string): Promise<Date | null> {
  // Try first PR first
  const prDate = await fetchFirstPRDate(owner, repo);
  if (prDate) return prDate;

  // Fall back to first commit
  return fetchFirstCommitDate(owner, repo);
}
