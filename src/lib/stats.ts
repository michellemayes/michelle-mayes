import { fetchCommitActivity, type GitHubRepository } from './github';
import { loadRepositories } from './projects';
import { GITHUB_USERNAME } from '../consts';

const DEFAULT_ACTIVITY_WINDOW_DAYS = 365;

export interface GitHubStats {
  totalRepos: number;
  totalCommits: number; // Approximation from recent activity
  primaryLanguage: string;
  primaryLanguagePercent: number;
  languageBreakdown: Record<string, number>;
  recentActivity: number; // Repos updated in last 30 days
  streak: number; // Days with activity (approximate)
}

export interface RepoActivity {
  repo: GitHubRepository;
  daysSinceUpdate: number;
  daysSinceCreated: number;
  commitActivity: number[]; // Weekly commit counts (last 12 weeks)
  isRecent: boolean;
}

function filterRepositoriesByWindow(
  repos: GitHubRepository[],
  windowDays: number
): GitHubRepository[] {
  if (windowDays <= 0) return repos;
  const startMs = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  return repos.filter((repo) => new Date(repo.created_at).getTime() >= startMs);
}

/**
 * Calculate comprehensive GitHub stats
 */
export async function calculateStats(
  username: string = GITHUB_USERNAME,
  windowDays: number = DEFAULT_ACTIVITY_WINDOW_DAYS
): Promise<GitHubStats> {
  const allRepos = await loadRepositories(username, 100);
  const repos = filterRepositoriesByWindow(allRepos, windowDays);

  if (repos.length === 0) {
    return {
      totalRepos: 0,
      totalCommits: 0,
      primaryLanguage: 'Unknown',
      primaryLanguagePercent: 0,
      languageBreakdown: {},
      recentActivity: 0,
      streak: 0,
    };
  }

  // Count languages
  const languageCounts: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  }

  // Find primary language
  const sortedLanguages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);
  const primaryLanguage = sortedLanguages[0]?.[0] || 'Unknown';
  const primaryLanguagePercent = sortedLanguages[0]
    ? Math.round((sortedLanguages[0][1] / repos.length) * 100)
    : 0;

  // Calculate language breakdown percentages
  const languageBreakdown: Record<string, number> = {};
  for (const [lang, count] of sortedLanguages.slice(0, 5)) {
    languageBreakdown[lang] = Math.round((count / repos.length) * 100);
  }

  // Recent activity (repos updated in last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentActivity = repos.filter(
    repo => new Date(repo.updated_at).getTime() > thirtyDaysAgo
  ).length;

  // Estimate streak from recent repos
  const streak = Math.min(recentActivity * 2, 30); // Rough approximation

  return {
    totalRepos: repos.length,
    totalCommits: repos.length * 15, // Rough estimate
    primaryLanguage,
    primaryLanguagePercent,
    languageBreakdown,
    recentActivity,
    streak,
  };
}

/**
 * Get repo activity details for timeline
 */
export async function getRepoActivity(
  username: string = GITHUB_USERNAME,
  windowDays: number = DEFAULT_ACTIVITY_WINDOW_DAYS
): Promise<RepoActivity[]> {
  const allRepos = await loadRepositories(username, 50);
  const repos = filterRepositoriesByWindow(allRepos, windowDays);

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Fetch commit activity for recent repos (limit API calls)
  const recentRepos = repos.slice(0, 20);
  const commitActivities = await Promise.all(
    recentRepos.map(repo => fetchCommitActivity(username, repo.name))
  );

  const commitActivityMap = new Map<string, number[]>();
  recentRepos.forEach((repo, i) => {
    commitActivityMap.set(repo.name, commitActivities[i]);
  });

  return repos.map(repo => {
    const createdAt = new Date(repo.created_at).getTime();

    return {
      repo,
      daysSinceUpdate: Math.floor((now - new Date(repo.updated_at).getTime()) / (24 * 60 * 60 * 1000)),
      daysSinceCreated: Math.floor((now - createdAt) / (24 * 60 * 60 * 1000)),
      commitActivity: commitActivityMap.get(repo.name) || [],
      isRecent: new Date(repo.updated_at).getTime() > thirtyDaysAgo,
    };
  });
}
