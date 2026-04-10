// ─── Brush definitions ───────────────────────────────────────────────
// Each brush defines visual behavior. The BrushEngine interprets these
// parameters to produce different stroke styles via perfect-freehand
// and Canvas2D rendering.

export type BrushCategory = 'base' | 'artistic' | 'effects';

export interface BrushDef {
  id: string;
  name: string;
  category: BrushCategory;
  // perfect-freehand options
  size: number;
  sizeRange: [number, number];
  thinning: number;       // -1 to 1: how much speed thins the stroke
  smoothing: number;      // 0 to 1
  streamline: number;     // 0 to 1
  taperStart: number;     // taper length at start
  taperEnd: number;       // taper length at end
  // rendering
  opacity: number;
  opacityRange: [number, number];
  compositeOp: GlobalCompositeOperation;
  // visual style
  style: 'solid' | 'textured' | 'spray' | 'glow';
  color?: string;         // override (for neon, rainbow)
  jitter: number;         // random displacement 0+
  dotSpacing: number;     // for spray: spacing between dots
  dotCount: number;       // for spray: dots per stamp
  glowRadius: number;     // for neon
}

export const BRUSH_CATEGORIES: { id: BrushCategory; name: string }[] = [
  { id: 'base', name: 'Base' },
  { id: 'artistic', name: 'Artistique' },
  { id: 'effects', name: 'Effets' },
];

const defaults: Omit<BrushDef, 'id' | 'name' | 'category'> = {
  size: 6,
  sizeRange: [1, 40],
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  taperStart: 0,
  taperEnd: 0,
  opacity: 1,
  opacityRange: [0.1, 1],
  compositeOp: 'source-over',
  style: 'solid',
  jitter: 0,
  dotSpacing: 0,
  dotCount: 0,
  glowRadius: 0,
};

function brush(id: string, name: string, category: BrushCategory, overrides: Partial<BrushDef>): BrushDef {
  return { ...defaults, id, name, category, ...overrides };
}

export const brushes: BrushDef[] = [
  // ── Base ──────────────────────────────────
  brush('pencil', 'Crayon', 'base', {
    size: 3, sizeRange: [1, 12], thinning: 0.6, smoothing: 0.3, streamline: 0.3,
    opacity: 0.85, jitter: 0.8,
  }),
  brush('pen', 'Feutre', 'base', {
    size: 4, sizeRange: [1, 16], thinning: 0.2, smoothing: 0.6, streamline: 0.6,
  }),
  brush('marker', 'Marqueur', 'base', {
    size: 16, sizeRange: [8, 50], thinning: 0, smoothing: 0.5, streamline: 0.4,
    opacity: 0.6, opacityRange: [0.2, 0.8],
  }),

  // ── Artistic ─────────────────────────────
  brush('watercolor', 'Aquarelle', 'artistic', {
    size: 20, sizeRange: [8, 60], thinning: 0.3, smoothing: 0.7, streamline: 0.3,
    taperStart: 10, taperEnd: 15,
    opacity: 0.35, opacityRange: [0.1, 0.5],
    style: 'textured', jitter: 1.5,
  }),
  brush('calligraphy', 'Calligraphie', 'artistic', {
    size: 8, sizeRange: [2, 30], thinning: 0.9, smoothing: 0.4, streamline: 0.5,
    taperStart: 20, taperEnd: 30,
  }),
  brush('flat', 'Pinceau plat', 'artistic', {
    size: 14, sizeRange: [4, 40], thinning: -0.5, smoothing: 0.5, streamline: 0.6,
    opacity: 0.8,
  }),

  // ── Effects ──────────────────────────────
  brush('neon', 'Neon', 'effects', {
    size: 6, sizeRange: [2, 20], thinning: 0.1, smoothing: 0.7, streamline: 0.7,
    style: 'glow', glowRadius: 12, opacity: 0.9,
  }),
  brush('spray', 'Spray', 'effects', {
    size: 30, sizeRange: [10, 80], thinning: 0, smoothing: 0.2, streamline: 0.1,
    style: 'spray', opacity: 0.7, dotSpacing: 3, dotCount: 20, jitter: 0,
  }),

  // ── Eraser (special) ─────────────────────
  brush('eraser', 'Gomme', 'base', {
    size: 20, sizeRange: [5, 60], thinning: 0, smoothing: 0.5, streamline: 0.5,
    compositeOp: 'destination-out', opacity: 1,
  }),
];

export function getBrush(id: string): BrushDef | undefined {
  return brushes.find((b) => b.id === id);
}
