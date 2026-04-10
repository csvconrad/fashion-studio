import { create } from 'zustand';
import { Path } from 'fabric';
import { useCanvasStore, type CanvasLayer } from './canvasStore';
import { getTemplate } from '../features/garments/templates';

// ─── Store ───────────────────────────────────────────────────────────

interface GarmentStore {
  activeGarmentId: string | null;
  garmentLayerId: string | null;

  loadGarment: (templateId: string) => void;
  removeGarment: () => void;
  applyColorToSelectedZone: (color: string) => void;
}

export const useGarmentStore = create<GarmentStore>((set, get) => ({
  activeGarmentId: null,
  garmentLayerId: null,

  loadGarment: (templateId) => {
    const template = getTemplate(templateId);
    if (!template) return;

    const canvas = useCanvasStore.getState().getCanvas();
    if (!canvas) return;

    // Remove existing garment first
    const { garmentLayerId } = get();
    if (garmentLayerId) {
      _removeGarmentFromCanvas(garmentLayerId);
    }

    // Create a locked garment layer at the bottom of the stack
    const layerId = crypto.randomUUID();
    const garmentLayer: CanvasLayer = {
      id: layerId,
      name: template.name,
      visible: true,
      locked: true,
      opacity: 1,
      type: 'garment',
    };

    const { layers } = useCanvasStore.getState();
    useCanvasStore.setState({ layers: [garmentLayer, ...layers] });

    // Add each zone as a Fabric Path
    template.zones.forEach((zone) => {
      const path = new Path(zone.pathData, {
        fill: zone.defaultColor,
        stroke: '#00000018',
        strokeWidth: 1.5,
        // Selectable for clicking, but locked transforms
        selectable: true,
        hasControls: false,
        hasBorders: true,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hoverCursor: 'pointer',
        // Custom data for identification
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

    // Move garment objects to the back (bottom of canvas stack)
    const garmentObjects = canvas
      .getObjects()
      .filter((obj) => _getData(obj).layerId === layerId);
    garmentObjects.forEach((obj, i) => {
      canvas.moveObjectTo(obj, i);
    });

    canvas.discardActiveObject();
    canvas.renderAll();

    set({ activeGarmentId: templateId, garmentLayerId: layerId });
    useCanvasStore.getState().commitToHistory();
  },

  removeGarment: () => {
    const { garmentLayerId } = get();
    if (!garmentLayerId) return;

    _removeGarmentFromCanvas(garmentLayerId);
    set({ activeGarmentId: null, garmentLayerId: null });
    useCanvasStore.getState().commitToHistory();
  },

  applyColorToSelectedZone: (color) => {
    const canvas = useCanvasStore.getState().getCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    if (active.length === 0) return;

    let changed = false;
    for (const obj of active) {
      // Apply to any selected object (garment zone or regular)
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

function _removeGarmentFromCanvas(layerId: string) {
  const canvas = useCanvasStore.getState().getCanvas();
  if (!canvas) return;

  // Remove fabric objects
  const toRemove = canvas
    .getObjects()
    .filter((obj) => _getData(obj).layerId === layerId);
  toRemove.forEach((obj) => canvas.remove(obj));
  canvas.discardActiveObject();
  canvas.renderAll();

  // Remove layer from store
  const { layers } = useCanvasStore.getState();
  useCanvasStore.setState({
    layers: layers.filter((l) => l.id !== layerId),
  });
}

// ─── Sync with undo/redo ─────────────────────────────────────────────
// When undo/redo removes the garment layer, clear garment state.

useCanvasStore.subscribe((state) => {
  const { garmentLayerId } = useGarmentStore.getState();
  if (!garmentLayerId) return;

  const garmentLayerExists = state.layers.some((l) => l.id === garmentLayerId);
  if (!garmentLayerExists) {
    useGarmentStore.setState({ activeGarmentId: null, garmentLayerId: null });
  }
});
