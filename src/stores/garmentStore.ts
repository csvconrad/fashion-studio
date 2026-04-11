import { create } from 'zustand';
import { Path, FabricImage } from 'fabric';
import { useCanvasStore, type CanvasLayer, CANVAS_WIDTH, CANVAS_HEIGHT } from './canvasStore';
import { getTemplate } from '../features/garments/templates';
import type { GarmentView } from '../types/garment';

interface GarmentStore {
  activeGarmentId: string | null;
  garmentLayerId: string | null;
  activeView: GarmentView;
  customImageUrl: string | null;  // data URL of imported template image

  loadGarment: (templateId: string) => void;
  loadFromImage: (dataUrl: string, name?: string) => Promise<void>;
  switchView: (view: GarmentView) => void;
  removeGarment: () => void;
  applyColorToSelectedZone: (color: string) => void;
}

export const useGarmentStore = create<GarmentStore>((set, get) => ({
  activeGarmentId: null,
  garmentLayerId: null,
  activeView: 'front',
  customImageUrl: null,

  loadFromImage: async (dataUrl, name = 'Gabarit custom') => {
    const canvas = useCanvasStore.getState().getCanvas();
    if (!canvas) return;

    // Remove existing garment
    const { garmentLayerId } = get();
    if (garmentLayerId) _removeGarmentFromCanvas(garmentLayerId);

    const layerId = crypto.randomUUID();
    const garmentLayer: CanvasLayer = {
      id: layerId,
      name,
      visible: true,
      locked: true,
      opacity: 1,
      type: 'garment',
    };

    const { layers } = useCanvasStore.getState();
    useCanvasStore.setState({ layers: [garmentLayer, ...layers] });

    // Load image and center on canvas
    const img = await FabricImage.fromURL(dataUrl);
    const imgW = img.width ?? 400;
    const imgH = img.height ?? 600;
    const scale = Math.min((CANVAS_WIDTH * 0.75) / imgW, (CANVAS_HEIGHT * 0.75) / imgH, 1);

    img.set({
      left: (CANVAS_WIDTH - imgW * scale) / 2,
      top: (CANVAS_HEIGHT - imgH * scale) / 2,
      scaleX: scale,
      scaleY: scale,
      selectable: false,
      evented: false,
      data: { objectId: crypto.randomUUID(), layerId, garmentId: 'custom' },
    });

    canvas.add(img);
    canvas.moveObjectTo(img, 0);
    canvas.renderAll();

    set({ activeGarmentId: 'custom', garmentLayerId: layerId, customImageUrl: dataUrl });
    useCanvasStore.getState().commitToHistory();
  },

  loadGarment: (templateId) => {
    const template = getTemplate(templateId);
    if (!template) return;

    const canvas = useCanvasStore.getState().getCanvas();
    if (!canvas) return;

    // Remove existing garment first
    const { garmentLayerId } = get();
    if (garmentLayerId) _removeGarmentFromCanvas(garmentLayerId);

    const view = get().activeView;
    const zones = template.views[view];

    // Create garment layer
    const layerId = crypto.randomUUID();
    const garmentLayer: CanvasLayer = {
      id: layerId,
      name: `${template.name} (${view === 'front' ? 'devant' : view === 'back' ? 'dos' : 'cote'})`,
      visible: true,
      locked: true,
      opacity: 1,
      type: 'garment',
    };

    const { layers } = useCanvasStore.getState();
    useCanvasStore.setState({ layers: [garmentLayer, ...layers] });

    _addZonesToCanvas(zones, layerId, templateId, canvas);

    set({ activeGarmentId: templateId, garmentLayerId: layerId });
    useCanvasStore.getState().commitToHistory();
  },

  switchView: (view) => {
    const { activeGarmentId } = get();
    if (!activeGarmentId) return;
    set({ activeView: view });
    // Reload with new view
    get().loadGarment(activeGarmentId);
  },

  removeGarment: () => {
    const { garmentLayerId } = get();
    if (!garmentLayerId) return;
    _removeGarmentFromCanvas(garmentLayerId);
    set({ activeGarmentId: null, garmentLayerId: null, customImageUrl: null });
    useCanvasStore.getState().commitToHistory();
  },

  applyColorToSelectedZone: (color) => {
    const canvas = useCanvasStore.getState().getCanvas();
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length === 0) return;
    let changed = false;
    for (const obj of active) {
      obj.set('fill', color);
      changed = true;
    }
    if (changed) {
      canvas.renderAll();
      useCanvasStore.getState().commitToHistory();
    }
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────

function _getData(obj: unknown): Record<string, string> {
  return ((obj as { data?: Record<string, string> }).data ?? {});
}

function _addZonesToCanvas(
  zones: { id: string; name: string; pathData: string; defaultColor: string }[],
  layerId: string,
  templateId: string,
  canvas: { add: Function; moveObjectTo: Function; getObjects: Function; discardActiveObject: Function; renderAll: Function },
) {
  zones.forEach((zone) => {
    const path = new Path(zone.pathData, {
      fill: zone.defaultColor,
      stroke: '#00000012',
      strokeWidth: 1.5,
      selectable: true,
      hasControls: false,
      hasBorders: true,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      hoverCursor: 'pointer',
      data: {
        objectId: crypto.randomUUID(),
        layerId,
        zoneId: zone.id,
        zoneName: zone.name,
        garmentId: templateId,
      },
    });
    canvas.add(path);
  });

  const garmentObjects = canvas.getObjects()
    .filter((obj: unknown) => _getData(obj).layerId === layerId);
  garmentObjects.forEach((obj: unknown, i: number) => {
    canvas.moveObjectTo(obj, i);
  });

  canvas.discardActiveObject();
  canvas.renderAll();
}

function _removeGarmentFromCanvas(layerId: string) {
  const canvas = useCanvasStore.getState().getCanvas();
  if (!canvas) return;

  // Find all objects belonging to this garment layer
  const allObjects = canvas.getObjects();
  const toRemove = allObjects.filter((obj) => {
    const d = _getData(obj);
    return d.layerId === layerId || d.garmentId;
  });

  // If no objects found by data, try removing all non-selectable objects
  // (custom image templates are set with selectable: false, evented: false)
  if (toRemove.length === 0) {
    const locked = allObjects.filter((obj) => !obj.selectable && !obj.evented);
    locked.forEach((obj) => canvas.remove(obj));
  } else {
    toRemove.forEach((obj) => canvas.remove(obj));
  }

  canvas.discardActiveObject();
  canvas.renderAll();

  const { layers } = useCanvasStore.getState();
  useCanvasStore.setState({ layers: layers.filter((l) => l.id !== layerId) });
}

// Sync with undo/redo
useCanvasStore.subscribe((state) => {
  const { garmentLayerId } = useGarmentStore.getState();
  if (!garmentLayerId) return;
  const exists = state.layers.some((l) => l.id === garmentLayerId);
  if (!exists) useGarmentStore.setState({ activeGarmentId: null, garmentLayerId: null });
});
