// ─── Decorative shape library ────────────────────────────────────────
// All paths are in a 100x100 coordinate space.
// When placed on canvas they are scaled to ~150x150px.
// To add a shape: define id, name, pathData, defaultColor.
// Matching .svg files in /assets/shapes/ are auto-generated reference.

export interface ShapeDef {
  id: string;
  name: string;
  pathData: string;
  defaultColor: string;
}

export const shapes: ShapeDef[] = [
  {
    id: 'heart',
    name: 'Coeur',
    defaultColor: '#EC4899',
    pathData:
      'M 50,88 C 90,68 98,42 98,30 C 98,14 86,2 72,2 C 62,2 54,8 50,18 C 46,8 38,2 28,2 C 14,2 2,14 2,30 C 2,42 10,68 50,88 Z',
  },
  {
    id: 'star',
    name: 'Etoile',
    defaultColor: '#FACC15',
    pathData:
      'M 50,2 L 63,38 L 98,38 L 70,58 L 80,95 L 50,73 L 20,95 L 30,58 L 2,38 L 37,38 Z',
  },
  {
    id: 'moon',
    name: 'Lune',
    defaultColor: '#FDE68A',
    pathData:
      'M 70,8 A 44,44 0 1,0 70,92 A 34,34 0 1,1 70,8 Z',
  },
  {
    id: 'diamond',
    name: 'Diamant',
    defaultColor: '#67E8F9',
    pathData: 'M 50,2 L 95,50 L 50,98 L 5,50 Z',
  },
  {
    id: 'crown',
    name: 'Couronne',
    defaultColor: '#FCD34D',
    pathData:
      'M 5,78 L 5,32 L 28,52 L 50,18 L 72,52 L 95,32 L 95,78 Z',
  },
  {
    id: 'lightning',
    name: 'Eclair',
    defaultColor: '#FDE047',
    pathData:
      'M 62,0 L 28,44 L 48,44 L 38,100 L 72,56 L 52,56 Z',
  },
  {
    id: 'cloud',
    name: 'Nuage',
    defaultColor: '#BFDBFE',
    pathData:
      'M 22,72 Q 0,72 0,55 Q 0,40 16,36 Q 14,18 32,12 Q 50,2 68,16 Q 82,8 92,24 Q 100,32 100,48 Q 100,62 86,64 Q 86,72 72,72 Z',
  },
  {
    id: 'flower',
    name: 'Fleur',
    defaultColor: '#F9A8D4',
    pathData:
      'M 50,5 C 58,18 65,22 72,28 C 82,18 90,18 92,30 C 94,42 85,46 74,46 C 86,54 90,62 84,72 C 78,82 68,78 60,68 C 60,80 56,88 46,88 C 36,88 32,78 34,68 C 24,76 16,78 10,70 C 4,62 10,52 22,46 C 10,44 4,36 8,26 C 12,16 22,16 32,26 C 36,16 42,10 50,5 Z',
  },
  {
    id: 'butterfly',
    name: 'Papillon',
    defaultColor: '#C084FC',
    pathData:
      'M 50,14 Q 28,0 10,10 Q 0,28 16,44 L 8,52 Q 0,70 10,84 Q 24,92 42,76 L 50,88 L 58,76 Q 76,92 90,84 Q 100,70 92,52 L 84,44 Q 100,28 90,10 Q 72,0 50,14 Z',
  },
  {
    id: 'bow',
    name: 'Noeud',
    defaultColor: '#FB7185',
    pathData:
      'M 50,38 Q 28,12 8,18 Q 0,26 8,40 Q 16,52 50,48 Q 16,52 8,64 Q 0,78 8,86 Q 28,92 50,58 Q 72,92 92,86 Q 100,78 92,64 Q 84,52 50,48 Q 84,52 92,40 Q 100,26 92,18 Q 72,12 50,38 Z',
  },
  {
    id: 'sun',
    name: 'Soleil',
    defaultColor: '#FB923C',
    pathData:
      'M 50,8 L 56,28 L 72,12 L 66,32 L 88,22 L 74,38 L 92,38 L 76,48 L 92,58 L 74,58 L 88,74 L 66,64 L 72,84 L 56,70 L 50,90 L 44,70 L 28,84 L 34,64 L 12,74 L 26,58 L 8,58 L 24,48 L 8,38 L 26,38 L 12,22 L 34,32 L 28,12 L 44,28 Z',
  },
  {
    id: 'rainbow',
    name: 'Arc-en-ciel',
    defaultColor: '#F472B6',
    pathData:
      'M 5,80 Q 5,20 50,20 Q 95,20 95,80 L 82,80 Q 82,34 50,34 Q 18,34 18,80 Z',
  },
];

export function getShape(id: string): ShapeDef | undefined {
  return shapes.find((s) => s.id === id);
}
