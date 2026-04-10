// ─── Curated sticker categories ──────────────────────────────────────
// Each category maps to Iconify search queries that return good results.
// The Iconify API provides 200,000+ icons from 100+ open-source sets.

export interface StickerCategory {
  id: string;
  name: string;
  icon: string;           // emoji for tab
  queries: string[];      // Iconify search terms
  prefixes?: string[];    // preferred icon set prefixes
}

export const stickerCategories: StickerCategory[] = [
  {
    id: 'fashion',
    name: 'Mode',
    icon: '\u{1F457}',
    queries: ['dress', 'shoe', 'hat', 'bag', 'ring', 'lipstick', 'glasses', 'crown', 'shirt', 'boots'],
    prefixes: ['noto', 'twemoji', 'openmoji', 'fluent-emoji-flat'],
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '\u{1F33B}',
    queries: ['flower', 'leaf', 'tree', 'mushroom', 'butterfly', 'sunflower', 'rose', 'tulip', 'herb', 'blossom'],
    prefixes: ['noto', 'twemoji', 'fluent-emoji-flat'],
  },
  {
    id: 'animals',
    name: 'Animaux',
    icon: '\u{1F431}',
    queries: ['cat', 'dog', 'unicorn', 'rabbit', 'bird', 'fish', 'dragon', 'panda', 'fox', 'bear'],
    prefixes: ['noto', 'twemoji', 'fluent-emoji-flat'],
  },
  {
    id: 'food',
    name: 'Nourriture',
    icon: '\u{1F370}',
    queries: ['cake', 'ice cream', 'strawberry', 'pizza', 'donut', 'cookie', 'candy', 'apple', 'watermelon', 'cupcake'],
    prefixes: ['noto', 'twemoji', 'fluent-emoji-flat'],
  },
  {
    id: 'kawaii',
    name: 'Kawaii',
    icon: '\u2B50',
    queries: ['heart', 'star', 'sparkles', 'rainbow', 'cloud', 'moon', 'sun', 'fire', 'lightning', 'snowflake'],
    prefixes: ['noto', 'twemoji', 'fluent-emoji-flat', 'openmoji'],
  },
  {
    id: 'space',
    name: 'Espace',
    icon: '\u{1F680}',
    queries: ['rocket', 'planet', 'star', 'moon', 'galaxy', 'alien', 'meteor', 'satellite', 'telescope', 'crystal ball'],
    prefixes: ['noto', 'twemoji', 'fluent-emoji-flat'],
  },
  {
    id: 'music',
    name: 'Musique',
    icon: '\u{1F3B5}',
    queries: ['music', 'guitar', 'microphone', 'headphone', 'piano', 'drum', 'note', 'disco', 'speaker', 'saxophone'],
    prefixes: ['noto', 'twemoji', 'fluent-emoji-flat'],
  },
  {
    id: 'holiday',
    name: 'Fetes',
    icon: '\u{1F384}',
    queries: ['christmas', 'halloween', 'pumpkin', 'gift', 'balloon', 'confetti', 'firework', 'party', 'candle', 'snowman'],
    prefixes: ['noto', 'twemoji', 'fluent-emoji-flat'],
  },
  {
    id: 'symbols',
    name: 'Symboles',
    icon: '\u2764\uFE0F',
    queries: ['heart', 'peace', 'infinity', 'crown', 'diamond', 'trophy', 'medal', 'ribbon', 'bow', 'anchor'],
    prefixes: ['noto', 'twemoji', 'fluent-emoji-flat'],
  },
];
