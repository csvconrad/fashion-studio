// ─── Color conversion utilities ──────────────────────────────────────

export interface HSL { h: number; s: number; l: number }
export interface RGB { r: number; g: number; b: number }

export function hexToRgb(hex: string): RGB {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

// ─── Harmony generators ──────────────────────────────────────────────

export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';

export function generateHarmony(baseHex: string, type: HarmonyType): string[] {
  const { h, s, l } = hexToHsl(baseHex);
  switch (type) {
    case 'complementary':
      return [baseHex, hslToHex((h + 180) % 360, s, l)];
    case 'analogous':
      return [hslToHex((h - 30 + 360) % 360, s, l), baseHex, hslToHex((h + 30) % 360, s, l)];
    case 'triadic':
      return [baseHex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case 'tetradic':
      return [baseHex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
    case 'monochromatic':
      return [
        hslToHex(h, s, Math.max(0.1, l - 0.3)),
        hslToHex(h, s, Math.max(0.15, l - 0.15)),
        baseHex,
        hslToHex(h, s, Math.min(0.85, l + 0.15)),
        hslToHex(h, s, Math.min(0.9, l + 0.3)),
      ];
  }
}

export const HARMONY_TYPES: { id: HarmonyType; name: string }[] = [
  { id: 'complementary', name: 'Complementaire' },
  { id: 'analogous', name: 'Analogue' },
  { id: 'triadic', name: 'Triadique' },
  { id: 'tetradic', name: 'Tetradique' },
  { id: 'monochromatic', name: 'Monochrome' },
];
