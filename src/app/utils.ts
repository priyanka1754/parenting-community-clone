export function resolveImageUrl(url: string, fallback: string = '/assets/user-img.png'): string {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `http://localhost:3000${url}`;
  if (url.startsWith('uploads')) return `http://localhost:3000/${url}`;
  return url;
}
