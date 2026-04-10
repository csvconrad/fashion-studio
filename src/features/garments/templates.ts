import type { GarmentTemplate } from '../../types/garment';

// ─── Color palette ──────────────────────────────────────────────────

export const colorPalette = [
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Creme', value: '#FFF8E7' },
  { name: 'Rose', value: '#F9A8D4' },
  { name: 'Fuchsia', value: '#EC4899' },
  { name: 'Rouge', value: '#DC2626' },
  { name: 'Corail', value: '#FB7185' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Jaune', value: '#FACC15' },
  { name: 'Vert', value: '#22C55E' },
  { name: 'Menthe', value: '#6EE7B7' },
  { name: 'Turquoise', value: '#06B6D4' },
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Marine', value: '#1E3A5F' },
  { name: 'Denim', value: '#4A6FA5' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Lavande', value: '#C4B5FD' },
  { name: 'Beige', value: '#D4A574' },
  { name: 'Gris', value: '#9CA3AF' },
  { name: 'Anthracite', value: '#4B5563' },
  { name: 'Noir', value: '#1A1A1A' },
];

// ─── Garment templates ──────────────────────────────────────────────
// All zone pathData is in 800x1000 canvas coordinates.
// viewBox is the tight bounding box for thumbnail rendering.
//
// To add a garment: define id, name, category, viewBox, and zones[].
// Each zone needs a unique id, display name, SVG path data, and default color.
// Matching .svg files in /assets/garments/ serve as visual reference.

export const garmentTemplates: GarmentTemplate[] = [
  // ── T-shirt ─────────────────────────────────
  {
    id: 'tshirt',
    name: 'T-shirt',
    category: 'top',
    viewBox: '90 160 620 490',
    zones: [
      {
        id: 'body',
        name: 'Corps',
        defaultColor: '#E0E0E0',
        pathData:
          'M 250,260 L 250,580 Q 325,615 400,620 Q 475,615 550,580 L 550,260 Z',
      },
      {
        id: 'left-sleeve',
        name: 'Manche gauche',
        defaultColor: '#D0D0D0',
        pathData: 'M 250,260 L 110,310 L 110,405 L 250,365 Z',
      },
      {
        id: 'right-sleeve',
        name: 'Manche droite',
        defaultColor: '#D0D0D0',
        pathData: 'M 550,260 L 690,310 L 690,405 L 550,365 Z',
      },
      {
        id: 'collar',
        name: 'Col',
        defaultColor: '#F0F0F0',
        pathData: 'M 320,258 Q 400,195 480,258 Q 400,295 320,258 Z',
      },
    ],
  },

  // ── Robe ────────────────────────────────────
  {
    id: 'dress',
    name: 'Robe',
    category: 'dress',
    viewBox: '120 140 560 690',
    zones: [
      {
        id: 'skirt',
        name: 'Jupe',
        defaultColor: '#E0E0E0',
        pathData:
          'M 270,440 L 150,760 Q 275,800 400,805 Q 525,800 650,760 L 530,440 Z',
      },
      {
        id: 'bodice',
        name: 'Corsage',
        defaultColor: '#D0D0D0',
        pathData:
          'M 270,220 L 270,440 L 530,440 L 530,220 Q 400,175 270,220 Z',
      },
      {
        id: 'neckline',
        name: 'Encolure',
        defaultColor: '#F0F0F0',
        pathData: 'M 335,218 Q 400,160 465,218 Q 400,255 335,218 Z',
      },
    ],
  },

  // ── Pantalon ────────────────────────────────
  {
    id: 'pants',
    name: 'Pantalon',
    category: 'bottom',
    viewBox: '180 150 440 640',
    zones: [
      {
        id: 'waistband',
        name: 'Ceinture',
        defaultColor: '#C8C8C8',
        pathData:
          'M 235,200 L 235,300 L 565,300 L 565,200 Q 400,168 235,200 Z',
      },
      {
        id: 'left-leg',
        name: 'Jambe gauche',
        defaultColor: '#E0E0E0',
        pathData: 'M 235,300 L 210,760 L 390,760 L 400,300 Z',
      },
      {
        id: 'right-leg',
        name: 'Jambe droite',
        defaultColor: '#E0E0E0',
        pathData: 'M 400,300 L 410,760 L 590,760 L 565,300 Z',
      },
    ],
  },

  // ── Casquette ───────────────────────────────
  {
    id: 'cap',
    name: 'Casquette',
    category: 'accessory',
    viewBox: '110 220 580 390',
    zones: [
      {
        id: 'crown',
        name: 'Calotte',
        defaultColor: '#E0E0E0',
        pathData: 'M 170,490 Q 170,250 400,250 Q 630,250 630,490 Z',
      },
      {
        id: 'visor',
        name: 'Visiere',
        defaultColor: '#C8C8C8',
        pathData:
          'M 140,485 L 140,530 Q 270,585 400,590 Q 530,585 660,530 L 660,485 Q 530,540 400,545 Q 270,540 140,485 Z',
      },
    ],
  },
];

/** Lookup helper */
export function getTemplate(id: string): GarmentTemplate | undefined {
  return garmentTemplates.find((t) => t.id === id);
}
