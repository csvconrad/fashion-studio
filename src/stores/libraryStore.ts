import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────

export interface LibraryGarment {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  family: string;
  svgPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  tags: string[];
}

export interface LibraryFamily {
  id: string;
  label: string;
  count: number;
}

export interface LibraryCategory {
  id: string;
  label: string;
  family: string;
  count: number;
}

export interface UserCollection {
  id: string;
  name: string;
  garmentIds: string[];
}

interface LibraryIndex {
  version: number;
  totalCount: number;
  families: LibraryFamily[];
  categories: LibraryCategory[];
  garments: LibraryGarment[];
}

// ─── Persistence keys ────────────────────────────────────────────────

const FAVS_KEY = 'fashion-studio-library-favs';
const RECENTS_KEY = 'fashion-studio-library-recents';
const COLLECTIONS_KEY = 'fashion-studio-library-collections';
const MAX_RECENTS = 50;

function loadJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}

// ─── Store ───────────────────────────────────────────────────────────

interface LibraryStore {
  // Data
  loading: boolean;
  error: string | null;
  families: LibraryFamily[];
  categories: LibraryCategory[];
  garments: LibraryGarment[];
  totalCount: number;

  // User data
  favorites: Set<string>;
  recents: string[];
  collections: UserCollection[];

  // UI state
  selectedFamily: string | null;       // null = all
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name-asc' | 'name-desc';
  specialFilter: 'all' | 'favorites' | 'recents' | string; // string = collection ID

  // Actions
  loadIndex: () => Promise<void>;
  setSelectedFamily: (id: string | null) => void;
  setSelectedCategory: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setViewMode: (m: 'grid' | 'list') => void;
  setSortBy: (s: 'name-asc' | 'name-desc') => void;
  setSpecialFilter: (f: 'all' | 'favorites' | 'recents' | string) => void;

  // Favorites
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Recents
  addToRecents: (id: string) => void;

  // Collections
  createCollection: (name: string) => void;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addToCollection: (collectionId: string, garmentId: string) => void;
  removeFromCollection: (collectionId: string, garmentId: string) => void;

  // Derived
  getFilteredGarments: () => LibraryGarment[];
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  loading: false,
  error: null,
  families: [],
  categories: [],
  garments: [],
  totalCount: 0,

  favorites: new Set(loadJson<string[]>(FAVS_KEY, [])),
  recents: loadJson<string[]>(RECENTS_KEY, []),
  collections: loadJson<UserCollection[]>(COLLECTIONS_KEY, []),

  selectedFamily: null,
  selectedCategory: null,
  searchQuery: '',
  viewMode: 'grid',
  sortBy: 'name-asc',
  specialFilter: 'all',

  loadIndex: async () => {
    if (get().garments.length > 0) return; // already loaded
    set({ loading: true, error: null });
    try {
      const res = await fetch('/garments/index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LibraryIndex = await res.json();
      set({
        families: data.families,
        categories: data.categories,
        garments: data.garments,
        totalCount: data.totalCount,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  setSelectedFamily: (id) => set({ selectedFamily: id, selectedCategory: null, specialFilter: 'all' }),
  setSelectedCategory: (id) => set({ selectedCategory: id, specialFilter: 'all' }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setViewMode: (m) => set({ viewMode: m }),
  setSortBy: (s) => set({ sortBy: s }),
  setSpecialFilter: (f) => set({ specialFilter: f, selectedFamily: null, selectedCategory: null }),

  toggleFavorite: (id) => {
    const favs = new Set(get().favorites);
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    set({ favorites: favs });
    localStorage.setItem(FAVS_KEY, JSON.stringify([...favs]));
  },

  isFavorite: (id) => get().favorites.has(id),

  addToRecents: (id) => {
    const recents = [id, ...get().recents.filter((r) => r !== id)].slice(0, MAX_RECENTS);
    set({ recents });
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
  },

  createCollection: (name) => {
    const c: UserCollection = { id: crypto.randomUUID(), name, garmentIds: [] };
    const next = [...get().collections, c];
    set({ collections: next });
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  },

  deleteCollection: (id) => {
    const next = get().collections.filter((c) => c.id !== id);
    set({ collections: next });
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  },

  renameCollection: (id, name) => {
    const next = get().collections.map((c) => (c.id === id ? { ...c, name } : c));
    set({ collections: next });
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  },

  addToCollection: (collectionId, garmentId) => {
    const next = get().collections.map((c) => {
      if (c.id !== collectionId) return c;
      if (c.garmentIds.includes(garmentId)) return c;
      return { ...c, garmentIds: [...c.garmentIds, garmentId] };
    });
    set({ collections: next });
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  },

  removeFromCollection: (collectionId, garmentId) => {
    const next = get().collections.map((c) => {
      if (c.id !== collectionId) return c;
      return { ...c, garmentIds: c.garmentIds.filter((g) => g !== garmentId) };
    });
    set({ collections: next });
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  },

  getFilteredGarments: () => {
    const { garments, searchQuery, selectedFamily, selectedCategory, specialFilter, favorites, recents, collections, sortBy } = get();

    let filtered = garments;

    // Special filters
    if (specialFilter === 'favorites') {
      filtered = garments.filter((g) => favorites.has(g.id));
    } else if (specialFilter === 'recents') {
      filtered = recents.map((id) => garments.find((g) => g.id === id)).filter(Boolean) as LibraryGarment[];
    } else if (specialFilter !== 'all') {
      // Collection ID
      const col = collections.find((c) => c.id === specialFilter);
      if (col) {
        const idSet = new Set(col.garmentIds);
        filtered = garments.filter((g) => idSet.has(g.id));
      }
    } else {
      // Category/family filter
      if (selectedCategory) {
        filtered = garments.filter((g) => g.category === selectedCategory);
      } else if (selectedFamily) {
        filtered = garments.filter((g) => g.family === selectedFamily);
      }
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((g) =>
        g.name.toLowerCase().includes(q) ||
        g.categoryLabel.toLowerCase().includes(q) ||
        g.family.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'name-desc') {
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    }
    // name-asc is default (already sorted in index.json)

    return filtered;
  },
}));
