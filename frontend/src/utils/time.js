// Utility helpers for time formatting and date grouping
import { format, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Format a timestamp into HH:MM (12-hr)
 */
export function formatTime(dateStr) {
  return format(new Date(dateStr), 'h:mm a');
}

/**
 * Format a timestamp into a short date label shown in conversation list
 */
export function formatConvoTime(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date))     return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

/**
 * Returns a human-readable label for a date group divider
 * e.g. "Today", "Yesterday", "Jun 20, 2026"
 */
export function getDateLabel(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date))     return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

/**
 * Groups an array of messages by calendar date.
 * Returns: [{ dateLabel, messages }]
 */
export function groupMessagesByDate(messages) {
  const groups = [];
  let currentLabel = null;
  let currentGroup = [];

  for (const msg of messages) {
    const label = getDateLabel(msg.createdAt);
    if (label !== currentLabel) {
      if (currentGroup.length > 0) {
        groups.push({ dateLabel: currentLabel, messages: currentGroup });
      }
      currentLabel = label;
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  }

  if (currentGroup.length > 0) {
    groups.push({ dateLabel: currentLabel, messages: currentGroup });
  }

  return groups;
}

/**
 * Format seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

/**
 * "Last seen" relative label
 */
export function formatLastSeen(dateStr) {
  if (!dateStr) return 'a while ago';
  const date = new Date(dateStr);
  if (isToday(date))     return `today at ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `yesterday at ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d \'at\' h:mm a');
}
