import { useEffect, useRef } from 'react';
import { Canvas, Path, Circle } from 'fabric';
import { useDesignStore } from '../../stores/designStore';

// Mannequin SVG — silhouette simple et friendly
const MANNEQUIN_PATH =
  // Head
  'M 40 10 Q 40 0 50 0 Q 60 0 60 10 Q 60 22 50 22 Q 40 22 40 10 Z ' +
  // Neck
  'M 47 22 L 53 22 L 53 28 L 47 28 Z ' +
  // Body
  'M 35 28 L 65 28 L 68 65 L 32 65 Z ' +
  // Left arm
  'M 35 28 L 25 32 L 20 55 L 26 56 L 30 38 L 35 35 Z ' +
  // Right arm
  'M 65 28 L 75 32 L 80 55 L 74 56 L 70 38 L 65 35 Z ' +
  // Left leg
  'M 35 65 L 42 65 L 43 110 L 33 110 Z ' +
  // Right leg
  'M 58 65 L 65 65 L 67 110 L 57 110 Z';

export default function DesignCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const { currentDesign, activeColor, activeTool, selectedGarmentId, selectGarment, updateGarment } =
    useDesignStore();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 600,
      height: 700,
      backgroundColor: '#FFF9FB',
      selection: true,
    });
    fabricRef.current = canvas;

    // Draw mannequin (non-selectable background)
    const mannequin = new Path(MANNEQUIN_PATH, {
      left: 200,
      top: 80,
      fill: '#E8D5D0',
      stroke: '#D4B5AD',
      strokeWidth: 1,
      scaleX: 3,
      scaleY: 3.5,
      selectable: false,
      evented: false,
    });
    canvas.add(mannequin);

    // Decorative circles for fun background
    const dots = [
      { x: 50, y: 50, r: 8, color: '#FFE4F0' },
      { x: 540, y: 80, r: 12, color: '#E8E4FF' },
      { x: 80, y: 600, r: 10, color: '#E4FFF0' },
      { x: 520, y: 620, r: 6, color: '#FFF4E4' },
    ];
    dots.forEach((d) => {
      const circle = new Circle({
        left: d.x,
        top: d.y,
        radius: d.r,
        fill: d.color,
        selectable: false,
        evented: false,
      });
      canvas.add(circle);
    });

    canvas.renderAll();

    return () => {
      canvas.dispose();
    };
  }, []);

  // Rebuild garments when design changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !currentDesign) return;

    // Remove all garment objects (keep mannequin + decorative = first 5 objects)
    const baseCount = 5;
    while (canvas.getObjects().length > baseCount) {
      const obj = canvas.getObjects()[baseCount];
      canvas.remove(obj);
    }

    // Add garment instances
    currentDesign.garments.forEach((garment) => {
      const path = new Path(
        garmentSvgPaths[garment.templateId] || '',
        {
          left: garment.position.x,
          top: garment.position.y,
          fill: garment.color,
          stroke: '#00000020',
          strokeWidth: 1,
          scaleX: garment.scale.x,
          scaleY: garment.scale.y,
          angle: garment.rotation,
          selectable: true,
          hasControls: true,
          data: { garmentId: garment.id },
          opacity: 0.9,
        }
      );
      canvas.add(path);
    });

    canvas.renderAll();

    // Handle selection
    const onSelected = (e: { selected?: unknown[] }) => {
      if (e.selected && e.selected.length === 1) {
        const obj = e.selected[0] as { data?: { garmentId?: string } };
        if (obj?.data?.garmentId) {
          selectGarment(obj.data.garmentId);
        }
      }
    };
    const onCleared = () => selectGarment(null);
    const onModified = (e: { target?: { left?: number; top?: number; scaleX?: number; scaleY?: number; angle?: number; data?: { garmentId?: string } } }) => {
      const obj = e.target;
      if (obj?.data?.garmentId) {
        updateGarment(obj.data.garmentId, {
          position: { x: obj.left ?? 0, y: obj.top ?? 0 },
          scale: { x: obj.scaleX ?? 1, y: obj.scaleY ?? 1 },
          rotation: obj.angle ?? 0,
        });
      }
    };

    canvas.on('selection:created', onSelected);
    canvas.on('selection:updated', onSelected);
    canvas.on('selection:cleared', onCleared);
    canvas.on('object:modified', onModified);

    return () => {
      canvas.off('selection:created', onSelected as () => void);
      canvas.off('selection:updated', onSelected as () => void);
      canvas.off('selection:cleared', onCleared);
      canvas.off('object:modified', onModified as () => void);
    };
  }, [currentDesign, selectGarment, updateGarment]);

  // Apply color to selected garment
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedGarmentId || activeTool !== 'color') return;

    const objects = canvas.getObjects();
    for (const obj of objects) {
      const data = (obj as { data?: { garmentId?: string } }).data;
      if (data?.garmentId === selectedGarmentId) {
        (obj as Path).set('fill', activeColor);
        canvas.renderAll();
        updateGarment(selectedGarmentId, { color: activeColor });
        break;
      }
    }
  }, [activeColor, selectedGarmentId, activeTool, updateGarment]);

  return (
    <div className="flex justify-center">
      <div className="rounded-2xl shadow-lg overflow-hidden border-4 border-pink-200">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// Quick lookup for garment SVG paths
import { garmentTemplates } from '../garments/templates';

const garmentSvgPaths: Record<string, string> = {};
garmentTemplates.forEach((t) => {
  garmentSvgPaths[t.id] = t.svgPath;
});
