# UI/UX Elevation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate the portfolio to world-class polish with refined typography, integrated hero/stats, scroll-triggered animations, premium blog experience, and touch-friendly mobile enhancements.

**Architecture:** Evolution of existing Astro site. Add Fraunces font, new CSS tokens, refactor hero to integrate stats, add Intersection Observer for scroll animations, implement View Transitions API, fix blog CSS bugs.

**Tech Stack:** Astro 5, CSS Custom Properties, View Transitions API, Intersection Observer, Fraunces variable font

---

## Phase 1: Foundation (Typography & Design Tokens)

### Task 1.1: Add Fraunces Font

**Files:**
- Modify: `src/components/BaseHead.astro`

**Step 1: Add Fraunces to font preloads**

In `BaseHead.astro`, add Fraunces from Google Fonts alongside existing fonts:

```astro
<!-- Add after existing Inter preconnect -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600&display=swap"
  rel="stylesheet"
/>
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds, no errors

**Step 3: Commit**

```bash
git add src/components/BaseHead.astro
git commit -m "feat: add Fraunces variable font"
```

---

### Task 1.2: Update Typography Tokens

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Replace Playfair with Fraunces and add typography scale**

In `global.css`, update the `:root` section:

```css
:root {
  /* Background */
  --bg: #FAFAFA;
  --bg-card: #FFFFFF;
  --bg-subtle: #F5F5F7;

  /* Text */
  --text: #1a1a1a;
  --text-muted: #6b7280;
  --text-light: #9ca3af;

  /* Purple accent - expanded */
  --accent: #8B5CF6;
  --accent-dark: #7C3AED;
  --accent-light: #A78BFA;
  --accent-50: #F5F3FF;
  --accent-100: #EDE9FE;
  --accent-200: #DDD6FE;
  --accent-300: #C4B5FD;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.08);
  --shadow-colored: 0 4px 20px rgba(139, 92, 246, 0.15);
  --shadow-colored-lg: 0 8px 30px rgba(139, 92, 246, 0.2);

  /* Typography - fonts */
  --font-serif: 'Fraunces', Georgia, serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Typography - scale (1.25 ratio) */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* Typography - line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

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

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: update design tokens with Fraunces and expanded scale"
```

---

### Task 1.3: Add Global Touch Feedback

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Add touch interaction styles at end of global.css**

```css
/* Touch interactions */
html {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Active states for touch feedback */
a:active,
button:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* Ensure buttons have proper touch targets */
button,
[role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Transitions for interactive elements */
a,
button,
[role="button"] {
  transition: transform 0.1s ease, opacity 0.1s ease, color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add global touch feedback and interaction styles"
```

---

## Phase 2: Hero & Stats Integration

### Task 2.1: Create Integrated HeroStats Component

**Files:**
- Create: `src/components/HeroStats.astro`

**Step 1: Create the new integrated component**

```astro
---
import type { GitHubStats } from '../lib/stats';

interface Props {
  stats: GitHubStats;
}

const { stats } = Astro.props;

const statItems = [
  { value: stats.totalRepos, label: 'Projects', suffix: '' },
  { value: stats.recentActivity, label: 'Active This Month', suffix: '' },
  { value: stats.primaryLanguagePercent, label: stats.primaryLanguage, suffix: '%' },
  { value: stats.avgDaysToShip || '—', label: 'Avg Days to Ship', suffix: stats.avgDaysToShip ? 'd' : '' },
];
---

<section class="hero-stats">
  <div class="hero-content">
    <div class="avatar-wrapper">
      <div class="avatar-glow"></div>
      <img src="/avatar.jpg" alt="Michelle Mayes" class="avatar" />
      <span class="avatar-sparkle sparkle-1">✨</span>
      <span class="avatar-sparkle sparkle-2">💜</span>
      <span class="avatar-sparkle sparkle-3">⭐</span>
    </div>
    <h1 class="hero-name">Michelle Mayes</h1>
    <p class="hero-tagline">I ship fast. AI keeps up. ⚡</p>

    <div class="stats-ribbon">
      {statItems.map((stat, index) => (
        <div class="stat-item" style={`--stat-index: ${index}`}>
          <span class="stat-value" data-value={typeof stat.value === 'number' ? stat.value : 0}>
            {stat.value}{stat.suffix}
          </span>
          <span class="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .hero-stats {
    text-align: center;
    padding: var(--space-xl) 0 var(--space-3xl);
    position: relative;
    overflow: hidden;
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }

  /* Avatar */
  .avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: var(--space-lg);
  }

  .avatar-glow {
    position: absolute;
    inset: -6px;
    background: var(--accent);
    border-radius: 50%;
    opacity: 0.4;
    filter: blur(20px);
    animation: glow-pulse 3s ease-in-out infinite;
    z-index: 0;
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
  }

  .avatar {
    position: relative;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--bg);
    box-shadow: var(--shadow-colored-lg);
    z-index: 1;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .avatar-wrapper:hover .avatar {
    transform: scale(1.03);
  }

  .avatar-sparkle {
    position: absolute;
    font-size: 1.2rem;
    z-index: 2;
    pointer-events: none;
    animation: float-sparkle 4s ease-in-out infinite;
    opacity: 0;
  }

  .sparkle-1 { top: -5px; right: -5px; animation-delay: 0.5s; }
  .sparkle-2 { bottom: 10px; left: -10px; animation-delay: 1.5s; }
  .sparkle-3 { top: 30%; right: -15px; animation-delay: 2.5s; }

  @keyframes float-sparkle {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
    10%, 90% { opacity: 0.8; }
    50% { transform: translateY(-6px) scale(1.1); opacity: 1; }
  }

  /* Name & Tagline */
  .hero-name {
    font-family: var(--font-serif);
    font-size: var(--text-5xl);
    font-weight: 600;
    color: var(--text);
    margin: 0 0 var(--space-sm) 0;
    opacity: 0;
    animation: fade-up 0.6s ease-out 0.2s forwards;
  }

  .hero-tagline {
    font-size: var(--text-xl);
    color: var(--text-muted);
    margin: 0 0 var(--space-2xl) 0;
    opacity: 0;
    animation: fade-up 0.6s ease-out 0.4s forwards;
  }

  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Stats Ribbon */
  .stats-ribbon {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-xl);
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 var(--space-lg);
    border-right: 1px solid var(--accent-100);
    opacity: 0;
    animation: fade-up 0.5s ease-out forwards;
    animation-delay: calc(0.6s + var(--stat-index) * 0.1s);
  }

  .stat-item:last-child {
    border-right: none;
  }

  .stat-value {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--accent);
    line-height: 1;
    margin-bottom: var(--space-xs);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .avatar {
      width: 120px;
      height: 120px;
    }

    .hero-name {
      font-size: var(--text-4xl);
    }

    .hero-tagline {
      font-size: var(--text-lg);
    }

    .stats-ribbon {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);
      padding: 0 var(--space-md);
    }

    .stat-item {
      padding: var(--space-md);
      border-right: none;
      background: var(--bg-card);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }

    .stat-value {
      font-size: var(--text-2xl);
    }
  }

  @media (max-width: 480px) {
    .hero-stats {
      padding: var(--space-lg) 0 var(--space-2xl);
    }

    .avatar {
      width: 100px;
      height: 100px;
    }

    .hero-name {
      font-size: var(--text-3xl);
    }

    .hero-tagline {
      font-size: var(--text-base);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .avatar-glow,
    .avatar-sparkle,
    .hero-name,
    .hero-tagline,
    .stat-item {
      animation: none;
      opacity: 1;
    }

    .avatar-wrapper:hover .avatar {
      transform: none;
    }
  }
</style>
```

**Step 2: Build to verify component compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/HeroStats.astro
git commit -m "feat: create integrated HeroStats component"
```

---

### Task 2.2: Update Homepage to Use HeroStats

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Replace hero and StatsBar with HeroStats**

Replace the imports and component usage:

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import HeroStats from '../components/HeroStats.astro';
import Timeline from '../components/Timeline.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { calculateStats, getRepoActivity } from '../lib/stats';
import { generateTimelineHighlights } from '../lib/openrouter';

export const prerender = true;

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
      <HeroStats stats={stats} />

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

  .timeline-section {
    margin-top: var(--space-2xl);
  }

  .timeline-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text);
    text-align: center;
    margin-bottom: var(--space-2xl);
  }

  @media (max-width: 768px) {
    main {
      padding: var(--space-lg);
    }

    .timeline-section h2 {
      font-size: var(--text-xl);
    }
  }

  @media (max-width: 480px) {
    main {
      padding: var(--space-md);
    }
  }
</style>
```

**Step 2: Build and preview**

Run: `npm run build && npm run preview`
Expected: Build succeeds, hero and stats display as integrated unit

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: integrate hero and stats on homepage"
```

---

### Task 2.3: Delete Old StatsBar Component

**Files:**
- Delete: `src/components/StatsBar.astro`

**Step 1: Remove the file**

```bash
rm src/components/StatsBar.astro
```

**Step 2: Build to verify no broken imports**

Run: `npm run build`
Expected: Build succeeds (StatsBar is no longer imported anywhere)

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove deprecated StatsBar component"
```

---

## Phase 3: Timeline Refinement

### Task 3.1: Refine Timeline Visual Styling

**Files:**
- Modify: `src/components/Timeline.astro`

**Step 1: Update the style section**

Replace the entire `<style>` section with refined styles. Key changes:
- Reduce border-radius from 20px to 16px
- Use shadow-colored instead of gradient borders
- Simplify hover states
- Refine month headers

```css
<style>
  .timeline-wrapper {
    position: relative;
    max-width: 750px;
    margin: 0 auto;
    padding: var(--space-lg) 0;
  }

  /* Floating particles - reduced for mobile */
  .particles {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .particle {
    position: absolute;
    font-size: 1rem;
    opacity: 0.2;
    animation: float 20s ease-in-out infinite;
    animation-delay: calc(var(--i) * -1.3s);
  }

  .particle::before {
    content: var(--emoji);
  }

  .particle:nth-child(odd) {
    left: calc(var(--i) * 7%);
    animation-duration: 25s;
  }

  .particle:nth-child(even) {
    right: calc(var(--i) * 5%);
    animation-duration: 18s;
    animation-direction: reverse;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% { opacity: 0.25; }
    90% { opacity: 0.25; }
    100% {
      transform: translateY(-100px) rotate(360deg);
      opacity: 0;
    }
  }

  .timeline {
    position: relative;
    z-index: 1;
  }

  .timeline-month {
    margin-bottom: var(--space-2xl);
  }

  /* Refined month header */
  .timeline-month-header {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text);
    margin-bottom: var(--space-lg);
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .timeline-month-header::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--accent-200), transparent);
  }

  .month-sparkle,
  .month-text {
    display: contents;
  }

  .month-sparkle {
    display: none; /* Hide sparkles, cleaner look */
  }

  .timeline-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  /* Refined card styling */
  .timeline-item {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-radius: 16px;
    background: var(--bg-card);
    box-shadow: var(--shadow-md);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
  }

  .timeline-item.revealed {
    opacity: 1;
    transform: translateY(0);
  }

  .timeline-item::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .timeline-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-colored-lg);
  }

  .timeline-item.revealed:hover {
    transform: translateY(-2px);
  }

  .timeline-item.highlight {
    background: linear-gradient(135deg, var(--bg-card) 0%, var(--accent-50) 100%);
  }

  .timeline-item.private {
    background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%);
  }

  /* Remove old blob */
  .card-blob {
    display: none;
  }

  /* Refined marker */
  .timeline-marker-wrapper {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-50);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .timeline-item:hover .timeline-marker-wrapper {
    transform: scale(1.1);
    background: var(--accent-100);
  }

  .timeline-marker {
    font-size: 1rem;
  }

  .timeline-content {
    flex: 1;
    min-width: 0;
  }

  .timeline-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-sm);
    margin-bottom: var(--space-xs);
  }

  .timeline-title {
    font-weight: 600;
    font-size: var(--text-lg);
    color: var(--text);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    transition: color 0.2s ease;
  }

  .timeline-title:hover {
    color: var(--accent);
  }

  .link-arrow {
    display: inline-block;
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.2s ease;
    font-weight: 400;
  }

  .timeline-title:hover .link-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  .private-title {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .private-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    background: var(--text-muted);
    color: white;
    padding: 2px 8px;
    border-radius: 100px;
  }

  /* Refined expand button */
  .expand-btn {
    background: var(--accent-50);
    border: 1px solid var(--accent-100);
    width: 36px;
    height: 36px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .expand-btn:hover {
    background: var(--accent);
    border-color: var(--accent);
  }

  .expand-btn:active {
    transform: scale(0.95);
  }

  .expand-icon {
    font-size: 0.9rem;
    color: var(--accent);
    transition: color 0.2s ease;
  }

  .expand-btn:hover .expand-icon {
    color: white;
  }

  .timeline-item.expanded .expand-btn {
    background: var(--accent);
    border-color: var(--accent);
  }

  .timeline-item.expanded .expand-icon {
    color: white;
  }

  .timeline-description {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: var(--leading-relaxed);
  }

  /* Refined tags */
  .timeline-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .timeline-tag {
    background: var(--accent-50);
    color: var(--accent-dark);
    padding: 6px 14px;
    border-radius: 100px;
    font-size: var(--text-xs);
    font-weight: 600;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .timeline-tag:hover {
    background: var(--accent-100);
    transform: translateY(-1px);
  }

  .tag-glow {
    display: none; /* Remove shimmer, cleaner */
  }

  .language-tag {
    background: var(--accent);
    color: white;
  }

  .language-tag:hover {
    background: var(--accent-dark);
  }

  .timeline-ship {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-50);
    padding: 6px 14px;
    border-radius: 100px;
    border: 1px dashed var(--accent-200);
  }

  /* Expandable details */
  .timeline-details {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 0;
  }

  .timeline-item.expanded .timeline-details {
    max-height: 500px;
    opacity: 1;
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--accent-100);
  }

  /* Commit Graph - refined */
  .commit-graph {
    margin-bottom: var(--space-lg);
    background: var(--bg-subtle);
    padding: var(--space-md);
    border-radius: 12px;
  }

  .graph-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    font-weight: 600;
    display: block;
    margin-bottom: var(--space-sm);
  }

  .graph-bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 40px;
  }

  .graph-bar {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    cursor: help;
    position: relative;
  }

  .bar-fill {
    width: 100%;
    height: var(--bar-height);
    background: linear-gradient(180deg, var(--accent-light), var(--accent));
    border-radius: 3px;
    transition: all 0.2s ease;
  }

  .bar-sparkle {
    display: none; /* Remove sparkles */
  }

  .graph-bar:hover .bar-fill {
    background: linear-gradient(180deg, var(--accent), var(--accent-dark));
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
  }

  .graph-legend {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-xs);
    color: var(--text-light);
    margin-top: var(--space-xs);
  }

  .details-row {
    display: flex;
    gap: var(--space-xl);
    flex-wrap: wrap;
  }

  .details-grid {
    display: flex;
    gap: var(--space-md);
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--bg-subtle);
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .detail-item:hover {
    background: var(--accent-50);
  }

  .detail-icon {
    font-size: 1rem;
  }

  .detail-value {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--accent);
    font-size: var(--text-base);
  }

  .detail-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .tech-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .tech-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    font-weight: 600;
  }

  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Outlined tech tags in expanded view */
  .tech-tag {
    background: transparent;
    color: var(--text);
    padding: 6px 14px;
    border-radius: 100px;
    font-size: var(--text-xs);
    font-weight: 600;
    border: 1px solid var(--accent-200);
    transition: all 0.2s ease;
  }

  .tech-tag:hover {
    border-color: var(--accent);
    background: var(--accent-50);
  }

  .tech-tag.primary {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  /* Mobile */
  @media (max-width: 768px) {
    .timeline-wrapper {
      padding: var(--space-md);
    }

    .timeline-item {
      padding: var(--space-md);
    }

    .timeline-title {
      font-size: var(--text-base);
    }

    .timeline-description {
      font-size: var(--text-xs);
    }

    .details-row {
      flex-direction: column;
      gap: var(--space-md);
    }

    .details-grid {
      flex-wrap: wrap;
      gap: var(--space-sm);
    }

    .expand-btn {
      width: 44px;
      height: 44px;
    }

    .timeline-tag {
      padding: 8px 16px;
    }

    .particles {
      opacity: 0.5;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .timeline-item {
      opacity: 1;
      transform: none;
    }

    .particle {
      animation: none;
    }

    .timeline-item:hover {
      transform: none;
    }
  }
</style>
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Timeline.astro
git commit -m "feat: refine timeline visual styling"
```

---

### Task 3.2: Add Scroll-Triggered Animations

**Files:**
- Modify: `src/components/Timeline.astro`

**Step 1: Update the script section**

Replace the existing `<script>` section with Intersection Observer logic:

```html
<script>
  // Expand/collapse functionality
  document.querySelectorAll('[data-expandable]').forEach((item) => {
    const btn = item.querySelector('.expand-btn');
    const icon = item.querySelector('.expand-icon');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      item.classList.toggle('expanded');
      if (icon) {
        icon.textContent = item.classList.contains('expanded') ? '✕' : '✦';
      }
    });
  });

  // Scroll-triggered reveal animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
        // Stagger the animation based on position in viewport
        const delay = index * 80;
        setTimeout(() => {
          entry.target.classList.add('revealed');
          entry.target.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        }, delay);
      }
    });
  }, observerOptions);

  // Observe all timeline items
  document.querySelectorAll('.timeline-item').forEach((item) => {
    revealObserver.observe(item);
  });

  // Handle reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.timeline-item').forEach((item) => {
      item.classList.add('revealed');
    });
  }
</script>
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Timeline.astro
git commit -m "feat: add scroll-triggered timeline animations"
```

---

## Phase 4: Blog Overhaul

### Task 4.1: Fix Blog Post CSS Bugs

**Files:**
- Modify: `src/pages/blog/[...slug].astro`

**Step 1: Replace undefined CSS variables with design tokens**

Update the `<style>` section to use proper design tokens:

```css
<style>
  main {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-xl);
    box-sizing: border-box;
  }

  .blog-navigation {
    max-width: 680px;
    margin: 0 auto var(--space-lg);
  }

  .back-to-posts-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--accent-50);
    color: var(--accent-dark);
    text-decoration: none;
    border-radius: 8px;
    font-size: var(--text-sm);
    font-weight: 600;
    transition: all 0.2s ease;
    border: 1px solid var(--accent-100);
    min-height: 44px;
  }

  .back-to-posts-btn:hover {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: var(--shadow-colored);
  }

  .back-to-posts-btn:active {
    transform: scale(0.98);
  }

  .blog-post {
    max-width: 680px;
    margin: 0 auto;
    padding: var(--space-2xl);
    background: var(--bg-card);
    border: 1px solid var(--accent-100);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
  }

  .blog-post-header {
    margin-bottom: var(--space-2xl);
    text-align: center;
  }

  .blog-post-header h1 {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 600;
    margin-bottom: var(--space-md);
    color: var(--text);
    line-height: var(--leading-tight);
  }

  .blog-post-meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
    color: var(--text-muted);
    font-size: var(--text-sm);
  }

  .blog-post-description {
    font-size: var(--text-lg);
    color: var(--text-muted);
    font-style: italic;
    max-width: 600px;
    margin: 0 auto;
    line-height: var(--leading-relaxed);
  }

  .blog-post-content {
    line-height: var(--leading-relaxed);
    color: var(--text);
    font-size: 18px;
  }

  .blog-post-content h2 {
    font-family: var(--font-serif);
    color: var(--text);
    margin-top: var(--space-2xl);
    margin-bottom: var(--space-md);
    font-size: var(--text-2xl);
  }

  .blog-post-content h3 {
    font-family: var(--font-serif);
    color: var(--text);
    margin-top: var(--space-xl);
    margin-bottom: var(--space-sm);
    font-size: var(--text-xl);
  }

  .blog-post-content p {
    margin-bottom: 1.5em;
  }

  .blog-post-content ul,
  .blog-post-content ol {
    margin-bottom: 1.5em;
    padding-left: var(--space-xl);
  }

  .blog-post-content li {
    margin-bottom: var(--space-sm);
  }

  .blog-post-content code {
    background: var(--accent-50);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 0.9em;
    color: var(--accent-dark);
  }

  .blog-post-content pre {
    background: var(--text);
    color: var(--bg);
    padding: var(--space-lg);
    border-radius: 12px;
    overflow-x: auto;
    margin-bottom: 1.5em;
  }

  .blog-post-content pre code {
    background: none;
    padding: 0;
    color: inherit;
  }

  .blog-post-content blockquote {
    border-left: 4px solid var(--accent);
    padding: var(--space-md) var(--space-lg);
    margin: 1.5em 0;
    font-style: italic;
    color: var(--text-muted);
    background: var(--accent-50);
    border-radius: 0 8px 8px 0;
  }

  .blog-post-content img {
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    margin: var(--space-lg) 0;
  }

  .blog-post-content a {
    color: var(--accent);
    text-decoration: underline;
    text-decoration-color: var(--accent-200);
    text-underline-offset: 2px;
    transition: text-decoration-color 0.2s ease;
  }

  .blog-post-content a:hover {
    text-decoration-color: var(--accent);
  }

  @media (max-width: 768px) {
    main {
      padding: var(--space-md);
    }

    .blog-post {
      padding: var(--space-lg);
    }

    .blog-post-header h1 {
      font-size: var(--text-2xl);
    }

    .blog-post-description {
      font-size: var(--text-base);
    }

    .blog-post-meta {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .blog-post-content {
      font-size: 16px;
    }

    .blog-post-content h2 {
      font-size: var(--text-xl);
    }

    .blog-post-content h3 {
      font-size: var(--text-lg);
    }
  }

  @media (max-width: 480px) {
    main {
      padding: var(--space-sm);
    }

    .blog-post {
      padding: var(--space-md);
      border-radius: 12px;
    }

    .blog-post-header h1 {
      font-size: var(--text-xl);
    }

    .back-to-posts-btn {
      padding: var(--space-sm) var(--space-md);
      font-size: var(--text-xs);
    }
  }
</style>
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/pages/blog/[...slug].astro
git commit -m "fix: replace undefined CSS variables in blog post"
```

---

### Task 4.2: Polish Blog Index Page

**Files:**
- Modify: `src/pages/blog/index.astro`

**Step 1: Update to card-based layout with hover states**

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
      <header class="page-header">
        <h1>Blog</h1>
        <p class="page-description">Thoughts on shipping fast, AI-assisted development, and building in public.</p>
      </header>

      <ul class="post-list">
        {posts.map((post, index) => {
          const readingTime = calculateReadingTime(post.body);
          return (
            <li class="post-card" style={`--card-index: ${index}`}>
              <a href={`/blog/${post.slug}/`} class="post-link">
                <div class="post-content">
                  <h2 class="post-title">{post.data.title}</h2>
                  {post.data.description && (
                    <p class="post-description">{post.data.description}</p>
                  )}
                  {post.data.tags && post.data.tags.length > 0 && (
                    <div class="post-tags">
                      {post.data.tags.slice(0, 3).map((tag: string) => (
                        <span class="post-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div class="post-meta">
                  <time datetime={post.data.pubDate.toISOString()}>
                    {new Date(post.data.pubDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                  <span class="reading-time">{readingTime} min read</span>
                </div>
              </a>
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

  .page-header {
    text-align: center;
    margin-bottom: var(--space-3xl);
  }

  .page-header h1 {
    font-family: var(--font-serif);
    font-size: var(--text-4xl);
    font-weight: 600;
    color: var(--text);
    margin-bottom: var(--space-sm);
  }

  .page-description {
    font-size: var(--text-lg);
    color: var(--text-muted);
    max-width: 500px;
    margin: 0 auto;
  }

  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .post-card {
    background: var(--bg-card);
    border-radius: 16px;
    box-shadow: var(--shadow-md);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    animation: fade-up 0.5s ease-out forwards;
    animation-delay: calc(var(--card-index) * 0.1s);
  }

  @keyframes fade-up {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .post-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-colored-lg);
  }

  .post-card:hover::before {
    opacity: 1;
  }

  .post-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 16px 0 0 16px;
  }

  .post-card {
    position: relative;
  }

  .post-link {
    display: flex;
    flex-direction: column;
    padding: var(--space-lg);
    text-decoration: none;
    gap: var(--space-md);
    min-height: 44px;
  }

  .post-content {
    flex: 1;
  }

  .post-title {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text);
    margin: 0 0 var(--space-sm) 0;
    transition: color 0.2s ease;
    line-height: var(--leading-tight);
  }

  .post-card:hover .post-title {
    color: var(--accent);
  }

  .post-description {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--text-base);
    color: var(--text-muted);
    line-height: var(--leading-normal);
  }

  .post-tags {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .post-tag {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-50);
    padding: 4px 10px;
    border-radius: 100px;
  }

  .post-meta {
    display: flex;
    gap: var(--space-md);
    font-size: var(--text-sm);
    color: var(--text-muted);
    padding-top: var(--space-sm);
    border-top: 1px solid var(--accent-50);
  }

  .reading-time {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }

  @media (max-width: 768px) {
    main {
      padding: var(--space-lg);
    }

    .page-header h1 {
      font-size: var(--text-3xl);
    }

    .page-description {
      font-size: var(--text-base);
    }

    .post-title {
      font-size: var(--text-lg);
    }

    .post-description {
      font-size: var(--text-sm);
    }
  }

  @media (max-width: 480px) {
    main {
      padding: var(--space-md);
    }

    .page-header h1 {
      font-size: var(--text-2xl);
    }

    .post-card {
      border-radius: 12px;
    }

    .post-link {
      padding: var(--space-md);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .post-card {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .post-card:hover {
      transform: none;
    }
  }
</style>
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: polish blog index with card layout"
```

---

## Phase 5: View Transitions

### Task 5.1: Enable Astro View Transitions

**Files:**
- Modify: `src/components/BaseHead.astro`

**Step 1: Add ViewTransitions component**

At the top of the file, add the import and component:

```astro
---
import { ViewTransitions } from 'astro:transitions';
// ... existing imports
---

<!-- In the head section, add: -->
<ViewTransitions />
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/BaseHead.astro
git commit -m "feat: enable Astro View Transitions"
```

---

### Task 5.2: Add Transition Names for Persistent Elements

**Files:**
- Modify: `src/components/Header.astro`

**Step 1: Add transition name to header**

Update the header element:

```astro
<header transition:persist>
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: persist header across page transitions"
```

---

## Phase 6: Final Polish

### Task 6.1: Update Header Touch Targets

**Files:**
- Modify: `src/components/Header.astro`

**Step 1: Increase touch targets for nav links**

Update the styles:

```css
.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  padding: var(--space-sm) var(--space-md);
  border-radius: 8px;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.nav-links a:hover {
  color: var(--accent);
  background: var(--accent-50);
}

.nav-links a.active {
  color: var(--accent);
  background: var(--accent-50);
}

.nav-links a:active {
  transform: scale(0.98);
}
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: improve header touch targets"
```

---

### Task 6.2: Final Build and Review

**Step 1: Full build**

Run: `npm run build`
Expected: Build completes with no errors

**Step 2: Preview the site**

Run: `npm run preview`
Expected: Site runs at localhost, all pages render correctly

**Step 3: Manual verification checklist**

- [ ] Homepage: Hero and stats display as integrated unit
- [ ] Homepage: Entrance animations play on load
- [ ] Homepage: Timeline cards animate on scroll
- [ ] Homepage: Timeline expand/collapse works
- [ ] Blog index: Cards display with hover effects
- [ ] Blog post: Typography is readable, no CSS errors
- [ ] Navigation: View transitions between pages
- [ ] Mobile: Touch targets are comfortable (44px+)
- [ ] Mobile: Active states provide feedback

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete UI/UX elevation implementation"
```

---

## Summary

| Phase | Tasks | Commits |
|-------|-------|---------|
| Foundation | 3 | Typography, tokens, touch feedback |
| Hero/Stats | 3 | HeroStats component, homepage update, cleanup |
| Timeline | 2 | Visual refinement, scroll animations |
| Blog | 2 | Post fix, index polish |
| Transitions | 2 | View Transitions, persistent header |
| Polish | 2 | Header touch targets, final review |

**Total: 14 commits, incremental progress throughout**
