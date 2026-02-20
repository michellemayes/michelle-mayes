import type { GitHubRepository } from './github';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const IMPACT_WEIGHTS = {
  stars: 20,
  forks: 12,
  hasDescription: 18,
  updatedLast30Days: 20,
  updatedLast90Days: 10,
} as const;

export interface EnrichedProject extends GitHubRepository {
  score: number;
  daysSinceUpdate: number;
  focusArea: string;
  impactSignal: string;
}

export interface ProjectBuckets {
  featured: EnrichedProject[];
  catalog: EnrichedProject[];
}

function getDaysSince(dateString: string, nowMs: number): number {
  return Math.floor((nowMs - new Date(dateString).getTime()) / DAY_IN_MS);
}

function calculateProjectScore(repo: GitHubRepository, daysSinceUpdate: number): number {
  const recencyWeight =
    daysSinceUpdate <= 30
      ? IMPACT_WEIGHTS.updatedLast30Days
      : daysSinceUpdate <= 90
        ? IMPACT_WEIGHTS.updatedLast90Days
        : 0;

  return (
    repo.stargazers_count * IMPACT_WEIGHTS.stars +
    repo.forks_count * IMPACT_WEIGHTS.forks +
    (repo.description ? IMPACT_WEIGHTS.hasDescription : 0) +
    recencyWeight
  );
}

function buildImpactSignal(repo: GitHubRepository, daysSinceUpdate: number): string {
  if (repo.stargazers_count > 0 || repo.forks_count > 0) {
    return `OSS traction: ${repo.stargazers_count} stars and ${repo.forks_count} forks.`;
  }

  if (daysSinceUpdate <= 30) {
    return 'Actively iterated in the last 30 days.';
  }

  if (repo.description) {
    return 'Clear product direction documented in the repository.';
  }

  return 'Early-stage exploration and rapid prototyping.';
}

function sortProjects(a: EnrichedProject, b: EnrichedProject): number {
  const scoreDelta = b.score - a.score;
  if (scoreDelta !== 0) return scoreDelta;
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

export function bucketProjects(
  repositories: GitHubRepository[],
  featuredCount: number = 3
): ProjectBuckets {
  const nowMs = Date.now();

  const enriched = repositories
    .map((repo): EnrichedProject => {
      const daysSinceUpdate = getDaysSince(repo.updated_at, nowMs);
      return {
        ...repo,
        score: calculateProjectScore(repo, daysSinceUpdate),
        daysSinceUpdate,
        focusArea: repo.topics?.[0] || repo.language || 'Product Engineering',
        impactSignal: buildImpactSignal(repo, daysSinceUpdate),
      };
    })
    .sort(sortProjects);

  return {
    featured: enriched.slice(0, featuredCount),
    catalog: enriched.slice(featuredCount),
  };
}

export function getProjectDescription(description: string | null): string {
  return description || 'Repository in active iteration; details and documentation are evolving.';
}
