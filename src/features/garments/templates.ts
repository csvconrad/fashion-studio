import type { GarmentTemplate, Color, Pattern } from '../../types';

// === Gabarits de vêtements Phase 1 ===
// SVG paths simplifiés pour un look amusant et enfantin

export const garmentTemplates: GarmentTemplate[] = [
  {
    id: 'tshirt',
    name: 'T-shirt',
    category: 'top',
    svgPath:
      'M 30 0 L 0 25 L 15 35 L 15 80 L 65 80 L 65 35 L 80 25 L 50 0 Q 40 10 30 0 Z',
    defaultPosition: { x: 200, y: 120 },
    defaultScale: { x: 2.2, y: 2.2 },
  },
  {
    id: 'skirt',
    name: 'Jupe',
    category: 'bottom',
    svgPath:
      'M 15 0 L 65 0 L 80 70 Q 40 75 0 70 Z',
    defaultPosition: { x: 205, y: 310 },
    defaultScale: { x: 2.2, y: 2.2 },
  },
  {
    id: 'pants',
    name: 'Pantalon',
    category: 'bottom',
    svgPath:
      'M 10 0 L 70 0 L 70 90 L 45 90 L 40 30 L 35 90 L 10 90 Z',
    defaultPosition: { x: 210, y: 310 },
    defaultScale: { x: 2.0, y: 2.0 },
  },
  {
    id: 'dress',
    name: 'Robe',
    category: 'dress',
    svgPath:
      'M 30 0 L 0 25 L 15 35 L 5 100 Q 40 105 75 100 L 65 35 L 80 25 L 50 0 Q 40 10 30 0 Z',
    defaultPosition: { x: 200, y: 120 },
    defaultScale: { x: 2.2, y: 2.5 },
  },
  {
    id: 'hat',
    name: 'Chapeau',
    category: 'accessory',
    svgPath:
      'M 10 30 Q 10 5 40 5 Q 70 5 70 30 L 80 35 L 0 35 Z',
    defaultPosition: { x: 225, y: 30 },
    defaultScale: { x: 2.0, y: 2.0 },
  },
  {
    id: 'shoes',
    name: 'Chaussures',
    category: 'shoes',
    svgPath:
      'M 5 0 L 5 15 L 0 20 L 35 20 L 35 10 L 25 0 Z',
    defaultPosition: { x: 220, y: 530 },
    defaultScale: { x: 2.5, y: 2.5 },
  },
];

// === Palette de couleurs fun Phase 1 ===
export const colorPalette: Color[] = [
  { name: 'Rose bonbon', value: '#FF6B9D' },
  { name: 'Violet', value: '#C084FC' },
  { name: 'Bleu ciel', value: '#7DD3FC' },
  { name: 'Vert menthe', value: '#6EE7B7' },
  { name: 'Jaune soleil', value: '#FDE047' },
  { name: 'Orange', value: '#FB923C' },
  { name: 'Rouge', value: '#F87171' },
  { name: 'Turquoise', value: '#2DD4BF' },
  { name: 'Lavande', value: '#DDD6FE' },
  { name: 'Corail', value: '#FDA4AF' },
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Noir', value: '#1F2937' },
];

// === Motifs prédéfinis Phase 1 ===
export const patternPresets: Pattern[] = [
  {
    id: 'solid',
    name: 'Uni',
    type: 'solid',
    preview: '',
  },
  {
    id: 'dots',
    name: 'Pois',
    type: 'dots',
    preview:
      'radial-gradient(circle, #fff 2px, transparent 2px)',
  },
  {
    id: 'stripes-h',
    name: 'Rayures',
    type: 'stripes',
    preview:
      'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)',
  },
  {
    id: 'plaid',
    name: 'Carreaux',
    type: 'plaid',
    preview:
      'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px), repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)',
  },
  {
    id: 'stars',
    name: 'Etoiles',
    type: 'custom',
    preview:
      'radial-gradient(circle, #FFD700 1px, transparent 1px)',
  },
];
