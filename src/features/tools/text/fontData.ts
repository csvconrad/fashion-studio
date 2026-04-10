// ─── Font library ────────────────────────────────────────────────────
// 60 Google Fonts, loaded on-demand via the CSS API.

export type FontCategory = 'serif' | 'sans' | 'script' | 'display' | 'handwriting' | 'mono';

export interface FontDef {
  family: string;
  category: FontCategory;
  weights: number[];    // available weights
}

export const FONT_CATEGORIES: { id: FontCategory; name: string }[] = [
  { id: 'sans', name: 'Sans-serif' },
  { id: 'serif', name: 'Serif' },
  { id: 'script', name: 'Script' },
  { id: 'display', name: 'Display' },
  { id: 'handwriting', name: 'Manuscrit' },
  { id: 'mono', name: 'Mono' },
];

export const fonts: FontDef[] = [
  // ── Sans-serif (15) ────────────────
  { family: 'Inter', category: 'sans', weights: [300, 400, 500, 600, 700, 800, 900] },
  { family: 'Montserrat', category: 'sans', weights: [300, 400, 500, 600, 700, 800, 900] },
  { family: 'Poppins', category: 'sans', weights: [300, 400, 500, 600, 700, 800, 900] },
  { family: 'Raleway', category: 'sans', weights: [300, 400, 500, 600, 700, 800, 900] },
  { family: 'Oswald', category: 'sans', weights: [300, 400, 500, 600, 700] },
  { family: 'Bebas Neue', category: 'sans', weights: [400] },
  { family: 'Nunito', category: 'sans', weights: [300, 400, 600, 700, 800] },
  { family: 'Quicksand', category: 'sans', weights: [300, 400, 500, 600, 700] },
  { family: 'Rubik', category: 'sans', weights: [300, 400, 500, 600, 700, 800, 900] },
  { family: 'Comfortaa', category: 'sans', weights: [300, 400, 500, 600, 700] },
  { family: 'Barlow Condensed', category: 'sans', weights: [400, 500, 600, 700, 800] },
  { family: 'Josefin Sans', category: 'sans', weights: [300, 400, 500, 600, 700] },
  { family: 'DM Sans', category: 'sans', weights: [400, 500, 700] },
  { family: 'Outfit', category: 'sans', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Space Grotesk', category: 'sans', weights: [300, 400, 500, 600, 700] },

  // ── Serif (10) ─────────────────────
  { family: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900] },
  { family: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900] },
  { family: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { family: 'Cormorant', category: 'serif', weights: [300, 400, 500, 600, 700] },
  { family: 'EB Garamond', category: 'serif', weights: [400, 500, 600, 700, 800] },
  { family: 'Bitter', category: 'serif', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Libre Baskerville', category: 'serif', weights: [400, 700] },
  { family: 'Crimson Text', category: 'serif', weights: [400, 600, 700] },
  { family: 'DM Serif Display', category: 'serif', weights: [400] },
  { family: 'Bodoni Moda', category: 'serif', weights: [400, 500, 600, 700, 800, 900] },

  // ── Script (15) ────────────────────
  { family: 'Dancing Script', category: 'script', weights: [400, 500, 600, 700] },
  { family: 'Pacifico', category: 'script', weights: [400] },
  { family: 'Caveat', category: 'script', weights: [400, 500, 600, 700] },
  { family: 'Satisfy', category: 'script', weights: [400] },
  { family: 'Great Vibes', category: 'script', weights: [400] },
  { family: 'Sacramento', category: 'script', weights: [400] },
  { family: 'Allura', category: 'script', weights: [400] },
  { family: 'Tangerine', category: 'script', weights: [400, 700] },
  { family: 'Alex Brush', category: 'script', weights: [400] },
  { family: 'Kaushan Script', category: 'script', weights: [400] },
  { family: 'Courgette', category: 'script', weights: [400] },
  { family: 'Cookie', category: 'script', weights: [400] },
  { family: 'Yellowtail', category: 'script', weights: [400] },
  { family: 'Lobster Two', category: 'script', weights: [400, 700] },
  { family: 'Permanent Marker', category: 'script', weights: [400] },

  // ── Display (10) ───────────────────
  { family: 'Bungee', category: 'display', weights: [400] },
  { family: 'Monoton', category: 'display', weights: [400] },
  { family: 'Lobster', category: 'display', weights: [400] },
  { family: 'Creepster', category: 'display', weights: [400] },
  { family: 'Righteous', category: 'display', weights: [400] },
  { family: 'Fredoka', category: 'display', weights: [300, 400, 500, 600, 700] },
  { family: 'Abril Fatface', category: 'display', weights: [400] },
  { family: 'Bungee Shade', category: 'display', weights: [400] },
  { family: 'Titan One', category: 'display', weights: [400] },
  { family: 'Bangers', category: 'display', weights: [400] },

  // ── Handwriting (5) ────────────────
  { family: 'Kalam', category: 'handwriting', weights: [300, 400, 700] },
  { family: 'Shadows Into Light', category: 'handwriting', weights: [400] },
  { family: 'Indie Flower', category: 'handwriting', weights: [400] },
  { family: 'Patrick Hand', category: 'handwriting', weights: [400] },
  { family: 'Architects Daughter', category: 'handwriting', weights: [400] },

  // ── Monospace (5) ──────────────────
  { family: 'JetBrains Mono', category: 'mono', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Fira Code', category: 'mono', weights: [300, 400, 500, 600, 700] },
  { family: 'Source Code Pro', category: 'mono', weights: [300, 400, 500, 600, 700, 800, 900] },
  { family: 'Space Mono', category: 'mono', weights: [400, 700] },
  { family: 'IBM Plex Mono', category: 'mono', weights: [300, 400, 500, 600, 700] },
];

// ─── Dynamic loader ──────────────────────────────────────────────────

const loadedFonts = new Set<string>();

export function loadFont(family: string, weight = 400): Promise<void> {
  const key = `${family}:${weight}`;
  if (loadedFonts.has(key)) return Promise.resolve();

  return new Promise((resolve) => {
    const encoded = family.replace(/ /g, '+');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@${weight}&display=swap`;
    link.onload = () => { loadedFonts.add(key); resolve(); };
    link.onerror = () => resolve(); // silently fail
    document.head.appendChild(link);
  });
}

/** Preload a font family with its default weight for preview */
export function preloadFont(family: string) {
  const def = fonts.find((f) => f.family === family);
  const weight = def?.weights.includes(400) ? 400 : def?.weights[0] ?? 400;
  loadFont(family, weight);
}
