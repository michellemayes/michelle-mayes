import type { GitHubRepository } from '../lib/github';

/**
 * Hand-picked open source projects for the homepage showcase.
 * Star/fork counts come from live GitHub data (or the committed snapshot),
 * so only the storytelling bits live here.
 */
export type ShowcaseIcon = 'pulse' | 'sprout' | 'wand' | 'wrench' | 'check' | 'cart' | 'film';

/** Stroked 24x24 line icons for each showcase entry, rendered with set:html. */
export const SHOWCASE_ICONS: Record<ShowcaseIcon, string> = {
  pulse: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  check: '<path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"/><path d="m9 11 3 3L22 4"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 12h20"/><path d="M2 7h5"/><path d="M2 17h5"/><path d="M17 17h5"/><path d="M17 7h5"/>',
};

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
