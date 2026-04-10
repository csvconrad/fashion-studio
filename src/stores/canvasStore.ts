import { create } from 'zustand';
import {
  Canvas as FabricCanvas,
  Rect,
  Circle,
  Ellipse,
  Path,
  Textbox,
  type FabricObject,
} from 'fabric';

// ─── Types ───────────────────────────────────────────────────────────

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;          // 0–1
  type?: 'garment' | 'user';
  groupId?: string;         // parent group layer id
  isGroup?: boolean;        // true = this is a folder
  collapsed?: boolean;      // group collapsed in panel
}

interface Snapshot {
  canvasJson: object;
  layers: CanvasLayer[];
  activeLayerId: string;
}

// ─── Constants ───────────────────────────────────────────────────────

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 1000;
const MAX_HISTORY = 50;

// ─── Internal state (non-reactive, outside Zustand) ──────────────────

let _canvas: FabricCanvas | null = null;
let _history: Snapshot[] = [];
let _historyIndex = -1;
let _isRestoring = false; // prevents snapshot push during undo/redo
let _clipboard: FabricObject | null = null;

function _takeSnapshot(state: { layers: CanvasLayer[]; activeLayerId: string }): Snapshot | null {
  if (!_canvas) return null;
  return {
    canvasJson: _canvas.toObject(['data']),
    layers: structuredClone(state.layers),
    activeLayerId: state.activeLayerId,
  };
}

function _pushSnapshot(state: { layers: CanvasLayer[]; activeLayerId: string }): { canUndo: boolean; canRedo: boolean } {
  if (_isRestoring) return { canUndo: _historyIndex > 0, canRedo: _historyIndex < _history.length - 1 };
  const snap = _takeSnapshot(state);
  if (!snap) return { canUndo: false, canRedo: false };

  // Discard any future (redo) history
  _history = _history.slice(0, _historyIndex + 1);
  _history.push(snap);

  if (_history.length > MAX_HISTORY) {
    _history.shift();
  } else {
    _historyIndex++;
  }

  return { canUndo: _historyIndex > 0, canRedo: false };
}

// ─── Store interface ─────────────────────────────────────────────────

export type ToolMode = 'select' | 'draw' | 'text' | 'shape' | 'image';

interface CanvasStore {
  // Reactive state
  layers: CanvasLayer[];
  activeLayerId: string;
  selectedObjectIds: string[];
  canUndo: boolean;
  canRedo: boolean;

  // Tool state
  activeTool: ToolMode;
  activeColor: string;
  pendingShapeId: string | null;
  activeBrushId: string;
  brushWidth: number;
  brushOpacity: number;
  fontSize: number;
  fontFamily: string;

  // Viewport
  zoomLevel: number;
  cursorPos: { x: number; y: number };

  // Clipboard
  copySelection: () => void;
  pasteClipboard: () => void;
  duplicateSelection: () => void;
  setZoomLevel: (z: number) => void;
  setCursorPos: (x: number, y: number) => void;

  // Canvas lifecycle
  setCanvas: (canvas: FabricCanvas | null) => void;
  getCanvas: () => FabricCanvas | null;

  // Tool setters
  setActiveTool: (tool: ToolMode) => void;
  setActiveColor: (color: string) => void;
  setPendingShape: (id: string | null) => void;
  setActiveBrush: (id: string) => void;
  setBrushWidth: (w: number) => void;
  setBrushOpacity: (o: number) => void;
  setFontSize: (s: number) => void;
  setFontFamily: (f: string) => void;

  // Layers
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  reorderLayerTo: (id: string, toIndex: number) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  duplicateLayer: (id: string) => void;
  mergeLayerDown: (id: string) => void;

  // Groups
  createGroup: (name?: string) => void;
  toggleGroupCollapse: (id: string) => void;

  // Object CRUD — content-agnostic
  addObject: (type: string, options?: Record<string, unknown>) => void;
  removeObject: (id?: string) => void;
  clearCanvas: () => void;

  // History
  commitToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Color
  applyFillToSelection: (color: string) => void;

  // Serialization (for save/load)
  getSerializableState: () => { canvasJson: object; layers: CanvasLayer[]; activeLayerId: string } | null;
  loadFromState: (state: { canvasJson: object; layers: CanvasLayer[]; activeLayerId: string }) => Promise<void>;

  // Export
  exportToPNG: (multiplier?: number) => string | null;
  exportToSVG: () => string | null;

  // Internal
  setSelectedObjectIds: (ids: string[]) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function objectsByLayer(layerId: string): FabricObject[] {
  if (!_canvas) return [];
  return _canvas.getObjects().filter(
    (obj) => (obj as unknown as { data?: { layerId?: string } }).data?.layerId === layerId,
  );
}

function reorderCanvasObjects(layers: CanvasLayer[]) {
  if (!_canvas) return;
  const layerOrder = new Map(layers.map((l, i) => [l.id, i]));
  const objects = _canvas.getObjects();
  const sorted = [...objects].sort((a, b) => {
    const aIdx = layerOrder.get((a as unknown as { data?: { layerId?: string } }).data?.layerId ?? '') ?? 0;
    const bIdx = layerOrder.get((b as unknown as { data?: { layerId?: string } }).data?.layerId ?? '') ?? 0;
    return aIdx - bIdx;
  });
  sorted.forEach((obj, i) => {
    _canvas!.moveObjectTo(obj, i);
  });
  _canvas.renderAll();
}

function createFabricObject(
  type: string,
  layerId: string,
  options: Record<string, unknown> = {},
): FabricObject | null {
  const objectId = crypto.randomUUID();
  const base: Record<string, unknown> = {
    data: { objectId, layerId },
    left: CANVAS_WIDTH / 2 - 50,
    top: CANVAS_HEIGHT / 2 - 50,
    ...options,
    // Ensure data isn't overwritten by options spread
  };
  // Re-apply data after spread so callers can't clobber layerId
  base.data = { ...(options.data as Record<string, unknown> ?? {}), objectId, layerId };

  switch (type) {
    case 'rect':
      return new Rect({ width: 100, height: 80, fill: '#3B82F6', ...base });
    case 'circle':
      return new Circle({ radius: 50, fill: '#EF4444', ...base });
    case 'ellipse':
      return new Ellipse({ rx: 60, ry: 40, fill: '#8B5CF6', ...base });
    case 'path': {
      const pathStr = (options.path ?? options.svgPath ?? '') as string;
      return new Path(pathStr, { fill: '#10B981', ...base });
    }
    case 'textbox':
      return new Textbox((options.text as string) ?? 'Texte', {
        width: 200,
        fontSize: 24,
        fill: '#1F2937',
        ...base,
      });
    default:
      console.warn(`[canvasStore] Unknown object type: ${type}`);
      return null;
  }
}

// ─── Store ───────────────────────────────────────────────────────────

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  layers: [],
  activeLayerId: '',
  selectedObjectIds: [],
  canUndo: false,
  canRedo: false,

  // Tool defaults
  activeTool: 'select',
  activeColor: '#EC4899',
  pendingShapeId: null,
  activeBrushId: 'pen',
  brushWidth: 4,
  brushOpacity: 1,
  fontSize: 32,
  fontFamily: 'Comic Sans MS',
  zoomLevel: 1,
  cursorPos: { x: 0, y: 0 },

  // ── Clipboard + viewport ────────────────────────

  copySelection: () => {
    if (!_canvas) return;
    const active = _canvas.getActiveObject();
    if (!active) return;
    active.clone().then((cloned: FabricObject) => {
      _clipboard = cloned;
    });
  },

  pasteClipboard: () => {
    if (!_canvas || !_clipboard) return;
    _clipboard.clone().then((cloned: FabricObject) => {
      const state = get();
      cloned.set({
        left: (cloned.left ?? 0) + 20,
        top: (cloned.top ?? 0) + 20,
      });
      const d = (cloned as unknown as { data?: Record<string, unknown> });
      d.data = { objectId: crypto.randomUUID(), layerId: state.activeLayerId };
      _canvas!.add(cloned);
      _canvas!.setActiveObject(cloned);
      _canvas!.renderAll();
      const h = _pushSnapshot(state);
      set(h);
    });
  },

  duplicateSelection: () => {
    if (!_canvas) return;
    const active = _canvas.getActiveObject();
    if (!active) return;
    active.clone().then((cloned: FabricObject) => {
      const state = get();
      cloned.set({
        left: (cloned.left ?? 0) + 20,
        top: (cloned.top ?? 0) + 20,
      });
      const d = (cloned as unknown as { data?: Record<string, unknown> });
      d.data = { objectId: crypto.randomUUID(), layerId: state.activeLayerId };
      _canvas!.add(cloned);
      _canvas!.setActiveObject(cloned);
      _canvas!.renderAll();
      const h = _pushSnapshot(state);
      set(h);
    });
  },

  setZoomLevel: (z) => set({ zoomLevel: Math.max(0.1, Math.min(5, z)) }),
  setCursorPos: (x, y) => set({ cursorPos: { x, y } }),

  // ── Tool setters ────────────────────────────────

  setActiveTool: (tool) => set({ activeTool: tool, ...(tool !== 'shape' ? { pendingShapeId: null } : {}) }),
  setActiveColor: (color) => set({ activeColor: color }),
  setPendingShape: (id) => set({ pendingShapeId: id, activeTool: 'shape' }),
  setActiveBrush: (id) => set({ activeBrushId: id, activeTool: 'draw' }),
  setBrushWidth: (w) => set({ brushWidth: w }),
  setBrushOpacity: (o) => set({ brushOpacity: Math.max(0, Math.min(1, o)) }),
  setFontSize: (s) => set({ fontSize: s }),
  setFontFamily: (f) => set({ fontFamily: f }),

  // ── Canvas lifecycle ──────────────────────────────

  setCanvas: (canvas) => {
    _canvas = canvas;
    _history = [];
    _historyIndex = -1;

    if (canvas) {
      const layer: CanvasLayer = {
        id: crypto.randomUUID(),
        name: 'Calque 1',
        visible: true,
        locked: false,
        opacity: 1,
      };
      set({ layers: [layer], activeLayerId: layer.id, selectedObjectIds: [], canUndo: false, canRedo: false });
      // Push initial empty snapshot after canvas is ready
      requestAnimationFrame(() => {
        _pushSnapshot(get());
        set({ canUndo: false, canRedo: false });
      });
    } else {
      set({ layers: [], activeLayerId: '', selectedObjectIds: [], canUndo: false, canRedo: false });
    }
  },

  getCanvas: () => _canvas,

  // ── Layers ────────────────────────────────────────

  addLayer: (name) => {
    const { layers } = get();
    const layer: CanvasLayer = {
      id: crypto.randomUUID(),
      name: name ?? `Calque ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
    };
    const newLayers = [...layers, layer];
    set({ layers: newLayers, activeLayerId: layer.id });
    const h = _pushSnapshot({ layers: newLayers, activeLayerId: layer.id });
    set(h);
  },

  removeLayer: (id) => {
    const { layers, activeLayerId } = get();
    if (layers.length <= 1) return;
    const layer = layers.find((l) => l.id === id);
    if (layer?.type === 'garment') return; // garment layer is protected

    // Remove fabric objects belonging to this layer
    objectsByLayer(id).forEach((obj) => _canvas?.remove(obj));
    _canvas?.discardActiveObject();
    _canvas?.renderAll();

    const newLayers = layers.filter((l) => l.id !== id);
    const newActive = activeLayerId === id ? newLayers[newLayers.length - 1].id : activeLayerId;
    set({ layers: newLayers, activeLayerId: newActive, selectedObjectIds: [] });
    const h = _pushSnapshot({ layers: newLayers, activeLayerId: newActive });
    set(h);
  },

  selectLayer: (id) => set({ activeLayerId: id }),

  renameLayer: (id, name) => {
    set({ layers: get().layers.map((l) => (l.id === id ? { ...l, name } : l)) });
  },

  toggleLayerVisibility: (id) => {
    const { layers } = get();
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const visible = !layer.visible;

    objectsByLayer(id).forEach((obj) => { obj.visible = visible; });
    _canvas?.discardActiveObject();
    _canvas?.renderAll();

    const newLayers = layers.map((l) => (l.id === id ? { ...l, visible } : l));
    set({ layers: newLayers });
  },

  toggleLayerLock: (id) => {
    const { layers } = get();
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const locked = !layer.locked;

    objectsByLayer(id).forEach((obj) => {
      obj.selectable = !locked;
      obj.evented = !locked;
    });
    if (locked) _canvas?.discardActiveObject();
    _canvas?.renderAll();

    const newLayers = layers.map((l) => (l.id === id ? { ...l, locked } : l));
    set({ layers: newLayers });
  },

  moveLayer: (id, direction) => {
    const { layers } = get();
    const idx = layers.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const target = direction === 'up' ? idx + 1 : idx - 1;
    if (target < 0 || target >= layers.length) return;

    const newLayers = [...layers];
    [newLayers[idx], newLayers[target]] = [newLayers[target], newLayers[idx]];
    reorderCanvasObjects(newLayers);
    set({ layers: newLayers });
    const h = _pushSnapshot({ ...get(), layers: newLayers });
    set(h);
  },

  reorderLayerTo: (id, toIndex) => {
    const { layers } = get();
    const fromIndex = layers.findIndex((l) => l.id === id);
    if (fromIndex < 0 || fromIndex === toIndex) return;
    const clamped = Math.max(0, Math.min(toIndex, layers.length - 1));
    const newLayers = [...layers];
    const [moved] = newLayers.splice(fromIndex, 1);
    newLayers.splice(clamped, 0, moved);
    reorderCanvasObjects(newLayers);
    set({ layers: newLayers });
    const h = _pushSnapshot({ ...get(), layers: newLayers });
    set(h);
  },

  setLayerOpacity: (id, opacity) => {
    const clamped = Math.max(0, Math.min(1, opacity));
    objectsByLayer(id).forEach((obj) => { obj.opacity = clamped; });
    _canvas?.renderAll();
    set({ layers: get().layers.map((l) => (l.id === id ? { ...l, opacity: clamped } : l)) });
  },

  duplicateLayer: (id) => {
    if (!_canvas) return;
    const { layers } = get();
    const source = layers.find((l) => l.id === id);
    if (!source || source.isGroup) return;

    const newLayerId = crypto.randomUUID();
    const newLayer: CanvasLayer = {
      ...structuredClone(source),
      id: newLayerId,
      name: `${source.name} (copie)`,
    };

    // Clone fabric objects
    const sourceObjects = objectsByLayer(id);
    sourceObjects.forEach((obj) => {
      obj.clone().then((cloned: FabricObject) => {
        const d = (cloned as unknown as { data?: Record<string, unknown> }).data ?? {};
        (cloned as unknown as { data: Record<string, unknown> }).data = {
          ...d,
          objectId: crypto.randomUUID(),
          layerId: newLayerId,
        };
        cloned.opacity = newLayer.opacity;
        cloned.set({ left: (cloned.left ?? 0) + 15, top: (cloned.top ?? 0) + 15 });
        _canvas!.add(cloned);
        _canvas!.renderAll();
      });
    });

    const idx = layers.findIndex((l) => l.id === id);
    const newLayers = [...layers];
    newLayers.splice(idx + 1, 0, newLayer);
    set({ layers: newLayers, activeLayerId: newLayerId });
    const h = _pushSnapshot({ layers: newLayers, activeLayerId: newLayerId });
    set(h);
  },

  mergeLayerDown: (id) => {
    if (!_canvas) return;
    const { layers } = get();
    const idx = layers.findIndex((l) => l.id === id);
    if (idx <= 0) return; // no layer below
    const below = layers[idx - 1];
    if (below.type === 'garment' || below.isGroup) return;

    // Re-tag all objects from this layer to the layer below
    objectsByLayer(id).forEach((obj) => {
      const d = (obj as unknown as { data: Record<string, unknown> }).data;
      d.layerId = below.id;
    });
    _canvas.renderAll();

    const newLayers = layers.filter((l) => l.id !== id);
    const newActive = below.id;
    set({ layers: newLayers, activeLayerId: newActive });
    const h = _pushSnapshot({ layers: newLayers, activeLayerId: newActive });
    set(h);
  },

  // ── Groups ──────────────────────────────────────

  createGroup: (name) => {
    const { layers } = get();
    const group: CanvasLayer = {
      id: crypto.randomUUID(),
      name: name ?? `Groupe ${layers.filter((l) => l.isGroup).length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      isGroup: true,
      collapsed: false,
    };
    set({ layers: [...layers, group] });
    const h = _pushSnapshot({ ...get(), layers: [...layers, group] });
    set(h);
  },

  toggleGroupCollapse: (id) => {
    set({ layers: get().layers.map((l) => (l.id === id ? { ...l, collapsed: !l.collapsed } : l)) });
  },

  // ── Object CRUD ───────────────────────────────────

  addObject: (type, options = {}) => {
    if (!_canvas) return;
    const { activeLayerId, layers } = get();
    const layer = layers.find((l) => l.id === activeLayerId);
    if (!layer || layer.locked) return;

    const obj = createFabricObject(type, activeLayerId, options);
    if (!obj) return;

    obj.visible = layer.visible;
    obj.opacity = layer.opacity;
    if (layer.locked) {
      obj.selectable = false;
      obj.evented = false;
    }

    _canvas.add(obj);
    _canvas.setActiveObject(obj);
    _canvas.renderAll();

    const h = _pushSnapshot(get());
    set(h);
  },

  removeObject: (id) => {
    if (!_canvas) return;
    const targetId = id ?? get().selectedObjectIds[0];
    if (!targetId) return;

    const obj = _canvas.getObjects().find(
      (o) => (o as unknown as { data?: { objectId?: string } }).data?.objectId === targetId,
    );
    // Protect garment zone objects from deletion
    if ((obj as unknown as { data?: { zoneId?: string } })?.data?.zoneId) return;
    if (obj) {
      _canvas.remove(obj);
      _canvas.discardActiveObject();
      _canvas.renderAll();
    }

    set({ selectedObjectIds: get().selectedObjectIds.filter((s) => s !== targetId) });
    const h = _pushSnapshot(get());
    set(h);
  },

  clearCanvas: () => {
    if (!_canvas) return;

    _canvas.clear();
    _canvas.backgroundColor = '#FFFFFF';
    _canvas.renderAll();

    const layer: CanvasLayer = {
      id: crypto.randomUUID(),
      name: 'Calque 1',
      visible: true,
      locked: false,
      opacity: 1,
    };
    set({ layers: [layer], activeLayerId: layer.id, selectedObjectIds: [] });
    const h = _pushSnapshot({ layers: [layer], activeLayerId: layer.id });
    set(h);
  },

  // ── History ───────────────────────────────────────

  commitToHistory: () => {
    const h = _pushSnapshot(get());
    set(h);
  },

  undo: () => {
    if (_historyIndex <= 0 || !_canvas) return;
    _historyIndex--;
    const snap = _history[_historyIndex];
    _isRestoring = true;
    _canvas.loadFromJSON(snap.canvasJson).then(() => {
      _canvas!.renderAll();
      _isRestoring = false;
      set({
        layers: structuredClone(snap.layers),
        activeLayerId: snap.activeLayerId,
        selectedObjectIds: [],
        canUndo: _historyIndex > 0,
        canRedo: _historyIndex < _history.length - 1,
      });
    });
  },

  redo: () => {
    if (_historyIndex >= _history.length - 1 || !_canvas) return;
    _historyIndex++;
    const snap = _history[_historyIndex];
    _isRestoring = true;
    _canvas.loadFromJSON(snap.canvasJson).then(() => {
      _canvas!.renderAll();
      _isRestoring = false;
      set({
        layers: structuredClone(snap.layers),
        activeLayerId: snap.activeLayerId,
        selectedObjectIds: [],
        canUndo: _historyIndex > 0,
        canRedo: _historyIndex < _history.length - 1,
      });
    });
  },

  // ── Color ─────────────────────────────────────────

  applyFillToSelection: (color) => {
    if (!_canvas) return;
    const active = _canvas.getActiveObjects();
    if (active.length === 0) return;

    active.forEach((obj) => obj.set('fill', color));
    _canvas.renderAll();

    const h = _pushSnapshot(get());
    set(h);
  },

  // ── Serialization ─────────────────────────────────

  getSerializableState: () => {
    if (!_canvas) return null;
    return {
      canvasJson: _canvas.toObject(['data']),
      layers: structuredClone(get().layers),
      activeLayerId: get().activeLayerId,
    };
  },

  loadFromState: async (saved) => {
    if (!_canvas) return;
    _isRestoring = true;
    await _canvas.loadFromJSON(saved.canvasJson);
    _canvas.renderAll();
    _isRestoring = false;

    // Reset history with this as initial state
    _history = [];
    _historyIndex = -1;

    set({
      layers: structuredClone(saved.layers),
      activeLayerId: saved.activeLayerId,
      selectedObjectIds: [],
      canUndo: false,
      canRedo: false,
    });

    // Push initial snapshot
    requestAnimationFrame(() => {
      _pushSnapshot(get());
      set({ canUndo: false, canRedo: false });
    });
  },

  // ── Export ────────────────────────────────────────

  exportToPNG: (multiplier = 2) => {
    if (!_canvas) return null;
    return _canvas.toDataURL({ format: 'png', multiplier });
  },

  exportToSVG: () => {
    if (!_canvas) return null;
    return _canvas.toSVG();
  },

  // ── Selection sync ────────────────────────────────

  setSelectedObjectIds: (ids) => set({ selectedObjectIds: ids }),
}));
