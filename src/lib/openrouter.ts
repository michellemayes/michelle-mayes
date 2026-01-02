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
            content: `You analyze GitHub repository data to highlight the real-world problems solved and value delivered.
Return JSON only. Focus on the PROBLEM each project addresses and the VALUE it provides to users or businesses.
Frame projects as solutions to pain points, not just technical builds. Show clear value proposition.`
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

  return `Analyze these GitHub repos and generate timeline entries that highlight problems solved and value delivered.

Repos:
${JSON.stringify(repoData, null, 2)}

Return a JSON array with this structure for each repo:
[
  {
    "repoName": "exact-repo-name",
    "title": "Problem-focused title (e.g., 'Eliminated manual invoice processing')",
    "description": "Summarize what the project does and the value it adds (e.g., 'Automates data extraction from invoices, reducing processing time from hours to seconds for small businesses')",
    "isHighlight": true/false (true for projects with clear value proposition, false for utilities/minor)
  }
]

Rules:
- Title should frame the PROBLEM solved, not just what was built (e.g., "Streamlined team communication" not "Built a chat app")
- Description should explain WHAT the project does + WHO benefits + HOW it adds value
- Mark as highlight if: solves a real pain point, has clear users/audience, delivers measurable value
- Keep routine utilities/configs as isHighlight: false
- Be specific about the value proposition - avoid vague terms like "improves efficiency"
- Infer the problem from repo name, description, and topics when not explicit`;
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
