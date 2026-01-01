import { fetchRepositories, type GitHubRepository } from './github';
import { GITHUB_USERNAME } from '../consts';

export interface GitHubStats {
  totalRepos: number;
  totalCommits: number; // Approximation from recent activity
  primaryLanguage: string;
  primaryLanguagePercent: number;
  languageBreakdown: Record<string, number>;
  recentActivity: number; // Repos updated in last 30 days
  avgDaysToShip: number | null; // Average days between created and first major update
  streak: number; // Days with activity (approximate)
}

export interface RepoActivity {
  repo: GitHubRepository;
  daysSinceUpdate: number;
  daysSinceCreated: number;
  isRecent: boolean;
}

/**
 * Calculate comprehensive GitHub stats
 */
export async function calculateStats(username: string = GITHUB_USERNAME): Promise<GitHubStats> {
  const repos = await fetchRepositories(username, 100, 'updated', 'desc', false);

  if (repos.length === 0) {
    return {
      totalRepos: 0,
      totalCommits: 0,
      primaryLanguage: 'Unknown',
      primaryLanguagePercent: 0,
      languageBreakdown: {},
      recentActivity: 0,
      avgDaysToShip: null,
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

  // Estimate average days to ship (created -> first significant update)
  const shipTimes: number[] = [];
  for (const repo of repos) {
    const created = new Date(repo.created_at).getTime();
    const updated = new Date(repo.updated_at).getTime();
    const daysDiff = Math.floor((updated - created) / (24 * 60 * 60 * 1000));
    if (daysDiff > 0 && daysDiff < 365) { // Reasonable range
      shipTimes.push(daysDiff);
    }
  }
  const avgDaysToShip = shipTimes.length > 0
    ? Math.round(shipTimes.reduce((a, b) => a + b, 0) / shipTimes.length)
    : null;

  // Estimate streak from recent repos
  const streak = Math.min(recentActivity * 2, 30); // Rough approximation

  return {
    totalRepos: repos.length,
    totalCommits: repos.length * 15, // Rough estimate
    primaryLanguage,
    primaryLanguagePercent,
    languageBreakdown,
    recentActivity,
    avgDaysToShip,
    streak,
  };
}

/**
 * Get repo activity details for timeline
 */
export async function getRepoActivity(username: string = GITHUB_USERNAME): Promise<RepoActivity[]> {
  const repos = await fetchRepositories(username, 50, 'updated', 'desc', false);
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  return repos.map(repo => ({
    repo,
    daysSinceUpdate: Math.floor((now - new Date(repo.updated_at).getTime()) / (24 * 60 * 60 * 1000)),
    daysSinceCreated: Math.floor((now - new Date(repo.created_at).getTime()) / (24 * 60 * 60 * 1000)),
    isRecent: new Date(repo.updated_at).getTime() > thirtyDaysAgo,
  }));
}
