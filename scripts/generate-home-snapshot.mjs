// Regenerates src/data/home-snapshot.json from the committed projects snapshot.
//
// home-snapshot.json is the last-resort fallback used by getHomeData() when the
// live homepage data refresh throws. It must contain meaningful stats and a
// timeline so the homepage never renders an empty "0 projects" state, even if
// the GitHub API is unreachable at build time.
//
// Run with: node scripts/generate-home-snapshot.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 365;
const now = Date.now();

const repos = JSON.parse(readFileSync(join(dataDir, 'projects-snapshot.json'), 'utf8'));
const inWindow = repos.filter((r) => new Date(r.created_at).getTime() >= now - WINDOW_DAYS * DAY_MS);

// --- stats (mirrors calculateStats; avgDaysToShip needs the live API so stays null) ---
const languageCounts = {};
for (const r of inWindow) {
  if (r.language) languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
}
const sortedLanguages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);
const primaryLanguage = sortedLanguages[0]?.[0] || 'Unknown';
const primaryLanguagePercent = sortedLanguages[0]
  ? Math.round((sortedLanguages[0][1] / inWindow.length) * 100)
  : 0;
const languageBreakdown = {};
for (const [lang, count] of sortedLanguages.slice(0, 5)) {
  languageBreakdown[lang] = Math.round((count / inWindow.length) * 100);
}
const recentActivity = inWindow.filter(
  (r) => new Date(r.updated_at).getTime() > now - 30 * DAY_MS
).length;

const stats = {
  totalRepos: inWindow.length,
  totalCommits: inWindow.length * 15,
  primaryLanguage,
  primaryLanguagePercent,
  languageBreakdown,
  recentActivity,
  avgDaysToShip: null,
  streak: Math.min(recentActivity * 2, 30),
};

// --- timeline (mirrors createBasicTimelineItem) ---
const formatRepoName = (name) =>
  name
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const timelineItems = inWindow.map((r) => {
  const date = new Date(r.updated_at);
  return {
    id: r.id.toString(),
    date: r.updated_at,
    month: date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }),
    year: date.getUTCFullYear(),
    title: formatRepoName(r.name),
    description: r.description || 'Updated repository',
    isHighlight: r.stargazers_count > 0,
    isPrivate: r.private,
    repoUrl: r.html_url,
    repoName: r.name,
    language: r.language,
    daysToShip: null,
    tags: r.topics?.slice(0, 3) || [],
    stars: r.stargazers_count,
    forks: r.forks_count,
    commitActivity: [],
  };
});

writeFileSync(
  join(dataDir, 'home-snapshot.json'),
  JSON.stringify({ stats, timelineItems }, null, 2) + '\n'
);

console.log(
  `Wrote home-snapshot.json: ${stats.totalRepos} repos, primary ${stats.primaryLanguage} ${stats.primaryLanguagePercent}%, ${timelineItems.length} timeline items.`
);
