import { create } from 'zustand';
import type { Design, GarmentInstance, Pattern } from '../types';

interface DesignStore {
  // Current design state
  currentDesign: Design | null;
  savedDesigns: Design[];
  selectedGarmentId: string | null;
  activeColor: string;
  activePattern: Pattern | null;
  activeTool: 'select' | 'color' | 'pattern' | 'move';

  // Actions
  newDesign: (name?: string) => void;
  addGarment: (garment: GarmentInstance) => void;
  updateGarment: (id: string, updates: Partial<GarmentInstance>) => void;
  removeGarment: (id: string) => void;
  selectGarment: (id: string | null) => void;
  setActiveColor: (color: string) => void;
  setActivePattern: (pattern: Pattern | null) => void;
  setActiveTool: (tool: 'select' | 'color' | 'pattern' | 'move') => void;
  saveDesign: () => void;
  loadDesign: (id: string) => void;
  deleteDesign: (id: string) => void;
  loadSavedDesigns: () => void;
}

const STORAGE_KEY = 'fashion-studio-designs';

function createEmptyDesign(name: string): Design {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    garments: [],
    canvasWidth: 600,
    canvasHeight: 700,
  };
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  currentDesign: null,
  savedDesigns: [],
  selectedGarmentId: null,
  activeColor: '#FF6B9D',
  activePattern: null,
  activeTool: 'select',

  newDesign: (name = 'Ma creation') => {
    set({ currentDesign: createEmptyDesign(name), selectedGarmentId: null });
  },

  addGarment: (garment) => {
    const { currentDesign } = get();
    if (!currentDesign) return;
    set({
      currentDesign: {
        ...currentDesign,
        garments: [...currentDesign.garments, garment],
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updateGarment: (id, updates) => {
    const { currentDesign } = get();
    if (!currentDesign) return;
    set({
      currentDesign: {
        ...currentDesign,
        garments: currentDesign.garments.map((g) =>
          g.id === id ? { ...g, ...updates } : g
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  removeGarment: (id) => {
    const { currentDesign, selectedGarmentId } = get();
    if (!currentDesign) return;
    set({
      currentDesign: {
        ...currentDesign,
        garments: currentDesign.garments.filter((g) => g.id !== id),
        updatedAt: new Date().toISOString(),
      },
      selectedGarmentId: selectedGarmentId === id ? null : selectedGarmentId,
    });
  },

  selectGarment: (id) => set({ selectedGarmentId: id }),
  setActiveColor: (color) => set({ activeColor: color }),
  setActivePattern: (pattern) => set({ activePattern: pattern }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  saveDesign: () => {
    const { currentDesign, savedDesigns } = get();
    if (!currentDesign) return;
    const updated = { ...currentDesign, updatedAt: new Date().toISOString() };
    const existing = savedDesigns.findIndex((d) => d.id === updated.id);
    const newSaved =
      existing >= 0
        ? savedDesigns.map((d, i) => (i === existing ? updated : d))
        : [...savedDesigns, updated];
    set({ currentDesign: updated, savedDesigns: newSaved });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaved));
  },

  loadDesign: (id) => {
    const { savedDesigns } = get();
    const design = savedDesigns.find((d) => d.id === id);
    if (design) set({ currentDesign: { ...design }, selectedGarmentId: null });
  },

  deleteDesign: (id) => {
    const { savedDesigns } = get();
    const newSaved = savedDesigns.filter((d) => d.id !== id);
    set({ savedDesigns: newSaved });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaved));
  },

  loadSavedDesigns: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) set({ savedDesigns: JSON.parse(data) });
    } catch {
      // Corrupted data — start fresh
    }
  },
}));
