/**
 * Returns 1-2 uppercase initials from a name string.
 */
export function getInitials(name = '') {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Deterministic HSL color from a string (for avatar backgrounds)
 */
export function colorFromString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  // Use low-lightness, medium-saturation for dark-theme avatars
  return `hsl(${hue}, 55%, 35%)`;
}

/**
 * Returns foreground text color for a given hsl background
 */
export function contrastColor() {
  return '#f0f4ff'; // always light on dark avatar bg
}
