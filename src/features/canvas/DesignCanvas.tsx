import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
import { useCanvasStore, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../stores/canvasStore';
import { getShape } from '../tools/shapeData';

export default function DesignCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const {
    setCanvas,
    getCanvas,
    removeObject,
    undo,
    commitToHistory,
    setSelectedObjectIds,
    activeTool,
    activeColor,
    brushWidth,
    setActiveTool,
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

    // Set up default brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);

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

    // Commit to history after user drags/resizes/rotates
    canvas.on('object:modified', () => commitToHistory());

    // Tag drawn paths with layer data and commit
    canvas.on('path:created', (opt) => {
      const state = useCanvasStore.getState();
      const p = opt.path as unknown as { data?: Record<string, string> };
      p.data = {
        objectId: crypto.randomUUID(),
        layerId: state.activeLayerId,
      };
      state.commitToHistory();
    });

    // Click-to-place for text and shape tools
    canvas.on('mouse:down', (opt) => {
      const state = useCanvasStore.getState();

      if (state.activeTool === 'text') {
        // Only place text if clicking empty space (no target) or explicitly on canvas
        if (opt.target) return;
        const pt = opt.scenePoint;
        state.addObject('textbox', {
          left: pt.x - 60,
          top: pt.y - 16,
          text: 'Texte',
          fontSize: state.fontSize,
          fontFamily: state.fontFamily,
          fill: state.activeColor,
          width: 200,
        });
        // Switch to select so user can edit the text immediately
        state.setActiveTool('select');
      }

      if (state.activeTool === 'shape' && state.pendingShapeId) {
        const shape = getShape(state.pendingShapeId);
        if (!shape) return;
        const pt = opt.scenePoint;
        state.addObject('path', {
          path: shape.pathData,
          left: pt.x - 75,
          top: pt.y - 75,
          fill: state.activeColor,
          scaleX: 1.5,
          scaleY: 1.5,
          stroke: '#00000015',
          strokeWidth: 1,
        });
        // Stay in shape mode for rapid placement
      }
    });

    return () => {
      canvas.dispose();
      setCanvas(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync tool mode with canvas ────────────────────

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    switch (activeTool) {
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.getObjects().forEach((obj) => {
          if ((obj as unknown as { data?: { zoneId?: string } }).data?.zoneId) {
            obj.hoverCursor = 'pointer';
          }
        });
        break;
      case 'draw':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = activeColor;
          canvas.freeDrawingBrush.width = brushWidth;
        }
        break;
      case 'text':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'text';
        break;
      case 'shape':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        break;
    }
    canvas.renderAll();
  }, [activeTool, activeColor, brushWidth, getCanvas]);

  // ── Keep brush color/width in sync while drawing ──

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas || activeTool !== 'draw' || !canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushWidth;
  }, [activeColor, brushWidth, activeTool, getCanvas]);

  // ── Responsive scaling ────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const w = container.clientWidth;
      setScale(Math.min(w / CANVAS_WIDTH, 1));
    };

    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();

    return () => observer.disconnect();
  }, []);

  // ── Keyboard shortcuts ────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (meta && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useCanvasStore.getState().redo();
      } else if (meta && e.key === 'y') {
        e.preventDefault();
        useCanvasStore.getState().redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !meta) {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
        // Don't delete while editing a textbox on canvas
        const canvas = getCanvas();
        if (canvas && (canvas as unknown as { _activeObject?: { isEditing?: boolean } })._activeObject?.isEditing) return;
        e.preventDefault();
        removeObject();
      } else if (e.key === 'Escape') {
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, removeObject, getCanvas, setActiveTool]);

  // ── Render ────────────────────────────────────────

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="mx-auto"
        style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
      >
        <div
          className="rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-hidden"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  );
}
