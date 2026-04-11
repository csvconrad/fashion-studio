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

// ─── Garment templates (realistic fashion flat sketches) ─────────────
// All paths use smooth Bezier curves for organic, body-like shapes.
// Each garment has 3 views: front, back, side.

export const garmentTemplates: GarmentTemplate[] = [
  // ═══ T-SHIRT ═══════════════════════════════════════
  {
    id: 'tshirt',
    name: 'T-shirt',
    category: 'top',
    viewBoxes: { front: '100 100 600 520', back: '100 100 600 520', side: '200 100 400 520' },
    views: {
      front: [
        { id: 'body', name: 'Corps', defaultColor: '#E8E8E8',
          pathData: 'M 270,210 C 270,210 265,240 260,300 C 255,380 258,440 260,520 C 260,540 280,560 400,560 C 520,560 540,540 540,520 C 542,440 545,380 540,300 C 535,240 530,210 530,210 Z' },
        { id: 'left-sleeve', name: 'Manche G', defaultColor: '#D8D8D8',
          pathData: 'M 270,210 C 250,215 200,230 160,260 C 130,280 115,310 120,340 C 125,360 140,370 160,365 C 180,358 210,340 240,320 C 255,310 265,290 270,270 Z' },
        { id: 'right-sleeve', name: 'Manche D', defaultColor: '#D8D8D8',
          pathData: 'M 530,210 C 550,215 600,230 640,260 C 670,280 685,310 680,340 C 675,360 660,370 640,365 C 620,358 590,340 560,320 C 545,310 535,290 530,270 Z' },
        { id: 'collar', name: 'Col', defaultColor: '#F0F0F0',
          pathData: 'M 310,200 C 320,175 350,155 400,150 C 450,155 480,175 490,200 C 480,215 450,225 400,228 C 350,225 320,215 310,200 Z' },
      ],
      back: [
        { id: 'body', name: 'Corps', defaultColor: '#E0E0E0',
          pathData: 'M 270,210 C 270,210 265,240 260,300 C 255,380 258,440 260,520 C 260,540 280,560 400,560 C 520,560 540,540 540,520 C 542,440 545,380 540,300 C 535,240 530,210 530,210 Z' },
        { id: 'left-sleeve', name: 'Manche G', defaultColor: '#D0D0D0',
          pathData: 'M 270,210 C 250,215 200,230 160,260 C 130,280 115,310 120,340 C 125,360 140,370 160,365 C 180,358 210,340 240,320 C 255,310 265,290 270,270 Z' },
        { id: 'right-sleeve', name: 'Manche D', defaultColor: '#D0D0D0',
          pathData: 'M 530,210 C 550,215 600,230 640,260 C 670,280 685,310 680,340 C 675,360 660,370 640,365 C 620,358 590,340 560,320 C 545,310 535,290 530,270 Z' },
        { id: 'collar', name: 'Col', defaultColor: '#EAEAEA',
          pathData: 'M 320,205 C 340,195 370,190 400,188 C 430,190 460,195 480,205 C 475,212 450,218 400,220 C 350,218 325,212 320,205 Z' },
      ],
      side: [
        { id: 'body', name: 'Corps', defaultColor: '#E0E0E0',
          pathData: 'M 350,210 C 340,240 330,300 325,380 C 322,440 325,500 330,540 C 340,555 420,555 440,540 C 445,500 448,440 445,380 C 440,300 435,240 430,210 Z' },
        { id: 'sleeve', name: 'Manche', defaultColor: '#D0D0D0',
          pathData: 'M 430,210 C 450,220 480,245 500,275 C 510,295 505,320 490,330 C 475,340 460,335 450,320 C 440,300 435,270 430,250 Z' },
        { id: 'collar', name: 'Col', defaultColor: '#EAEAEA',
          pathData: 'M 360,205 C 375,190 400,185 420,190 C 430,195 435,205 430,210 C 420,208 390,205 360,205 Z' },
      ],
    },
  },

  // ═══ ROBE ══════════════════════════════════════════
  {
    id: 'dress',
    name: 'Robe',
    category: 'dress',
    viewBoxes: { front: '80 100 640 750', back: '80 100 640 750', side: '180 100 440 750' },
    views: {
      front: [
        { id: 'skirt', name: 'Jupe', defaultColor: '#E8E8E8',
          pathData: 'M 280,400 C 260,470 220,580 180,700 C 175,720 200,760 400,760 C 600,760 625,720 620,700 C 580,580 540,470 520,400 Z' },
        { id: 'bodice', name: 'Corsage', defaultColor: '#D8D8D8',
          pathData: 'M 290,200 C 280,230 275,280 275,320 C 272,360 278,390 280,400 L 520,400 C 522,390 528,360 525,320 C 525,280 520,230 510,200 Z' },
        { id: 'left-strap', name: 'Bretelle G', defaultColor: '#D0D0D0',
          pathData: 'M 310,140 C 300,150 292,170 290,200 L 330,200 C 332,175 335,158 340,148 Z' },
        { id: 'right-strap', name: 'Bretelle D', defaultColor: '#D0D0D0',
          pathData: 'M 490,140 C 500,150 508,170 510,200 L 470,200 C 468,175 465,158 460,148 Z' },
        { id: 'neckline', name: 'Decollete', defaultColor: '#F0F0F0',
          pathData: 'M 330,200 C 350,215 375,222 400,225 C 425,222 450,215 470,200 C 460,190 440,182 400,180 C 360,182 340,190 330,200 Z' },
      ],
      back: [
        { id: 'skirt', name: 'Jupe', defaultColor: '#E0E0E0',
          pathData: 'M 280,400 C 260,470 220,580 180,700 C 175,720 200,760 400,760 C 600,760 625,720 620,700 C 580,580 540,470 520,400 Z' },
        { id: 'bodice', name: 'Corsage', defaultColor: '#D0D0D0',
          pathData: 'M 290,190 C 280,230 275,280 275,320 C 272,360 278,390 280,400 L 520,400 C 522,390 528,360 525,320 C 525,280 520,230 510,190 Z' },
        { id: 'left-strap', name: 'Bretelle G', defaultColor: '#C8C8C8',
          pathData: 'M 310,140 C 300,150 292,170 290,190 L 330,190 C 332,175 335,158 340,148 Z' },
        { id: 'right-strap', name: 'Bretelle D', defaultColor: '#C8C8C8',
          pathData: 'M 490,140 C 500,150 508,170 510,190 L 470,190 C 468,175 465,158 460,148 Z' },
      ],
      side: [
        { id: 'skirt', name: 'Jupe', defaultColor: '#E0E0E0',
          pathData: 'M 340,400 C 320,470 280,580 260,700 C 260,730 320,750 400,750 C 460,750 480,730 475,700 C 460,580 440,470 430,400 Z' },
        { id: 'bodice', name: 'Corsage', defaultColor: '#D0D0D0',
          pathData: 'M 350,200 C 340,250 335,320 340,400 L 430,400 C 435,320 432,250 425,200 Z' },
        { id: 'strap', name: 'Bretelle', defaultColor: '#C8C8C8',
          pathData: 'M 365,145 C 355,160 350,180 350,200 L 380,200 C 382,180 385,165 390,155 Z' },
      ],
    },
  },

  // ═══ PANTALON ══════════════════════════════════════
  {
    id: 'pants',
    name: 'Pantalon',
    category: 'bottom',
    viewBoxes: { front: '130 120 540 680', back: '130 120 540 680', side: '200 120 400 680' },
    views: {
      front: [
        { id: 'waistband', name: 'Ceinture', defaultColor: '#C8C8C8',
          pathData: 'M 230,170 C 280,155 350,148 400,148 C 450,148 520,155 570,170 L 565,220 C 520,210 460,205 400,205 C 340,205 280,210 235,220 Z' },
        { id: 'left-leg', name: 'Jambe G', defaultColor: '#E0E0E0',
          pathData: 'M 235,220 C 240,300 245,400 240,500 C 235,580 228,660 225,720 C 225,740 250,755 310,755 C 360,755 380,745 382,730 C 385,660 390,580 392,500 C 395,420 398,340 400,280 Z' },
        { id: 'right-leg', name: 'Jambe D', defaultColor: '#E0E0E0',
          pathData: 'M 565,220 C 560,300 555,400 560,500 C 565,580 572,660 575,720 C 575,740 550,755 490,755 C 440,755 420,745 418,730 C 415,660 410,580 408,500 C 405,420 402,340 400,280 Z' },
      ],
      back: [
        { id: 'waistband', name: 'Ceinture', defaultColor: '#C0C0C0',
          pathData: 'M 230,170 C 280,155 350,148 400,148 C 450,148 520,155 570,170 L 565,220 C 520,210 460,205 400,205 C 340,205 280,210 235,220 Z' },
        { id: 'left-leg', name: 'Jambe G', defaultColor: '#D8D8D8',
          pathData: 'M 235,220 C 240,300 245,400 240,500 C 235,580 228,660 225,720 C 225,740 250,755 310,755 C 360,755 380,745 382,730 C 385,660 390,580 392,500 C 395,420 398,340 400,280 Z' },
        { id: 'right-leg', name: 'Jambe D', defaultColor: '#D8D8D8',
          pathData: 'M 565,220 C 560,300 555,400 560,500 C 565,580 572,660 575,720 C 575,740 550,755 490,755 C 440,755 420,745 418,730 C 415,660 410,580 408,500 C 405,420 402,340 400,280 Z' },
        { id: 'pocket-detail', name: 'Poches', defaultColor: '#CACACA',
          pathData: 'M 300,260 C 310,280 330,300 360,300 C 370,290 370,270 360,260 Z M 500,260 C 490,280 470,300 440,300 C 430,290 430,270 440,260 Z' },
      ],
      side: [
        { id: 'waistband', name: 'Ceinture', defaultColor: '#C0C0C0',
          pathData: 'M 310,170 C 350,158 400,155 450,165 L 445,215 C 410,208 360,208 320,215 Z' },
        { id: 'leg', name: 'Jambe', defaultColor: '#D8D8D8',
          pathData: 'M 320,215 C 315,300 310,420 305,540 C 302,630 300,700 300,730 C 305,750 350,755 400,750 C 440,745 455,735 455,720 C 452,660 448,580 445,500 C 440,400 438,300 445,215 Z' },
      ],
    },
  },

  // ═══ CASQUETTE ═════════════════════════════════════
  {
    id: 'cap',
    name: 'Casquette',
    category: 'accessory',
    viewBoxes: { front: '100 180 600 370', back: '100 180 600 320', side: '120 180 560 370' },
    views: {
      front: [
        { id: 'crown', name: 'Calotte', defaultColor: '#E0E0E0',
          pathData: 'M 180,440 C 180,350 220,280 300,240 C 350,220 450,220 500,240 C 580,280 620,350 620,440 Z' },
        { id: 'visor', name: 'Visiere', defaultColor: '#C8C8C8',
          pathData: 'M 160,435 C 160,460 250,500 400,505 C 550,500 640,460 640,435 C 630,430 540,440 400,442 C 260,440 170,430 160,435 Z' },
        { id: 'button', name: 'Bouton', defaultColor: '#B0B0B0',
          pathData: 'M 392,205 C 395,198 405,198 408,205 C 410,212 405,218 400,218 C 395,218 390,212 392,205 Z' },
      ],
      back: [
        { id: 'crown', name: 'Calotte', defaultColor: '#D8D8D8',
          pathData: 'M 180,430 C 180,350 220,280 300,245 C 350,225 450,225 500,245 C 580,280 620,350 620,430 Z' },
        { id: 'strap', name: 'Sangle', defaultColor: '#B0B0B0',
          pathData: 'M 300,430 C 320,438 370,442 400,442 C 430,442 480,438 500,430 L 498,445 C 475,452 430,455 400,455 C 370,455 325,452 302,445 Z' },
      ],
      side: [
        { id: 'crown', name: 'Calotte', defaultColor: '#E0E0E0',
          pathData: 'M 220,440 C 220,350 260,280 340,240 C 400,220 480,230 530,260 C 580,300 600,360 600,440 Z' },
        { id: 'visor', name: 'Visiere', defaultColor: '#C8C8C8',
          pathData: 'M 600,435 C 620,440 660,460 670,480 C 672,490 660,495 640,490 C 620,485 600,470 590,450 Z' },
      ],
    },
  },
];

export function getTemplate(id: string): GarmentTemplate | undefined {
  return garmentTemplates.find((t) => t.id === id);
}
