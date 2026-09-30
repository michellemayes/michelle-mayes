import type { GitHubRepository } from '../lib/github';

/**
 * Hand-picked open source projects for the homepage showcase.
 * Star/fork counts come from live GitHub data (or the committed snapshot),
 * so only the storytelling bits live here.
 */
export type ShowcaseIcon = 'pulse' | 'sprout' | 'wand' | 'wrench' | 'check' | 'cart' | 'film';

export interface ShowcaseEntry {
  repo: string;
  name: string;
  icon: ShowcaseIcon;
  tagline: string;
  pitch: string;
  hue: 'violet' | 'leaf' | 'amber' | 'rose' | 'sky';
  stack: string[];
}

export const SHOWCASE: ShowcaseEntry[] = [
  {
    repo: 'meta-doctor',
    name: 'Meta Doctor',
    icon: 'pulse',
    tagline: 'Monitoring that writes the fix.',
    pitch: 'Most monitoring tells you something broke. Meta Doctor diagnoses the problem and opens the pull request that fixes it.',
    hue: 'rose',
    stack: ['Claude Code', 'Skills'],
  },
  {
    repo: 'terrarium',
    name: 'Terrarium',
    icon: 'sprout',
    tagline: 'A tiny glass box for your React components.',
    pitch: 'Drop in a TSX or JSX file and watch it render instantly. No project scaffolding, no dev server, just a native Mac window.',
    hue: 'leaf',
    stack: ['Tauri', 'Rust', 'TypeScript'],
  },
  {
    repo: 'magic-words',
    name: 'Magic Words',
    icon: 'wand',
    tagline: 'The phrase that steers Claude.',
    pitch: 'Describe your problem in plain language and get the exact phrase that points Claude straight at it. Or install the plugin and skip the asking.',
    hue: 'violet',
    stack: ['TypeScript', 'Claude Code Plugin'],
  },
  {
    repo: 'vibe-tooling',
    name: 'Vibe Tooling',
    icon: 'wrench',
    tagline: 'Tidy-up tools for vibe-coded repos.',
    pitch: 'A Claude Code plugin marketplace of code quality helpers that keep AI-assisted codebases clean, consistent, and reviewable.',
    hue: 'sky',
    stack: ['Claude Code', 'Plugins'],
  },
  {
    repo: 'AnimaMac',
    name: 'AnimaMac',
    icon: 'film',
    tagline: 'Screen to GIF, no time limits.',
    pitch: 'A native macOS GIF recorder inspired by Gifox. Capture any part of your screen as a crisp, shareable GIF.',
    hue: 'amber',
    stack: ['Swift', 'macOS'],
  },
  {
    repo: 'flodo',
    name: 'Flodo',
    icon: 'check',
    tagline: 'One floating list. That’s the whole app.',
    pitch: 'An infinite to-do list that floats above your work, with checkboxes and a toggle to hide what you’ve finished.',
    hue: 'violet',
    stack: ['Rust', 'Desktop'],
  },
  {
    repo: 'heb-grocery-agent',
    name: 'H-E-B Grocery Agent',
    icon: 'cart',
    tagline: 'Paste a list, get a full cart.',
    pitch: 'A Chrome extension that searches H-E-B for every item on your grocery list and adds it to your cart while you make coffee.',
    hue: 'rose',
    stack: ['Chrome Extension', 'TypeScript'],
  },
];

export interface ShowcaseProject extends ShowcaseEntry {
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
}

/**
 * Merge curated entries with repository data, ordered by stars so the
 * most-starred project gets the spotlight. Entries missing from the data are skipped.
 */
export function buildShowcase(repositories: GitHubRepository[]): ShowcaseProject[] {
  const byName = new Map(repositories.map((repo) => [repo.name.toLowerCase(), repo]));

  return SHOWCASE.flatMap((entry, index) => {
    const repo = byName.get(entry.repo.toLowerCase());
    if (!repo) return [];
    return [{
      ...entry,
      url: repo.html_url,
      homepage: repo.homepage || null,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      order: index,
    }];
  })
    .sort((a, b) => b.stars - a.stars || b.forks - a.forks || a.order - b.order)
    .map(({ order: _order, ...project }) => project);
}
