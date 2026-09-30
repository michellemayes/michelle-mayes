import type { GitHubRepository } from '../lib/github';

/**
 * Hand-picked open source projects for the homepage "greenhouse".
 * Star/fork counts come from live GitHub data (or the committed snapshot),
 * so only the storytelling bits live here.
 */
export interface ShowcaseEntry {
  repo: string;
  name: string;
  glyph: string;
  tagline: string;
  pitch: string;
  hue: 'violet' | 'leaf' | 'amber' | 'rose' | 'sky';
  stack: string[];
}

export const SHOWCASE: ShowcaseEntry[] = [
  {
    repo: 'terrarium',
    name: 'Terrarium',
    glyph: '🪴',
    tagline: 'A tiny glass box for your React components.',
    pitch: 'Drop in a TSX or JSX file and watch it render instantly. No project scaffolding, no dev server, just a cozy native Mac window.',
    hue: 'leaf',
    stack: ['Tauri', 'Rust', 'TypeScript'],
  },
  {
    repo: 'vibe-tooling',
    name: 'Vibe Tooling',
    glyph: '🧰',
    tagline: 'Tidy-up tools for vibe-coded repos.',
    pitch: 'A Claude Code plugin marketplace of code quality helpers that keep AI-assisted codebases clean, consistent, and reviewable.',
    hue: 'violet',
    stack: ['Claude Code', 'Plugins'],
  },
  {
    repo: 'heb-grocery-agent',
    name: 'H-E-B Grocery Agent',
    glyph: '🛒',
    tagline: 'Paste a list, get a full cart.',
    pitch: 'A Chrome extension that searches H-E-B for every item on your grocery list and adds it to your cart while you make coffee.',
    hue: 'rose',
    stack: ['Chrome Extension', 'TypeScript'],
  },
  {
    repo: 'nootle',
    name: 'Nootle',
    glyph: '🎙️',
    tagline: 'Meeting notes that write themselves.',
    pitch: 'A lightweight macOS recorder with live transcription, speaker diarization, and AI summaries, built to plug into Claude Code.',
    hue: 'sky',
    stack: ['Tauri', 'Rust', 'React', 'ONNX'],
  },
  {
    repo: 'AnimaMac',
    name: 'AnimaMac',
    glyph: '🎞️',
    tagline: 'Screen to GIF, no time limits.',
    pitch: 'A native macOS GIF recorder inspired by Gifox. Capture any part of your screen as a crisp, shareable GIF.',
    hue: 'amber',
    stack: ['Swift', 'macOS'],
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
 * biggest project gets the spotlight. Entries missing from the data are skipped.
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
