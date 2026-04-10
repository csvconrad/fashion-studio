// ─── Parametric shape generator ──────────────────────────────────────
// All shapes produce SVG path data in a 100x100 coordinate space.
// They are placed on the canvas and scaled as needed.

export type ShapeCategory = 'basic' | 'arrows' | 'bubbles' | 'banners';

export interface GeoShape {
  id: string;
  name: string;
  category: ShapeCategory;
  pathData: string;
}

export const SHAPE_CATEGORIES: { id: ShapeCategory; name: string }[] = [
  { id: 'basic', name: 'Formes' },
  { id: 'arrows', name: 'Fleches' },
  { id: 'bubbles', name: 'Bulles' },
  { id: 'banners', name: 'Bannieres' },
];

// ─── Generators ──────────────────────────────────────────────────────

function polygon(sides: number, cx = 50, cy = 50, r = 45): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

function star(points: number, cx = 50, cy = 50, outer = 45, inner = 20): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

// ─── Shape definitions ───────────────────────────────────────────────

export const geoShapes: GeoShape[] = [
  // ── Basic ────────────────────────────
  { id: 'circle', name: 'Cercle', category: 'basic',
    pathData: 'M 50,5 A 45,45 0 1,1 49.99,5 Z' },
  { id: 'square', name: 'Carre', category: 'basic',
    pathData: 'M 10,10 L 90,10 L 90,90 L 10,90 Z' },
  { id: 'rect', name: 'Rectangle', category: 'basic',
    pathData: 'M 5,20 L 95,20 L 95,80 L 5,80 Z' },
  { id: 'rounded-rect', name: 'Rect arrondi', category: 'basic',
    pathData: 'M 20,10 L 80,10 Q 90,10 90,20 L 90,80 Q 90,90 80,90 L 20,90 Q 10,90 10,80 L 10,20 Q 10,10 20,10 Z' },
  { id: 'triangle', name: 'Triangle', category: 'basic', pathData: polygon(3) },
  { id: 'diamond', name: 'Losange', category: 'basic',
    pathData: 'M 50,5 L 95,50 L 50,95 L 5,50 Z' },
  { id: 'pentagon', name: 'Pentagone', category: 'basic', pathData: polygon(5) },
  { id: 'hexagon', name: 'Hexagone', category: 'basic', pathData: polygon(6) },
  { id: 'octagon', name: 'Octogone', category: 'basic', pathData: polygon(8) },
  { id: 'star5', name: 'Etoile 5', category: 'basic', pathData: star(5) },
  { id: 'star6', name: 'Etoile 6', category: 'basic', pathData: star(6) },
  { id: 'star8', name: 'Etoile 8', category: 'basic', pathData: star(8, 50, 50, 45, 25) },
  { id: 'cross', name: 'Croix', category: 'basic',
    pathData: 'M 35,5 L 65,5 L 65,35 L 95,35 L 95,65 L 65,65 L 65,95 L 35,95 L 35,65 L 5,65 L 5,35 L 35,35 Z' },
  { id: 'heart', name: 'Coeur', category: 'basic',
    pathData: 'M 50,88 C 90,68 98,42 98,30 C 98,14 86,2 72,2 C 62,2 54,8 50,18 C 46,8 38,2 28,2 C 14,2 2,14 2,30 C 2,42 10,68 50,88 Z' },
  { id: 'crescent', name: 'Lune', category: 'basic',
    pathData: 'M 70,8 A 44,44 0 1,0 70,92 A 34,34 0 1,1 70,8 Z' },

  // ── Arrows ───────────────────────────
  { id: 'arrow-right', name: 'Fleche droite', category: 'arrows',
    pathData: 'M 5,35 L 60,35 L 60,15 L 95,50 L 60,85 L 60,65 L 5,65 Z' },
  { id: 'arrow-left', name: 'Fleche gauche', category: 'arrows',
    pathData: 'M 95,35 L 40,35 L 40,15 L 5,50 L 40,85 L 40,65 L 95,65 Z' },
  { id: 'arrow-up', name: 'Fleche haut', category: 'arrows',
    pathData: 'M 35,95 L 35,40 L 15,40 L 50,5 L 85,40 L 65,40 L 65,95 Z' },
  { id: 'arrow-down', name: 'Fleche bas', category: 'arrows',
    pathData: 'M 35,5 L 35,60 L 15,60 L 50,95 L 85,60 L 65,60 L 65,5 Z' },
  { id: 'arrow-double-h', name: 'Double horiz.', category: 'arrows',
    pathData: 'M 5,50 L 25,30 L 25,42 L 75,42 L 75,30 L 95,50 L 75,70 L 75,58 L 25,58 L 25,70 Z' },
  { id: 'arrow-double-v', name: 'Double vert.', category: 'arrows',
    pathData: 'M 50,5 L 70,25 L 58,25 L 58,75 L 70,75 L 50,95 L 30,75 L 42,75 L 42,25 L 30,25 Z' },
  { id: 'arrow-curved', name: 'Fleche courbee', category: 'arrows',
    pathData: 'M 15,80 Q 15,20 50,20 L 50,8 L 80,28 L 50,48 L 50,35 Q 30,35 30,80 Z' },
  { id: 'chevron-right', name: 'Chevron droite', category: 'arrows',
    pathData: 'M 25,5 L 75,50 L 25,95 L 40,95 L 90,50 L 40,5 Z' },
  { id: 'arrow-fat', name: 'Fleche large', category: 'arrows',
    pathData: 'M 5,25 L 55,25 L 55,5 L 95,50 L 55,95 L 55,75 L 5,75 Z' },
  { id: 'arrow-circle', name: 'Fleche cercle', category: 'arrows',
    pathData: 'M 50,10 A 35,35 0 1,1 15,50 L 5,50 L 20,30 L 35,50 L 25,50 A 25,25 0 1,0 50,20 Z' },

  // ── Bubbles ──────────────────────────
  { id: 'bubble-round', name: 'Bulle ronde', category: 'bubbles',
    pathData: 'M 50,10 Q 90,10 90,40 Q 90,65 60,65 L 40,85 L 45,65 Q 10,65 10,40 Q 10,10 50,10 Z' },
  { id: 'bubble-square', name: 'Bulle carree', category: 'bubbles',
    pathData: 'M 10,10 L 90,10 L 90,60 L 55,60 L 35,85 L 40,60 L 10,60 Z' },
  { id: 'bubble-cloud', name: 'Bulle nuage', category: 'bubbles',
    pathData: 'M 25,55 Q 5,55 8,40 Q 5,25 20,22 Q 22,8 40,10 Q 55,5 65,15 Q 80,8 88,22 Q 98,30 92,45 Q 98,55 80,58 L 55,58 L 40,78 L 42,58 Z' },
  { id: 'bubble-thought', name: 'Bulle pensee', category: 'bubbles',
    pathData: 'M 50,10 Q 85,10 85,35 Q 85,55 60,58 Q 10,62 10,35 Q 10,10 50,10 Z M 38,62 A 5,5 0 1,1 42,68 M 30,72 A 3,3 0 1,1 33,76' },
  { id: 'bubble-shout', name: 'Bulle cri', category: 'bubbles',
    pathData: 'M 50,5 L 58,18 L 75,8 L 70,25 L 92,22 L 80,38 L 98,45 L 82,55 L 92,72 L 72,65 L 75,85 L 58,72 L 50,90 L 42,72 L 25,85 L 28,65 L 8,72 L 18,55 L 2,45 L 20,38 L 8,22 L 30,25 L 25,8 L 42,18 Z' },
  { id: 'bubble-whisper', name: 'Bulle murmure', category: 'bubbles',
    pathData: 'M 50,15 Q 85,15 85,40 Q 85,60 55,62 L 45,75 L 48,62 Q 15,60 15,40 Q 15,15 50,15 Z' },

  // ── Banners ──────────────────────────
  { id: 'banner-ribbon', name: 'Ruban', category: 'banners',
    pathData: 'M 2,25 L 15,25 L 15,15 L 85,15 L 85,25 L 98,25 L 90,35 L 98,45 L 85,45 L 85,55 L 15,55 L 15,45 L 2,45 L 10,35 Z' },
  { id: 'banner-wave', name: 'Bandeau vague', category: 'banners',
    pathData: 'M 5,25 Q 25,15 50,25 Q 75,35 95,25 L 95,55 Q 75,65 50,55 Q 25,45 5,55 Z' },
  { id: 'banner-fold', name: 'Bandeau plie', category: 'banners',
    pathData: 'M 5,20 L 20,20 L 20,30 L 80,30 L 80,20 L 95,20 L 95,70 L 80,70 L 80,60 L 20,60 L 20,70 L 5,70 Z' },
  { id: 'banner-flag', name: 'Drapeau', category: 'banners',
    pathData: 'M 15,5 L 15,95 M 15,10 L 85,10 Q 95,30 85,50 L 15,50' },
  { id: 'banner-scroll', name: 'Parchemin', category: 'banners',
    pathData: 'M 10,20 Q 10,10 20,10 L 80,10 Q 90,10 90,20 L 90,70 Q 90,85 80,85 Q 92,85 92,75 L 92,25 Q 92,15 85,15 L 18,15 Q 8,15 8,25 L 8,80 Q 8,90 18,90 L 80,90 Q 90,90 90,80' },
  { id: 'banner-tag', name: 'Etiquette', category: 'banners',
    pathData: 'M 10,15 L 75,15 L 95,50 L 75,85 L 10,85 Z M 78,50 A 4,4 0 1,1 82,50 A 4,4 0 1,1 78,50 Z' },
];

export function getGeoShape(id: string): GeoShape | undefined {
  return geoShapes.find((s) => s.id === id);
}
