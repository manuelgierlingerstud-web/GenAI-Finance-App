/**
 * Security rendering helpers: HTML escaping and safe URL validation.
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    // Disallow javascript: or data: inside http(s) check
    if (trimmed.toLowerCase().includes('javascript:') || trimmed.toLowerCase().includes('data:')) {
      return '#';
    }
    return escapeHTML(trimmed);
  }
  return '#';
}
