const WORDS_PER_MINUTE = 200;

/** Whole minutes to read a post body, never less than one. */
export function readingTime(content: string | undefined): number {
  const words = (content ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
