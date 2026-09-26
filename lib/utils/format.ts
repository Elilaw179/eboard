/**
 * Converts a Firebase Timestamp or Date to a JS Date object.
 * Returns null if the value cannot be parsed.
 */
function toDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Formats a Firebase Timestamp or Date into a student-friendly educational date.
 * Example: "26 September 2026"
 */
export function formatDate(timestamp: any): string {
  const date = toDate(timestamp);
  if (!date) return 'Today';

  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a Firebase Timestamp or Date into an exact date and real-time clock string.
 * Example: "26 Sep 2026, 6:35 PM"
 */
export function formatDateTime(timestamp: any): string {
  const date = toDate(timestamp);
  if (!date) return 'Just now';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Returns a relative "time ago" string for a Firebase Timestamp or Date.
 * Examples: "Just now", "5 mins ago", "2 hrs ago", "Yesterday", "3 days ago"
 * Falls back to formatDateTime() for older dates.
 */
export function timeAgo(timestamp: any): string {
  const date = toDate(timestamp);
  if (!date) return 'Just now';

  const now = Date.now();
  const diffMs = now - date.getTime();

  // If in the future by a few seconds due to slight clock drift, return Just now
  if (diffMs < 0 && Math.abs(diffMs) < 60000) return 'Just now';
  if (diffMs < 0) return formatDate(timestamp);

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 45) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk${Math.floor(days / 7) === 1 ? '' : 's'} ago`;

  // Older than 30 days → show short date + time
  return formatDateTime(timestamp);
}

/**
 * Strips HTML tags and collapses spaces to extract a crisp plain text preview
 */
export function extractPlainText(html: string, maxLength: number = 180): string {
  if (!html) return '';

  // Remove script and style tags and content
  let text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');

  // Replace br and closing p/div/h tags with space
  text = text.replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr)>/gi, ' ');
  text = text.replace(/<br\s*[\/]?>/gi, ' ');

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode basic HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Normalize consecutive whitespace
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Calculates estimated reading time in minutes
 */
export function getReadingTime(html: string): string {
  const text = extractPlainText(html, 10000);
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 180);
  return `${minutes || 1} min read`;
}
