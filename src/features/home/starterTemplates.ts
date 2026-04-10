// ─── Starter templates ───────────────────────────────────────────────
// Pre-made designs that users can open and customize.
// Each template defines a garment + some decorative elements.

export interface StarterTemplate {
  id: string;
  name: string;
  desc: string;
  icon: string;
  garmentId: string;       // garment template to load
  zoneColors: Record<string, string>;  // zone id → color
}

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'pink-tshirt',
    name: 'T-shirt Rose',
    desc: 'Un t-shirt rose bonbon classique',
    icon: '\u{1F455}',
    garmentId: 'tshirt',
    zoneColors: { 'body': '#F9A8D4', 'left-sleeve': '#EC4899', 'right-sleeve': '#EC4899', 'collar': '#FBCFE8' },
  },
  {
    id: 'denim-pants',
    name: 'Jean Bleu',
    desc: 'Un pantalon en denim classique',
    icon: '\u{1F456}',
    garmentId: 'pants',
    zoneColors: { 'waistband': '#1E3A5F', 'left-leg': '#4A6FA5', 'right-leg': '#4A6FA5' },
  },
  {
    id: 'summer-dress',
    name: 'Robe d\'Ete',
    desc: 'Une robe jaune soleil',
    icon: '\u{1F457}',
    garmentId: 'dress',
    zoneColors: { 'bodice': '#FACC15', 'skirt': '#FDE68A', 'neckline': '#FFFBEB' },
  },
  {
    id: 'rainbow-tshirt',
    name: 'T-shirt Arc-en-ciel',
    desc: 'Toutes les couleurs !',
    icon: '\u{1F308}',
    garmentId: 'tshirt',
    zoneColors: { 'body': '#FFFFFF', 'left-sleeve': '#EC4899', 'right-sleeve': '#3B82F6', 'collar': '#FACC15' },
  },
  {
    id: 'cool-cap',
    name: 'Casquette Cool',
    desc: 'Une casquette violette',
    icon: '\u{1F9E2}',
    garmentId: 'cap',
    zoneColors: { 'crown': '#8B5CF6', 'visor': '#6D28D9' },
  },
];
