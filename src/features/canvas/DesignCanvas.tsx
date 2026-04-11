import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { useCanvasStore, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../stores/canvasStore';
import { getShape } from '../tools/shapeData';
import { getGeoShape } from '../tools/shapes/shapeGeometry';
import { BrushEngine } from '../tools/brushes/BrushEngine';
import { getBrush } from '../tools/brushes/brushData';
import { loadFont } from '../tools/text/fontData';

export default function DesignCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const [scale, setScale] = useState(1);

  const {
    setCanvas,
    getCanvas,
    commitToHistory,
    setSelectedObjectIds,
    activeTool,
    activeColor,
    activeBrushId,
    brushWidth,
    brushOpacity,
  } = useCanvasStore();

  // ── Initialize Fabric canvas ──────────────────────

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new FabricCanvas(canvasElRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#FFFFFF',
      selection: true,
      preserveObjectStacking: true,
    });

    setCanvas(canvas);

    // Selection events
    const handleSelection = () => {
      const ids = canvas
        .getActiveObjects()
        .map((obj) => (obj as unknown as { data?: { objectId?: string } }).data?.objectId)
        .filter((id): id is string => !!id);
      setSelectedObjectIds(ids);
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setSelectedObjectIds([]));
    canvas.on('object:modified', () => commitToHistory());

    // Click-to-place for text and shape tools
    canvas.on('mouse:down', (opt) => {
      const state = useCanvasStore.getState();

      if (state.activeTool === 'text') {
        if (opt.target) return;
        const pt = opt.scenePoint;
        loadFont(state.fontFamily).then(() => {
          state.addObject('textbox', {
            left: pt.x - 60, top: pt.y - 16,
            text: 'Texte', fontSize: state.fontSize, fontFamily: state.fontFamily,
            fill: state.activeColor, width: 250,
          });
          state.setActiveTool('select');
        });
      }

      if (state.activeTool === 'shape' && state.pendingShapeId) {
        const id = state.pendingShapeId;
        let pathData: string | undefined;

        if (id.startsWith('geo:')) {
          const geo = getGeoShape(id.slice(4));
          pathData = geo?.pathData;
        } else {
          pathData = getShape(id)?.pathData;
        }

        if (!pathData) return;
        state.addObject('path', {
          path: pathData,
          left: CANVAS_WIDTH / 2 - 75,
          top: CANVAS_HEIGHT / 2 - 75,
          fill: state.activeColor, scaleX: 1.5, scaleY: 1.5,
          stroke: '#00000020', strokeWidth: 1,
        });
        // Place once then switch to select so user can move/resize
        state.setPendingShape(null);
        state.setActiveTool('select');
      }
    });

    // Track cursor position for status bar
    canvas.on('mouse:move', (opt) => {
      if (opt.scenePoint) {
        useCanvasStore.getState().setCursorPos(opt.scenePoint.x, opt.scenePoint.y);
      }
    });

    // Zoom with mouse wheel
    canvas.on('mouse:wheel', (opt) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      const delta = e.deltaY;
      const state = useCanvasStore.getState();
      const newZoom = Math.max(0.25, Math.min(3, state.zoomLevel + (delta > 0 ? -0.1 : 0.1)));
      state.setZoomLevel(newZoom);
      canvas.setZoom(newZoom);
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
      setCanvas(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── BrushEngine lifecycle ─────────────────────────

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const brushDef = getBrush(activeBrushId) ?? getBrush('pen')!;
    const engine = new BrushEngine(canvas, brushDef, activeColor);
    engine.setSize(brushWidth);
    engine.setOpacity(brushOpacity);

    engine.onStrokeComplete = (path) => {
      const state = useCanvasStore.getState();
      const d = (path as unknown as { data?: Record<string, unknown> });
      d.data = {
        objectId: crypto.randomUUID(),
        layerId: state.activeLayerId,
      };
      state.commitToHistory();
    };

    brushEngineRef.current = engine;
  }, [activeBrushId, activeColor, brushWidth, brushOpacity, getCanvas]);

  // ── Sync tool mode with canvas ────────────────────

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    // Disable Fabric's built-in drawing in all modes — we use BrushEngine
    canvas.isDrawingMode = false;

    switch (activeTool) {
      case 'select':
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        break;
      case 'draw':
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        break;
      case 'text':
        canvas.selection = false;
        canvas.defaultCursor = 'text';
        break;
      case 'shape':
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        break;
      case 'image':
      case 'garment':
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        break;
    }
    canvas.renderAll();
  }, [activeTool, getCanvas]);

  // ── Pointer events for BrushEngine (draw mode) ────

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const getScaled = (e: PointerEvent): { x: number; y: number; pressure: number } => {
      const rect = (canvas as unknown as { lowerCanvasEl: HTMLCanvasElement }).lowerCanvasEl.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        pressure: e.pressure || 0.5,
      };
    };

    const el = (canvas as unknown as { upperCanvasEl: HTMLCanvasElement }).upperCanvasEl;

    const onDown = (e: PointerEvent) => {
      if (useCanvasStore.getState().activeTool !== 'draw') return;
      const p = getScaled(e);
      brushEngineRef.current?.onPointerDown(p.x, p.y, p.pressure);
    };
    const onMove = (e: PointerEvent) => {
      if (useCanvasStore.getState().activeTool !== 'draw') return;
      const p = getScaled(e);
      brushEngineRef.current?.onPointerMove(p.x, p.y, p.pressure);
    };
    const onUp = () => {
      if (useCanvasStore.getState().activeTool !== 'draw') return;
      brushEngineRef.current?.onPointerUp();
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onUp);
    };
  }, [getCanvas]);

  // ── Responsive scaling ────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => setScale(Math.min(container.clientWidth / CANVAS_WIDTH, 1));
    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts are handled in App.tsx

  // ── Render ────────────────────────────────────────

  return (
    <div ref={containerRef} className="w-full">
      <div className="mx-auto" style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}>
        <div
          className="rounded-lg shadow-[0_4px_40px_rgba(0,0,0,0.4)] overflow-hidden ring-1 ring-white/10"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  );
}
