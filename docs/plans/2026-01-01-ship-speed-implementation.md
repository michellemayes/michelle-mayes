# Ship Speed Portfolio Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign portfolio to showcase shipping velocity with AI-curated timeline, live GitHub stats, and clean minimalist dev+femme aesthetic.

**Architecture:** Static Astro site with build-time data fetching. GitHub API provides raw activity data, OpenRouter analyzes and highlights key wins, results cached as JSON for fast static rendering.

**Tech Stack:** Astro 5, TypeScript, GitHub API, OpenRouter API, Google Fonts (Playfair Display, JetBrains Mono, Inter)

---

## Task 1: Add New Typography

**Files:**
- Modify: `src/components/BaseHead.astro:34-37`
- Modify: `src/styles/global.css:84,147-159`

**Step 1: Update font imports in BaseHead.astro**

Replace the Google Fonts link:

```astro
<!-- Font preloads -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Step 2: Update CSS font variables**

Add to `:root` in global.css after line 30:

```css
/* Typography */
--font-serif: 'Playfair Display', Georgia, serif;
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

Update body font-family (line 84):

```css
font-family: var(--font-sans);
```

Update heading styles (lines 147-153):

```css
h1, h2, h3, h4, h5, h6 {
	margin: 0 0 0.5rem 0;
	color: rgb(var(--black));
	line-height: 1.2;
	font-family: var(--font-serif);
	font-weight: 600;
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add src/components/BaseHead.astro src/styles/global.css
git commit -m "feat: add Playfair Display and JetBrains Mono fonts

Dev+femme typography: serif headlines, mono for stats"
```

---

## Task 2: Update Color System

**Files:**
- Modify: `src/styles/global.css:1-30`

**Step 1: Replace CSS variables**

Replace the entire `:root` block:

```css
:root {
	/* Background */
	--bg: #FAFAFA;
	--bg-card: #FFFFFF;

	/* Text */
	--text: #1a1a1a;
	--text-muted: #6b7280;
	--text-light: #9ca3af;

	/* Purple accent */
	--accent: #8B5CF6;
	--accent-dark: #7C3AED;
	--accent-light: #A78BFA;
	--accent-50: #F5F3FF;
	--accent-100: #EDE9FE;

	/* Shadows */
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
	--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
	--shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.08);

	/* Typography */
	--font-serif: 'Playfair Display', Georgia, serif;
	--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
	--font-mono: 'JetBrains Mono', monospace;

	/* Spacing */
	--space-xs: 0.25rem;
	--space-sm: 0.5rem;
	--space-md: 1rem;
	--space-lg: 1.5rem;
	--space-xl: 2rem;
	--space-2xl: 3rem;
	--space-3xl: 4rem;
}
```

**Step 2: Update body background**

Find and update the body rule:

```css
body {
	font-family: var(--font-sans);
	margin: 0;
	padding: 0;
	background: var(--bg);
	color: var(--text);
	font-size: 18px;
	line-height: 1.7;
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: update color system for light/airy aesthetic"
```

---

## Task 3: Create GitHub Stats Calculator

**Files:**
- Create: `src/lib/stats.ts`

**Step 1: Create the stats module**

```typescript
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
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/lib/stats.ts
git commit -m "feat: add GitHub stats calculator

Calculates repos, languages, activity, and ship velocity"
```

---

## Task 4: Create OpenRouter Integration

**Files:**
- Create: `src/lib/openrouter.ts`

**Step 1: Create the OpenRouter module**

```typescript
import type { RepoActivity } from './stats';

export interface TimelineItem {
  id: string;
  date: string;
  month: string;
  year: number;
  title: string;
  description: string;
  isHighlight: boolean;
  repoUrl: string;
  repoName: string;
  language: string | null;
  daysToShip: number | null;
  tags: string[];
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Use OpenRouter to analyze repo activity and generate timeline highlights
 */
export async function generateTimelineHighlights(
  activities: RepoActivity[]
): Promise<TimelineItem[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // If no API key, return basic timeline without AI enhancement
  if (!apiKey) {
    console.warn('OPENROUTER_API_KEY not set, using basic timeline');
    return activities.map(activity => createBasicTimelineItem(activity));
  }

  try {
    const prompt = buildPrompt(activities);

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://michelle-mayes.vercel.app',
        'X-Title': 'Michelle Mayes Portfolio',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `You analyze GitHub repository data and identify impressive accomplishments.
Return JSON only. Be concise but impressive. Focus on what was BUILT, not just "worked on".
Highlight speed, scope, and impact. Make it sound like a shipped product, not a homework assignment.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenRouter response');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array in response');
    }

    const highlights: Array<{
      repoName: string;
      title: string;
      description: string;
      isHighlight: boolean;
    }> = JSON.parse(jsonMatch[0]);

    // Merge AI highlights with activity data
    return activities.map(activity => {
      const highlight = highlights.find(h => h.repoName === activity.repo.name);
      if (highlight) {
        return {
          ...createBasicTimelineItem(activity),
          title: highlight.title,
          description: highlight.description,
          isHighlight: highlight.isHighlight,
        };
      }
      return createBasicTimelineItem(activity);
    });

  } catch (error) {
    console.error('OpenRouter error:', error);
    return activities.map(activity => createBasicTimelineItem(activity));
  }
}

function buildPrompt(activities: RepoActivity[]): string {
  const repoData = activities.slice(0, 20).map(a => ({
    name: a.repo.name,
    description: a.repo.description,
    language: a.repo.language,
    daysOld: a.daysSinceCreated,
    daysToShip: a.daysSinceCreated - a.daysSinceUpdate,
    stars: a.repo.stargazers_count,
    topics: a.repo.topics,
  }));

  return `Analyze these GitHub repos and generate impressive timeline entries.

Repos:
${JSON.stringify(repoData, null, 2)}

Return a JSON array with this structure for each repo:
[
  {
    "repoName": "exact-repo-name",
    "title": "Short impressive title (e.g., 'Built AI-powered invoice processor')",
    "description": "One sentence about impact/speed (e.g., 'Automated 6 hours of manual work, shipped in 3 days')",
    "isHighlight": true/false (true for impressive projects, false for routine/minor)
  }
]

Rules:
- Title should start with action verb: Built, Launched, Shipped, Created, Designed
- Description should mention speed or impact when possible
- Mark as highlight if: has stars, interesting tech, clear product, fast turnaround
- Keep routine maintenance/forks as isHighlight: false
- Be concise, impressive, and honest`;
}

function createBasicTimelineItem(activity: RepoActivity): TimelineItem {
  const date = new Date(activity.repo.updated_at);
  return {
    id: activity.repo.id.toString(),
    date: activity.repo.updated_at,
    month: date.toLocaleDateString('en-US', { month: 'long' }),
    year: date.getFullYear(),
    title: formatRepoName(activity.repo.name),
    description: activity.repo.description || 'Updated repository',
    isHighlight: activity.repo.stargazers_count > 0,
    repoUrl: activity.repo.html_url,
    repoName: activity.repo.name,
    language: activity.repo.language,
    daysToShip: activity.daysSinceCreated > activity.daysSinceUpdate
      ? activity.daysSinceCreated - activity.daysSinceUpdate
      : null,
    tags: activity.repo.topics?.slice(0, 3) || [],
  };
}

function formatRepoName(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Group timeline items by month/year
 */
export function groupTimelineByMonth(items: TimelineItem[]): Map<string, TimelineItem[]> {
  const grouped = new Map<string, TimelineItem[]>();

  for (const item of items) {
    const key = `${item.month} ${item.year}`;
    const existing = grouped.get(key) || [];
    existing.push(item);
    grouped.set(key, existing);
  }

  return grouped;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/lib/openrouter.ts
git commit -m "feat: add OpenRouter integration for AI-curated timeline

Analyzes GitHub repos and generates impressive descriptions"
```

---

## Task 5: Create StatsBar Component

**Files:**
- Create: `src/components/StatsBar.astro`

**Step 1: Create the component**

```astro
---
import type { GitHubStats } from '../lib/stats';

interface Props {
  stats: GitHubStats;
}

const { stats } = Astro.props;

const statItems = [
  {
    value: stats.totalRepos,
    label: 'Projects',
    suffix: '',
  },
  {
    value: stats.recentActivity,
    label: 'Active This Month',
    suffix: '',
  },
  {
    value: stats.primaryLanguagePercent,
    label: stats.primaryLanguage,
    suffix: '%',
  },
  {
    value: stats.avgDaysToShip || '—',
    label: 'Avg Days to Ship',
    suffix: stats.avgDaysToShip ? 'd' : '',
  },
];
---

<div class="stats-bar">
  {statItems.map((stat) => (
    <div class="stat-card">
      <span class="stat-value">
        {stat.value}{stat.suffix}
      </span>
      <span class="stat-label">{stat.label}</span>
    </div>
  ))}
</div>

<style>
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: var(--space-lg);
    flex-wrap: wrap;
    margin-bottom: var(--space-3xl);
  }

  .stat-card {
    background: var(--bg-card);
    border-radius: 12px;
    padding: var(--space-lg) var(--space-xl);
    text-align: center;
    box-shadow: var(--shadow-md);
    min-width: 140px;
  }

  .stat-value {
    display: block;
    font-family: var(--font-mono);
    font-size: 2.5rem;
    font-weight: 500;
    color: var(--accent);
    line-height: 1;
    margin-bottom: var(--space-xs);
  }

  .stat-label {
    display: block;
    font-size: 0.875rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .stats-bar {
      gap: var(--space-md);
    }

    .stat-card {
      padding: var(--space-md) var(--space-lg);
      min-width: 120px;
    }

    .stat-value {
      font-size: 2rem;
    }

    .stat-label {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-sm);
    }

    .stat-card {
      padding: var(--space-md);
      min-width: auto;
    }

    .stat-value {
      font-size: 1.75rem;
    }
  }
</style>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/StatsBar.astro
git commit -m "feat: add StatsBar component

Displays GitHub stats with monospace numbers"
```

---

## Task 6: Create Timeline Component

**Files:**
- Create: `src/components/Timeline.astro`

**Step 1: Create the component**

```astro
---
import type { TimelineItem } from '../lib/openrouter';

interface Props {
  items: TimelineItem[];
}

const { items } = Astro.props;

// Group by month/year
const grouped = new Map<string, TimelineItem[]>();
for (const item of items) {
  const key = `${item.month} ${item.year}`;
  const existing = grouped.get(key) || [];
  existing.push(item);
  grouped.set(key, existing);
}
---

<div class="timeline">
  {[...grouped.entries()].map(([monthYear, monthItems]) => (
    <div class="timeline-month">
      <h3 class="timeline-month-header">{monthYear}</h3>
      <div class="timeline-items">
        {monthItems.map((item) => (
          <div class={`timeline-item ${item.isHighlight ? 'highlight' : ''}`}>
            <span class="timeline-marker">{item.isHighlight ? '★' : '○'}</span>
            <div class="timeline-content">
              <a href={item.repoUrl} target="_blank" rel="noopener" class="timeline-title">
                {item.title}
              </a>
              <p class="timeline-description">{item.description}</p>
              <div class="timeline-meta">
                {item.language && (
                  <span class="timeline-tag">{item.language}</span>
                )}
                {item.daysToShip && item.daysToShip > 0 && (
                  <span class="timeline-ship">Shipped in {item.daysToShip}d</span>
                )}
                {item.tags.map((tag) => (
                  <span class="timeline-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>

<style>
  .timeline {
    max-width: 700px;
    margin: 0 auto;
  }

  .timeline-month {
    margin-bottom: var(--space-2xl);
  }

  .timeline-month-header {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--accent-100);
  }

  .timeline-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .timeline-item {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-md);
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .timeline-item:hover {
    background: var(--accent-50);
  }

  .timeline-item.highlight {
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
    border-left: 3px solid var(--accent);
  }

  .timeline-item.highlight:hover {
    box-shadow: var(--shadow-md);
  }

  .timeline-marker {
    font-size: 1rem;
    color: var(--accent);
    flex-shrink: 0;
    width: 20px;
    text-align: center;
  }

  .timeline-item:not(.highlight) .timeline-marker {
    color: var(--text-light);
  }

  .timeline-content {
    flex: 1;
    min-width: 0;
  }

  .timeline-title {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text);
    text-decoration: none;
    display: block;
    margin-bottom: var(--space-xs);
  }

  .timeline-title:hover {
    color: var(--accent);
  }

  .timeline-item.highlight .timeline-title {
    font-size: 1.1rem;
  }

  .timeline-description {
    margin: 0 0 var(--space-sm) 0;
    font-size: 0.9rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .timeline-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    align-items: center;
  }

  .timeline-tag {
    background: var(--accent-100);
    color: var(--accent-dark);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .timeline-ship {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .timeline-item {
      padding: var(--space-sm);
    }

    .timeline-title {
      font-size: 0.95rem;
    }

    .timeline-item.highlight .timeline-title {
      font-size: 1rem;
    }

    .timeline-description {
      font-size: 0.85rem;
    }
  }
</style>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Timeline.astro
git commit -m "feat: add Timeline component

AI-curated activity feed with highlighted wins"
```

---

## Task 7: Simplify Header Component

**Files:**
- Modify: `src/components/Header.astro`

**Step 1: Replace the entire Header.astro file**

```astro
---
import { SITE_TITLE, SOCIAL_LINKS } from '../consts';

const currentPath = Astro.url.pathname;

const navLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/resume', label: 'Resume' },
];
---

<header>
  <nav>
    <a href="/" class="site-title">{SITE_TITLE}</a>
    <div class="nav-links">
      {navLinks.map(({ href, label }) => (
        <a
          href={href}
          class={currentPath.startsWith(href) ? 'active' : ''}
        >
          {label}
        </a>
      ))}
    </div>
  </nav>
</header>

<style>
  header {
    padding: var(--space-lg) var(--space-xl);
    max-width: 1200px;
    margin: 0 auto;
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .site-title {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text);
    text-decoration: none;
  }

  .site-title:hover {
    color: var(--accent);
  }

  .nav-links {
    display: flex;
    gap: var(--space-xl);
  }

  .nav-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .nav-links a:hover,
  .nav-links a.active {
    color: var(--accent);
  }

  @media (max-width: 480px) {
    header {
      padding: var(--space-md);
    }

    .site-title {
      font-size: 1.25rem;
    }

    .nav-links {
      gap: var(--space-lg);
    }

    .nav-links a {
      font-size: 0.9rem;
    }
  }
</style>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: simplify header to minimal nav

Just name + Blog/Resume links"
```

---

## Task 8: Rebuild Homepage

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Replace the entire index.astro file**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import StatsBar from '../components/StatsBar.astro';
import Timeline from '../components/Timeline.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { calculateStats, getRepoActivity } from '../lib/stats';
import { generateTimelineHighlights } from '../lib/openrouter';

export const prerender = true;

// Fetch data at build time
const stats = await calculateStats();
const activities = await getRepoActivity();
const timelineItems = await generateTimelineHighlights(activities);
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
  </head>
  <body>
    <Header />
    <main>
      <!-- Hero -->
      <section class="hero">
        <h1>Michelle Mayes</h1>
        <p class="tagline">I ship AI products fast.</p>
      </section>

      <!-- Stats -->
      <StatsBar stats={stats} />

      <!-- Timeline -->
      <section class="timeline-section">
        <h2>What I've Shipped</h2>
        <Timeline items={timelineItems} />
      </section>
    </main>
    <Footer />
  </body>
</html>

<style>
  main {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-xl);
  }

  .hero {
    text-align: center;
    margin-bottom: var(--space-3xl);
  }

  .hero h1 {
    font-family: var(--font-serif);
    font-size: 3.5rem;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 var(--space-md) 0;
  }

  .tagline {
    font-size: 1.25rem;
    color: var(--text-muted);
    margin: 0;
  }

  .timeline-section {
    margin-top: var(--space-3xl);
  }

  .timeline-section h2 {
    font-family: var(--font-serif);
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text);
    text-align: center;
    margin-bottom: var(--space-2xl);
  }

  @media (max-width: 768px) {
    main {
      padding: var(--space-lg);
    }

    .hero h1 {
      font-size: 2.5rem;
    }

    .tagline {
      font-size: 1.1rem;
    }

    .timeline-section h2 {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    main {
      padding: var(--space-md);
    }

    .hero h1 {
      font-size: 2rem;
    }

    .tagline {
      font-size: 1rem;
    }
  }
</style>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: rebuild homepage with stats and timeline

Hero → Stats → AI-curated timeline"
```

---

## Task 9: Update Blog Page

**Files:**
- Modify: `src/pages/blog/index.astro`

**Step 1: Read current file and replace with clean list view**

```astro
---
import BaseHead from '../../components/BaseHead.astro';
import Footer from '../../components/Footer.astro';
import Header from '../../components/Header.astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../../consts';
import { getCollection } from 'astro:content';

export const prerender = true;

const posts = (await getCollection('blog')).sort(
  (a, b) => new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
);

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={`Blog | ${SITE_TITLE}`} description={SITE_DESCRIPTION} />
  </head>
  <body>
    <Header />
    <main>
      <h1>Blog</h1>
      <ul class="post-list">
        {posts.map((post) => {
          const readingTime = calculateReadingTime(post.body);
          return (
            <li class="post-item">
              <a href={`/blog/${post.slug}/`} class="post-link">
                <span class="post-title">{post.data.title}</span>
                <span class="post-meta">
                  <time datetime={post.data.pubDate.toISOString()}>
                    {new Date(post.data.pubDate).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </time>
                  <span class="reading-time">{readingTime} min</span>
                </span>
              </a>
              {post.data.description && (
                <p class="post-description">{post.data.description}</p>
              )}
            </li>
          );
        })}
      </ul>
    </main>
    <Footer />
  </body>
</html>

<style>
  main {
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-xl);
  }

  h1 {
    font-family: var(--font-serif);
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: var(--space-2xl);
  }

  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .post-item {
    padding: var(--space-lg) 0;
    border-bottom: 1px solid var(--accent-100);
  }

  .post-item:last-child {
    border-bottom: none;
  }

  .post-link {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-lg);
    text-decoration: none;
    margin-bottom: var(--space-xs);
  }

  .post-title {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
    transition: color 0.2s ease;
  }

  .post-link:hover .post-title {
    color: var(--accent);
  }

  .post-meta {
    display: flex;
    gap: var(--space-md);
    font-size: 0.875rem;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .reading-time {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
  }

  .post-description {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    main {
      padding: var(--space-lg);
    }

    h1 {
      font-size: 2rem;
    }

    .post-link {
      flex-direction: column;
      gap: var(--space-xs);
    }

    .post-title {
      font-size: 1.1rem;
    }
  }

  @media (max-width: 480px) {
    main {
      padding: var(--space-md);
    }

    h1 {
      font-size: 1.75rem;
    }
  }
</style>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: update blog to clean list view

Simple list with serif titles and reading time"
```

---

## Task 10: Update Resume Page

**Files:**
- Modify: `src/pages/resume.astro`

**Step 1: Read current and update to match new design**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const prerender = true;
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={`Resume | ${SITE_TITLE}`} description={SITE_DESCRIPTION} />
  </head>
  <body>
    <Header />
    <main>
      <div class="resume-header">
        <h1>Resume</h1>
        <div class="resume-actions">
          <a href="#viewer" class="action-link active">View</a>
          <a href="/resume.pdf" download class="action-link">Download PDF</a>
        </div>
      </div>
      <div id="viewer" class="resume-viewer">
        <iframe src="/resume.pdf" title="Michelle Mayes Resume"></iframe>
      </div>
    </main>
    <Footer />
  </body>
</html>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-xl);
  }

  .resume-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2xl);
  }

  h1 {
    font-family: var(--font-serif);
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }

  .resume-actions {
    display: flex;
    gap: var(--space-md);
  }

  .action-link {
    padding: var(--space-sm) var(--space-lg);
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.2s ease;
    color: var(--text-muted);
    border: 1px solid var(--accent-100);
  }

  .action-link:hover,
  .action-link.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .resume-viewer {
    background: var(--bg-card);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  iframe {
    width: 100%;
    height: 80vh;
    border: none;
  }

  @media (max-width: 768px) {
    main {
      padding: var(--space-lg);
    }

    .resume-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md);
    }

    h1 {
      font-size: 2rem;
    }

    iframe {
      height: 60vh;
    }
  }

  @media (max-width: 480px) {
    main {
      padding: var(--space-md);
    }

    h1 {
      font-size: 1.75rem;
    }
  }
</style>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/pages/resume.astro
git commit -m "feat: update resume page to match new design

View/Download toggle with clean styling"
```

---

## Task 11: Clean Up Global CSS

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Replace entire global.css with cleaned up version**

Keep only essential base styles, remove old card/button/grid classes that are now component-scoped.

```css
/*
  Ship Speed Portfolio - Global Styles
  Clean, minimal base styles with CSS custom properties
*/

:root {
  /* Background */
  --bg: #FAFAFA;
  --bg-card: #FFFFFF;

  /* Text */
  --text: #1a1a1a;
  --text-muted: #6b7280;
  --text-light: #9ca3af;

  /* Purple accent */
  --accent: #8B5CF6;
  --accent-dark: #7C3AED;
  --accent-light: #A78BFA;
  --accent-50: #F5F3FF;
  --accent-100: #EDE9FE;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.08);

  /* Typography */
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
}

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text);
  font-size: 18px;
  line-height: 1.7;
  min-height: 100vh;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text);
}

h1 { font-size: 3rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }

@media (max-width: 768px) {
  h1 { font-size: 2.25rem; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.25rem; }
}

/* Links */
a {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--accent-dark);
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Code */
code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--accent-50);
  padding: 2px 6px;
  border-radius: 4px;
}

pre {
  background: var(--text);
  color: var(--bg);
  padding: var(--space-lg);
  border-radius: 8px;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}

/* Blockquotes */
blockquote {
  border-left: 3px solid var(--accent);
  padding-left: var(--space-lg);
  color: var(--text-muted);
  font-style: italic;
}

/* Prose (for blog posts) */
.prose {
  max-width: 65ch;
  margin: 0 auto;
}

.prose p {
  margin-bottom: 1.5em;
}

.prose h2 {
  margin-top: 2em;
  margin-bottom: 0.75em;
}

.prose h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose ul, .prose ol {
  padding-left: var(--space-lg);
  margin-bottom: 1.5em;
}

.prose li {
  margin-bottom: 0.5em;
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Loading overlay (kept for transitions) */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(250, 250, 250, 0.95);
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.1s ease, visibility 0.1s ease;
}

.loading-overlay.active {
  opacity: 1;
  visibility: visible;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "refactor: clean up global CSS

Remove old component styles, keep minimal base"
```

---

## Task 12: Update Footer

**Files:**
- Modify: `src/components/Footer.astro`

**Step 1: Simplify footer to match new design**

```astro
---
import { SOCIAL_LINKS } from '../consts';

const currentYear = new Date().getFullYear();
---

<footer>
  <div class="footer-content">
    <p class="copyright">&copy; {currentYear} Michelle Mayes</p>
    <div class="social-links">
      <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener" aria-label="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
      <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      </a>
      <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener" aria-label="Twitter">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a href={SOCIAL_LINKS.email} aria-label="Email">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/>
        </svg>
      </a>
    </div>
  </div>
</footer>

<style>
  footer {
    padding: var(--space-2xl) var(--space-xl);
    margin-top: var(--space-3xl);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .copyright {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .social-links {
    display: flex;
    gap: var(--space-lg);
  }

  .social-links a {
    color: var(--text-muted);
    transition: color 0.2s ease;
  }

  .social-links a:hover {
    color: var(--accent);
  }

  @media (max-width: 480px) {
    footer {
      padding: var(--space-xl) var(--space-md);
    }

    .footer-content {
      flex-direction: column;
      gap: var(--space-md);
    }
  }
</style>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: simplify footer design

Clean copyright + social icons"
```

---

## Task 13: Final Build and Test

**Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Local preview**

Run: `npm run preview`
Expected: Site loads correctly at localhost

**Step 3: Visual check**

- [ ] Homepage shows name, tagline, stats, timeline
- [ ] Stats display correctly with monospace numbers
- [ ] Timeline shows with highlighted/regular items
- [ ] Blog page is clean list view
- [ ] Resume page has view/download options
- [ ] Fonts render correctly (serif headlines, mono stats)
- [ ] Colors match design (light bg, purple accents)
- [ ] Mobile responsive

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```

---

## Environment Variables Required

Add to Vercel (or `.env.local` for development):

```
GITHUB_TOKEN=your_github_token
OPENROUTER_API_KEY=your_openrouter_key
```
