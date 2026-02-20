import snapshot from '../data/home-snapshot.json';
import { calculateStats, getRepoActivity, type GitHubStats } from './stats';
import { generateTimelineHighlights, type TimelineItem } from './openrouter';

interface HomeData {
  stats: GitHubStats;
  timelineItems: TimelineItem[];
}

interface CacheState {
  data: HomeData;
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

let cacheState: CacheState | null = null;

function getSnapshotData(): HomeData {
  return {
    stats: snapshot.stats,
    timelineItems: snapshot.timelineItems,
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

async function fetchFreshHomeData(): Promise<HomeData> {
  const statsPromise = withTimeout(calculateStats(), FETCH_TIMEOUT_MS);
  const activityPromise = withTimeout(getRepoActivity(), FETCH_TIMEOUT_MS);
  const [stats, activities] = await Promise.all([statsPromise, activityPromise]);
  const timelineItems = await withTimeout(generateTimelineHighlights(activities), FETCH_TIMEOUT_MS);
  return { stats, timelineItems };
}

export async function getHomeData(): Promise<HomeData> {
  const now = Date.now();
  if (cacheState && cacheState.expiresAt > now) {
    return cacheState.data;
  }

  try {
    const freshData = await fetchFreshHomeData();
    cacheState = { data: freshData, expiresAt: now + CACHE_TTL_MS };
    return freshData;
  } catch (error) {
    console.error('Failed to refresh homepage data. Falling back to cached/snapshot data.', error);
    if (cacheState?.data) {
      return cacheState.data;
    }
    return getSnapshotData();
  }
}
