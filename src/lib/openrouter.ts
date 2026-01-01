import type { RepoActivity } from './stats';

export interface TimelineItem {
  id: string;
  date: string;
  month: string;
  year: number;
  title: string;
  description: string;
  isHighlight: boolean;
  isPrivate: boolean;
  repoUrl: string;
  repoName: string;
  language: string | null;
  daysToShip: number | null;
  tags: string[];
  stars: number;
  forks: number;
  commitActivity: number[]; // Weekly commit counts (last 12 weeks)
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
    daysToShip: a.daysToShip, // Days from creation to first PR/commit
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
    isPrivate: activity.repo.private,
    repoUrl: activity.repo.html_url,
    repoName: activity.repo.name,
    language: activity.repo.language,
    daysToShip: activity.daysToShip,
    tags: activity.repo.topics?.slice(0, 3) || [],
    stars: activity.repo.stargazers_count,
    forks: activity.repo.forks_count,
    commitActivity: activity.commitActivity,
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
