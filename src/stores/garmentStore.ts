import { create } from 'zustand';
import { Path, FabricImage } from 'fabric';
import { useCanvasStore, type CanvasLayer, CANVAS_WIDTH, CANVAS_HEIGHT } from './canvasStore';
import { getTemplate } from '../features/garments/templates';
import type { GarmentView } from '../types/garment';

interface GarmentStore {
  activeGarmentId: string | null;
  garmentLayerId: string | null;
  activeView: GarmentView;
  customImageUrl: string | null;

  loadGarment: (templateId: string) => void;
  loadFromImage: (dataUrl: string, name?: string) => Promise<void>;
  loadSvgAsZones: (svgUrl: string, name?: string) => Promise<void>;
  switchView: (view: GarmentView) => void;
  removeGarment: () => void;
  applyColorToSelectedZone: (color: string) => void;
}

export const useGarmentStore = create<GarmentStore>((set, get) => ({
  activeGarmentId: null,
  garmentLayerId: null,
  activeView: 'front',
  customImageUrl: null,

  // ── Load SVG as individual colorable paths ─────────────────────────
  loadSvgAsZones: async (svgUrl, name = 'Template') => {
    const canvas = useCanvasStore.getState().getCanvas();
    if (!canvas) return;

    // Remove existing garment
    const { garmentLayerId } = get();
    if (garmentLayerId) _removeGarmentFromCanvas(garmentLayerId);

    // Fetch SVG text
    let svgText: string;
    try {
      const res = await fetch(svgUrl);
      svgText = await res.text();
    } catch { return; }

    // Parse SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return;

    // Get viewBox for proper scaling
    const vbAttr = svgEl.getAttribute('viewBox');
    let vbX = 0, vbY = 0, vbW = 800, vbH = 600;
    if (vbAttr) {
      const parts = vbAttr.split(/[\s,]+/).map(Number);
      if (parts.length === 4) { [vbX, vbY, vbW, vbH] = parts; }
    } else {
      const wAttr = svgEl.getAttribute('width');
      const hAttr = svgEl.getAttribute('height');
      if (wAttr) vbW = parseFloat(wAttr);
      if (hAttr) vbH = parseFloat(hAttr);
    }

    // Extract all shape elements
    const shapeEls = svgEl.querySelectorAll('path, polygon, polyline, rect, circle, ellipse, line');
    if (shapeEls.length === 0) {
      // Fallback: load as image if no paths found
      await get().loadFromImage(svgUrl, name);
      return;
    }

    // Create garment layer
    const layerId = crypto.randomUUID();
    const garmentLayer: CanvasLayer = {
      id: layerId,
      name,
      visible: true,
      locked: false,
      opacity: 1,
      type: 'garment',
    };

    const { layers } = useCanvasStore.getState();
    useCanvasStore.setState({ layers: [garmentLayer, ...layers] });

    // Calculate scale to fit canvas
    const targetW = CANVAS_WIDTH * 0.7;
    const targetH = CANVAS_HEIGHT * 0.7;
    const scale = Math.min(targetW / vbW, targetH / vbH, 2);
    const offsetX = (CANVAS_WIDTH - vbW * scale) / 2 - vbX * scale;
    const offsetY = (CANVAS_HEIGHT - vbH * scale) / 2 - vbY * scale;

    let zoneIndex = 0;

    shapeEls.forEach((el) => {
      let pathData: string | null = null;

      // Convert each element to path data
      if (el.tagName === 'path') {
        pathData = el.getAttribute('d');
      } else if (el.tagName === 'polygon' || el.tagName === 'polyline') {
        const points = el.getAttribute('points');
        if (points) {
          const pts = points.trim().split(/[\s,]+/);
          const pairs: string[] = [];
          for (let i = 0; i < pts.length - 1; i += 2) {
            pairs.push(`${pts[i]},${pts[i + 1]}`);
          }
          pathData = `M ${pairs.join(' L ')}${el.tagName === 'polygon' ? ' Z' : ''}`;
        }
      } else if (el.tagName === 'rect') {
        const x = parseFloat(el.getAttribute('x') ?? '0');
        const y = parseFloat(el.getAttribute('y') ?? '0');
        const w = parseFloat(el.getAttribute('width') ?? '0');
        const h = parseFloat(el.getAttribute('height') ?? '0');
        if (w > 0 && h > 0) {
          pathData = `M ${x},${y} L ${x + w},${y} L ${x + w},${y + h} L ${x},${y + h} Z`;
        }
      } else if (el.tagName === 'circle') {
        const cx = parseFloat(el.getAttribute('cx') ?? '0');
        const cy = parseFloat(el.getAttribute('cy') ?? '0');
        const r = parseFloat(el.getAttribute('r') ?? '0');
        if (r > 0) {
          pathData = `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy} Z`;
        }
      } else if (el.tagName === 'ellipse') {
        const cx = parseFloat(el.getAttribute('cx') ?? '0');
        const cy = parseFloat(el.getAttribute('cy') ?? '0');
        const rx = parseFloat(el.getAttribute('rx') ?? '0');
        const ry = parseFloat(el.getAttribute('ry') ?? '0');
        if (rx > 0 && ry > 0) {
          pathData = `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
        }
      }

      if (!pathData) return;

      // Get fill/stroke from the element or its style
      const fill = _getComputedFill(el) || '#E0E0E0';
      const stroke = el.getAttribute('stroke') || _getStyleProp(el, 'stroke') || '#00000020';
      const strokeWidth = parseFloat(el.getAttribute('stroke-width') ?? _getStyleProp(el, 'stroke-width') ?? '1');

      try {
        const fabricPath = new Path(pathData, {
          fill: fill === 'none' ? 'transparent' : fill,
          stroke: stroke === 'none' ? 'transparent' : stroke,
          strokeWidth: strokeWidth * scale,
          scaleX: scale,
          scaleY: scale,
          left: offsetX,
          top: offsetY,
          selectable: true,
          hasControls: false,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          hoverCursor: 'pointer',
          data: {
            objectId: crypto.randomUUID(),
            layerId,
            zoneId: `zone-${zoneIndex}`,
            zoneName: el.getAttribute('id') || el.getAttribute('class') || `Zone ${zoneIndex + 1}`,
            garmentId: 'library',
          },
        });
        canvas.add(fabricPath);
        zoneIndex++;
      } catch {
        // Skip malformed paths
      }
    });

    if (zoneIndex === 0) {
      // No valid paths extracted — fallback to image
      useCanvasStore.setState({ layers: layers }); // revert layer add
      await get().loadFromImage(svgUrl, name);
      return;
    }

    // Move garment objects to back
    const garmentObjects = canvas.getObjects()
      .filter((obj) => _getData(obj).layerId === layerId);
    garmentObjects.forEach((obj, i) => {
      canvas.moveObjectTo(obj, i);
    });

    canvas.discardActiveObject();
    canvas.renderAll();

    set({ activeGarmentId: 'library', garmentLayerId: layerId, customImageUrl: svgUrl });
    useCanvasStore.getState().commitToHistory();
  },

  // ── Fallback: load as image (for non-SVG files) ────────────────────
  loadFromImage: async (dataUrl, name = 'Template') => {
    const canvas = useCanvasStore.getState().getCanvas();
    if (!canvas) return;

    const { garmentLayerId } = get();
    if (garmentLayerId) _removeGarmentFromCanvas(garmentLayerId);

    const layerId = crypto.randomUUID();
    const garmentLayer: CanvasLayer = {
      id: layerId,
      name,
      visible: true,
      locked: false,
      opacity: 1,
      type: 'garment',
    };

    const { layers } = useCanvasStore.getState();
    useCanvasStore.setState({ layers: [garmentLayer, ...layers] });

    // For SVG URLs: ensure proper dimensions
    let finalUrl = dataUrl;
    if (dataUrl.endsWith('.svg') || dataUrl.includes('.svg')) {
      try {
        const res = await fetch(dataUrl);
        let svgText = await res.text();
        const vbMatch = svgText.match(/viewBox=["']([^"']+)["']/);
        let svgW = 800, svgH = 600;
        if (vbMatch) {
          const parts = vbMatch[1].split(/\s+/).map(Number);
          if (parts.length === 4) { svgW = parts[2]; svgH = parts[3]; }
        }
        if (!svgText.includes('width=')) {
          svgText = svgText.replace('<svg', `<svg width="${svgW}" height="${svgH}"`);
        }
        finalUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
      } catch { /* fallback */ }
    }

    const img = await FabricImage.fromURL(finalUrl);
    const imgW = img.width ?? 400;
    const imgH = img.height ?? 600;
    const scale = Math.min((CANVAS_WIDTH * 0.75) / imgW, (CANVAS_HEIGHT * 0.75) / imgH, 1);

    img.set({
      left: (CANVAS_WIDTH - imgW * scale) / 2,
      top: (CANVAS_HEIGHT - imgH * scale) / 2,
      scaleX: scale,
      scaleY: scale,
      selectable: true,
      evented: true,
      hasControls: true,
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

    const { garmentLayerId } = get();
    if (garmentLayerId) _removeGarmentFromCanvas(garmentLayerId);

    const view = get().activeView;
    const zones = template.views[view];

    const layerId = crypto.randomUUID();
    const garmentLayer: CanvasLayer = {
      id: layerId,
      name: `${template.name} (${view === 'front' ? 'front' : view === 'back' ? 'back' : 'side'})`,
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

function _getComputedFill(el: Element): string | null {
  // Try attribute first, then inline style
  const attr = el.getAttribute('fill');
  if (attr && attr !== 'inherit') return attr;
  const style = el.getAttribute('style') ?? '';
  const match = style.match(/fill\s*:\s*([^;]+)/);
  if (match) return match[1].trim();
  // Check parent for inherited fill
  const parent = el.parentElement;
  if (parent && parent.tagName !== 'svg') {
    return _getComputedFill(parent);
  }
  return null;
}

function _getStyleProp(el: Element, prop: string): string | null {
  const style = el.getAttribute('style') ?? '';
  const match = style.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`));
  return match ? match[1].trim() : null;
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

  const allObjects = canvas.getObjects();
  const toRemove = allObjects.filter((obj) => {
    const d = _getData(obj);
    return d.layerId === layerId;
  });

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
