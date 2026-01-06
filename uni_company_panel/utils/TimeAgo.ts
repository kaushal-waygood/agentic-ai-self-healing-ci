export function timeAgo(date: string | Date): string {
  const now = new Date().getTime();
  const past = new Date(date).getTime();

  const diffMs = now - past;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
}
