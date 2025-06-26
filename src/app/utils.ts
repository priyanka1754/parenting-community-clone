/**
 * Centralized image URL resolver utility
 * Handles different image URL formats and provides fallbacks
 */

export function resolveImageUrl(url: string, fallback: string = '/assets/user-img.png'): string {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `http://localhost:3000${url}`;
  if (url.startsWith('uploads')) return `http://localhost:3000/${url}`;
  return url;
}

/**
 * Specialized resolver for user avatars
 */
export function getAvatarUrl(user: any): string {
  if (!user) return '/assets/user-img.png';
  return resolveImageUrl(user.avatar || user.profilePicture, '/assets/user-img.png');
}

/**
 * Specialized resolver for community images
 */
export function getCommunityImageUrl(community: any): string {
  if (!community) return '/assets/community-default.png';
  return resolveImageUrl(community.image, '/assets/community-default.png');
}

/**
 * Specialized resolver for group images
 */
export function getGroupImageUrl(group: any): string {
  if (!group) return '/assets/group-default.png';
  return resolveImageUrl(group.image, '/assets/group-default.png');
}

/**
 * Specialized resolver for event images
 */
export function getEventImageUrl(event: any): string {
  if (!event) return '/assets/event-default.png';
  return resolveImageUrl(event.image, '/assets/event-default.png');
}

/**
 * Specialized resolver for post media
 */
export function getPostMediaUrl(mediaUrl: string): string {
  return resolveImageUrl(mediaUrl, '/assets/media-placeholder.png');
}

/**
 * Get initials from name for avatar fallback
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Generate a color based on name for avatar background
 */
export function getAvatarColor(name: string): string {
  if (!name) return '#6B7280';
  
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

