// ─── Iconify API client ──────────────────────────────────────────────
// Fetches SVG icons from the Iconify public API (200,000+ icons).
// No API key needed, free and open.

const API_BASE = 'https://api.iconify.design';

export interface IconifyIcon {
  prefix: string;       // e.g. "noto"
  name: string;         // e.g. "dog"
  fullName: string;     // "noto:dog"
}

export interface IconifySearchResult {
  icons: IconifyIcon[];
  total: number;
}

/** Search for icons by keyword */
export async function searchIcons(
  query: string,
  limit = 40,
  prefixes?: string[],
): Promise<IconifySearchResult> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  if (prefixes?.length) params.set('prefixes', prefixes.join(','));

  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) return { icons: [], total: 0 };

  const data = await res.json();
  const icons: IconifyIcon[] = (data.icons ?? []).map((fullName: string) => {
    const [prefix, ...rest] = fullName.split(':');
    return { prefix, name: rest.join(':'), fullName };
  });

  return { icons, total: data.total ?? icons.length };
}

/** Get SVG string for a specific icon */
export async function getIconSvg(prefix: string, name: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/${prefix}/${name}.svg`);
  if (!res.ok) return null;
  return res.text();
}

/** Get SVG data URL for preview */
export async function getIconDataUrl(prefix: string, name: string): Promise<string | null> {
  const svg = await getIconSvg(prefix, name);
  if (!svg) return null;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
