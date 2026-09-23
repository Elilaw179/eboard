/**
 * Formats a Firebase Timestamp or Date into a student-friendly educational date
 * Example: "September 21, 2026"
 */
export function formatDate(timestamp: any): string {
  if (!timestamp) return 'Recent';

  let date: Date;

  if (typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    return 'Recent';
  }

  if (isNaN(date.getTime())) return 'Recent';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
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
