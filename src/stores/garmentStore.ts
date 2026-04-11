import { create } from 'zustand';
import { Path } from 'fabric';
import { useCanvasStore, type CanvasLayer } from './canvasStore';
import { getTemplate } from '../features/garments/templates';
import type { GarmentView } from '../types/garment';

interface GarmentStore {
  activeGarmentId: string | null;
  garmentLayerId: string | null;
  activeView: GarmentView;

  loadGarment: (templateId: string) => void;
  switchView: (view: GarmentView) => void;
  removeGarment: () => void;
  applyColorToSelectedZone: (color: string) => void;
}

export const useGarmentStore = create<GarmentStore>((set, get) => ({
  activeGarmentId: null,
  garmentLayerId: null,
  activeView: 'front',

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
  const toRemove = canvas.getObjects().filter((obj) => _getData(obj).layerId === layerId);
  toRemove.forEach((obj) => canvas.remove(obj));
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
