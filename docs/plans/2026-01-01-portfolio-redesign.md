# Portfolio Redesign: Ship Speed Showcase

## Overview

Complete redesign of michelle-mayes.vercel.app to emphasize shipping velocity and AI coding capability. Clean minimalist aesthetic with a dev + femme balance.

## Core Concept

**"I ship AI products fast."**

The portfolio is evidence-driven. No lengthy bio — the stats and timeline prove the work.

---

## Homepage Structure

```
┌─────────────────────────────────────────────────┐
│  HEADER: Name (serif) + minimal nav             │
├─────────────────────────────────────────────────┤
│  HERO: One punchy intro line                    │
├─────────────────────────────────────────────────┤
│  STATS BAR: 4-5 live metrics                    │
├─────────────────────────────────────────────────┤
│  TIMELINE: AI-curated activity feed             │
└─────────────────────────────────────────────────┘
```

### Stats Bar

Horizontal row of metrics, updated from GitHub:

- **Commits this month** — activity level
- **Projects shipped** — repo count
- **Primary language %** — tech focus
- **Contribution velocity** — PRs/issues
- **Avg time-to-ship** — days from first commit to deploy

Numbers in monospace, labels small. Clean cards with subtle shadow.

### Timeline

- **Source**: GitHub API (commits, repos, PRs)
- **Curation**: OpenRouter analyzes raw data, identifies wins, writes descriptions
- **Display**:
  - ★ Highlighted wins (purple accent, larger)
  - ○ Routine activity (muted, smaller)
  - Grouped by month
  - Tech tags as pills
  - Time-to-ship when calculable

---

## Visual Design

### Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#FAFAFA` | Warm off-white |
| Text | `#1a1a1a` | Near-black |
| Muted | `#6b7280` | Secondary text |
| Accent | `#8B5CF6` | Purple highlights |
| Accent hover | `#7C3AED` | Darker purple |
| Cards | `#FFFFFF` | White with subtle shadow |

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Headlines/Name | Playfair Display or Fraunces | 600 |
| Body/Labels | Inter | 400-500 |
| Stats/Numbers | JetBrains Mono | 500 |

### Design Principles

- Serif headlines = elegance, feminine touch
- Monospace numbers = developer credibility
- Purple accent = confident but not aggressive
- Generous whitespace = luxe, not cluttered
- Rounded corners (8-12px) = softer edges

---

## Pages

### Header Navigation

```
Michelle Mayes                          Blog  Resume
```

Minimal. No hamburger on desktop. Simple dropdown or text links on mobile.

### Blog

- Clean list view, no cards
- Title (serif) + date + one-line description
- Purple hover state
- Reading time shown subtly

### Resume

- View | Download options
- Embedded PDF or designed HTML version
- Optional live stats integration

### About

Folded into homepage. Intro + stats + timeline IS the about.

---

## Technical Architecture

### Data Flow

```
GitHub API → OpenRouter (analyze) → JSON Cache → Astro (render)
```

### Build Process

1. **At build time or daily cron**:
   - Fetch GitHub activity
   - Calculate stats
   - Send to OpenRouter for curation
   - Cache as JSON

2. **Astro renders** cached data statically

### Environment Variables

- `GITHUB_TOKEN` — GitHub API access
- `OPENROUTER_API_KEY` — AI curation

### Fallback

If OpenRouter fails, display raw GitHub activity with auto-generated labels. Site never breaks.

---

## Files to Modify

- `src/pages/index.astro` — Complete rewrite
- `src/styles/global.css` — New design system
- `src/components/Header.astro` — Simplify navigation
- `src/components/Timeline.astro` — New component
- `src/components/StatsBar.astro` — New component
- `src/lib/github.ts` — Extend for stats calculation
- `src/lib/openrouter.ts` — New: AI curation
- `src/lib/timeline.ts` — New: Data processing

## New Dependencies

- Google Fonts: Playfair Display or Fraunces, JetBrains Mono
- OpenRouter API client (fetch-based, no library needed)
