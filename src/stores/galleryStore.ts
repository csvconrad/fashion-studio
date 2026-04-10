import { create } from 'zustand';
import { storage, type SavedDesign } from '../lib/storage';
import { useCanvasStore } from './canvasStore';
import { useGarmentStore } from './garmentStore';

interface GalleryStore {
  // Current design tracking
  currentDesignId: string | null;
  currentDesignName: string;

  // Dialog state
  showSaveDialog: boolean;
  showExportDialog: boolean;

  // Cached list
  designs: SavedDesign[];

  // Dialog toggles
  openSaveDialog: () => void;
  closeSaveDialog: () => void;
  openExportDialog: () => void;
  closeExportDialog: () => void;

  // CRUD
  saveCurrentDesign: (name: string) => Promise<void>;
  saveOverCurrent: () => Promise<void>;
  loadDesign: (id: string) => Promise<void>;
  duplicateDesign: (id: string) => Promise<void>;
  renameDesign: (id: string, name: string) => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
  downloadDesign: (id: string) => Promise<void>;
  refreshDesigns: () => Promise<void>;

  // New design
  newDesign: () => void;
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  currentDesignId: null,
  currentDesignName: 'Ma creation',
  showSaveDialog: false,
  showExportDialog: false,
  designs: [],

  openSaveDialog: () => set({ showSaveDialog: true }),
  closeSaveDialog: () => set({ showSaveDialog: false }),
  openExportDialog: () => set({ showExportDialog: true }),
  closeExportDialog: () => set({ showExportDialog: false }),

  saveCurrentDesign: async (name) => {
    const canvasState = useCanvasStore.getState().getSerializableState();
    if (!canvasState) return;

    const thumbnail = useCanvasStore.getState().exportToPNG(0.4) ?? '';
    const garmentId = useGarmentStore.getState().activeGarmentId;

    const { currentDesignId } = get();
    const now = new Date().toISOString();
    const id = currentDesignId ?? crypto.randomUUID();

    const design: SavedDesign = {
      id,
      name,
      createdAt: currentDesignId ? (await storage.get(id))?.createdAt ?? now : now,
      updatedAt: now,
      thumbnail,
      canvasJson: canvasState.canvasJson,
      layers: canvasState.layers,
      activeLayerId: canvasState.activeLayerId,
      garmentId,
    };

    await storage.save(design);
    set({ currentDesignId: id, currentDesignName: name, showSaveDialog: false });
    await get().refreshDesigns();
  },

  saveOverCurrent: async () => {
    const { currentDesignId, currentDesignName } = get();
    if (!currentDesignId) {
      set({ showSaveDialog: true });
      return;
    }
    await get().saveCurrentDesign(currentDesignName);
  },

  loadDesign: async (id) => {
    const design = await storage.get(id);
    if (!design) return;

    // Load canvas state
    await useCanvasStore.getState().loadFromState({
      canvasJson: design.canvasJson,
      layers: design.layers,
      activeLayerId: design.activeLayerId,
    });

    // Sync garment store
    if (design.garmentId) {
      // The garment layer should already be in the loaded canvas state.
      // Just find the garment layer and set the garment store.
      const garmentLayer = design.layers.find((l) => l.type === 'garment');
      if (garmentLayer) {
        useGarmentStore.setState({
          activeGarmentId: design.garmentId,
          garmentLayerId: garmentLayer.id,
        });
      }
    } else {
      useGarmentStore.setState({ activeGarmentId: null, garmentLayerId: null });
    }

    set({ currentDesignId: id, currentDesignName: design.name });
  },

  duplicateDesign: async (id) => {
    const original = await storage.get(id);
    if (!original) return;

    const now = new Date().toISOString();
    const copy: SavedDesign = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (copie)`,
      createdAt: now,
      updatedAt: now,
    };

    await storage.save(copy);
    await get().refreshDesigns();
  },

  renameDesign: async (id, name) => {
    const design = await storage.get(id);
    if (!design) return;

    design.name = name;
    design.updatedAt = new Date().toISOString();
    await storage.save(design);

    // Update current name if renaming the active design
    if (get().currentDesignId === id) {
      set({ currentDesignName: name });
    }
    await get().refreshDesigns();
  },

  deleteDesign: async (id) => {
    await storage.delete(id);
    if (get().currentDesignId === id) {
      set({ currentDesignId: null, currentDesignName: 'Ma creation' });
    }
    await get().refreshDesigns();
  },

  downloadDesign: async (id) => {
    const design = await storage.get(id);
    if (!design) return;

    // Temporarily load the design to export it, or use the stored thumbnail
    // For a proper HD export we'd need to load the canvas — for gallery download
    // we use the thumbnail (which is still decent quality)
    const a = document.createElement('a');
    a.href = design.thumbnail;
    a.download = `${design.name}.png`;
    a.click();
  },

  refreshDesigns: async () => {
    const designs = await storage.list();
    set({ designs });
  },

  newDesign: () => {
    useCanvasStore.getState().clearCanvas();
    useGarmentStore.getState().removeGarment();
    set({ currentDesignId: null, currentDesignName: 'Ma creation' });
  },
}));
