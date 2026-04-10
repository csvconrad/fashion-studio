// ─── Predefined text style templates ─────────────────────────────────
// Click-to-apply combinations of font, size, weight, color, effects.

export interface TextTemplate {
  id: string;
  name: string;
  preview: string;          // text shown in preview
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: '' | 'italic';
  fill: string;
  textAlign: string;
  // Effects
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  charSpacing?: number;     // Fabric.js charSpacing (in 1/1000 em)
  lineHeight?: number;
  textTransform?: 'upper' | 'lower' | 'none';
}

export const textTemplates: TextTemplate[] = [
  // ── Bold & Modern ─────────────────
  {
    id: 'hero-bold', name: 'Titre Hero', preview: 'BOLD',
    fontFamily: 'Bebas Neue', fontSize: 72, fontWeight: 400, fontStyle: '',
    fill: '#1A1A1A', textAlign: 'center', charSpacing: 200, textTransform: 'upper',
  },
  {
    id: 'modern-minimal', name: 'Minimal', preview: 'clean',
    fontFamily: 'Inter', fontSize: 36, fontWeight: 300, fontStyle: '',
    fill: '#374151', textAlign: 'center', charSpacing: 400,
  },
  {
    id: 'neon-glow', name: 'Neon', preview: 'GLOW',
    fontFamily: 'Montserrat', fontSize: 48, fontWeight: 800, fontStyle: '',
    fill: '#EC4899', textAlign: 'center',
    shadowColor: '#EC4899', shadowBlur: 20, shadowOffsetX: 0, shadowOffsetY: 0,
  },
  {
    id: 'retro-outline', name: 'Retro', preview: 'RETRO',
    fontFamily: 'Bungee', fontSize: 56, fontWeight: 400, fontStyle: '',
    fill: '#FACC15', textAlign: 'center',
    strokeColor: '#1A1A1A', strokeWidth: 3,
  },

  // ── Elegant ───────────────────────
  {
    id: 'elegant-serif', name: 'Elegant', preview: 'Elegance',
    fontFamily: 'Playfair Display', fontSize: 48, fontWeight: 700, fontStyle: 'italic',
    fill: '#7C3AED', textAlign: 'center',
  },
  {
    id: 'wedding', name: 'Mariage', preview: 'Love',
    fontFamily: 'Great Vibes', fontSize: 64, fontWeight: 400, fontStyle: '',
    fill: '#D4A574', textAlign: 'center',
  },
  {
    id: 'luxury', name: 'Luxe', preview: 'LUXE',
    fontFamily: 'Bodoni Moda', fontSize: 52, fontWeight: 900, fontStyle: '',
    fill: '#1A1A1A', textAlign: 'center', charSpacing: 600,
  },

  // ── Fun & Playful ─────────────────
  {
    id: 'bubble-fun', name: 'Bulle', preview: 'Fun!',
    fontFamily: 'Fredoka', fontSize: 52, fontWeight: 600, fontStyle: '',
    fill: '#EC4899', textAlign: 'center',
    strokeColor: '#FFFFFF', strokeWidth: 4,
  },
  {
    id: 'comic', name: 'BD', preview: 'BOOM!',
    fontFamily: 'Bangers', fontSize: 64, fontWeight: 400, fontStyle: '',
    fill: '#DC2626', textAlign: 'center',
    strokeColor: '#1A1A1A', strokeWidth: 3,
    shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 3, shadowOffsetY: 3,
  },
  {
    id: 'kawaii', name: 'Kawaii', preview: 'cute~',
    fontFamily: 'Comfortaa', fontSize: 40, fontWeight: 500, fontStyle: '',
    fill: '#F9A8D4', textAlign: 'center',
  },
  {
    id: 'graffiti', name: 'Graffiti', preview: 'STYLE',
    fontFamily: 'Permanent Marker', fontSize: 56, fontWeight: 400, fontStyle: '',
    fill: '#22C55E', textAlign: 'center',
    shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 4, shadowOffsetY: 4,
  },

  // ── Handwritten ───────────────────
  {
    id: 'notebook', name: 'Cahier', preview: 'notes...',
    fontFamily: 'Caveat', fontSize: 36, fontWeight: 400, fontStyle: '',
    fill: '#4B5563', textAlign: 'left',
  },
  {
    id: 'chalk', name: 'Craie', preview: 'chalk',
    fontFamily: 'Kalam', fontSize: 40, fontWeight: 400, fontStyle: '',
    fill: '#FFFFFF', textAlign: 'center',
    shadowColor: '#FFFFFF', shadowBlur: 2, shadowOffsetX: 0, shadowOffsetY: 0,
  },

  // ── Quotes & Labels ───────────────
  {
    id: 'quote-italic', name: 'Citation', preview: '"dream"',
    fontFamily: 'Lora', fontSize: 32, fontWeight: 400, fontStyle: 'italic',
    fill: '#6B7280', textAlign: 'center', lineHeight: 1.6,
  },
  {
    id: 'label-tag', name: 'Etiquette', preview: 'LABEL',
    fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, fontStyle: '',
    fill: '#FFFFFF', textAlign: 'center', charSpacing: 300, textTransform: 'upper',
    strokeColor: '#000000', strokeWidth: 0,
    shadowColor: '#00000040', shadowBlur: 8, shadowOffsetX: 0, shadowOffsetY: 2,
  },
];
