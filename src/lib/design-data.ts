import homeSnapshot from '../data/home-snapshot.json';
import projectsSnapshot from '../data/projects-snapshot.json';
import { buildShowcase, type ShowcaseProject } from '../data/showcase';
import type { GitHubRepository } from './github';
import type { GitHubStats } from './stats';
import type { TimelineItem } from './openrouter';
import { SOCIAL_LINKS } from '../consts';

/**
 * Shared content for the /designs prototypes. Reads only the committed
 * snapshots so the prototypes prerender instantly and never touch the
 * GitHub or OpenRouter APIs.
 */
export interface DesignOption {
  slug: string;
  name: string;
  blurb: string;
  palette: string[];
}

export const DESIGN_OPTIONS: DesignOption[] = [
  {
    slug: 'editorial',
    name: 'The Editorial',
    blurb: 'A broadsheet front page. Big serif masthead, ruled columns, projects written up as stories.',
    palette: ['#F4EFE6', '#161412', '#B3261E'],
  },
  {
    slug: 'terminal',
    name: 'Terminal',
    blurb: 'A dark dev console. The shipping log is literally a git log, and projects are an ls away.',
    palette: ['#0E0D14', '#E6E1F5', '#A78BFA'],
  },
  {
    slug: 'bento',
    name: 'Bento',
    blurb: 'A soft bento grid. Every piece of the story gets its own tile, all visible at a glance.',
    palette: ['#F3F1FA', '#1E1B2E', '#8B5CF6'],
  },
  {
    slug: 'brutalist',
    name: 'Sticker Brutal',
    blurb: 'Thick borders, hard shadows, loud color. Projects look like stickers slapped on a laptop lid.',
    palette: ['#FFF7E0', '#111111', '#FF5FA2'],
  },
  {
    slug: 'desktop',
    name: 'Desktop OS',
    blurb: 'Your homepage is a Mac desktop. Draggable windows, app icons, and a dock for navigation.',
    palette: ['#C9B8F5', '#FFFFFF', '#F59E0B'],
  },
];

export const PROFILE = {
  name: 'Michelle Mayes',
  role: 'Full-Stack Builder & AI Product Engineer',
  tagline: 'I ship fast. AI keeps up.',
  subline:
    'Product-minded full-stack builder making practical AI tools, cozy Mac apps, and the occasional grocery robot. Always with measurable outcomes.',
  avatar: '/avatar.jpg',
  calendarUrl: 'https://calendar.app.google/yYSHV4KQ4zJsxkdt5',
  email: SOCIAL_LINKS.email,
  social: SOCIAL_LINKS,
};

export const NAV_LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/resume', label: 'Resume' },
];

export interface DesignData {
  stats: GitHubStats;
  timeline: TimelineItem[];
  showcase: ShowcaseProject[];
  currentlyBuilding: TimelineItem | null;
  totalStars: number;
}

export function getDesignData(): DesignData {
  const stats = homeSnapshot.stats as GitHubStats;
  const timeline = (homeSnapshot.timelineItems as TimelineItem[]).filter((item) => !item.isPrivate);
  const showcase = buildShowcase(projectsSnapshot as GitHubRepository[]);
  const totalStars = showcase.reduce((sum, project) => sum + project.stars, 0);

  return {
    stats,
    timeline,
    showcase,
    currentlyBuilding: timeline[0] ?? null,
    totalStars,
  };
}

export function getDesignNeighbors(slug: string) {
  const index = DESIGN_OPTIONS.findIndex((option) => option.slug === slug);
  const count = DESIGN_OPTIONS.length;
  return {
    index,
    current: DESIGN_OPTIONS[index],
    prev: DESIGN_OPTIONS[(index - 1 + count) % count],
    next: DESIGN_OPTIONS[(index + 1) % count],
  };
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
