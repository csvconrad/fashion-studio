import { useEffect, useRef, useState } from 'react';
import { brushes, BRUSH_CATEGORIES, type BrushDef } from './brushData';
import { BrushEngine } from './BrushEngine';
import { useCanvasStore } from '../../../stores/canvasStore';

// ─── Brush preview thumbnail ─────────────────────────────────────────

function BrushPreview({ brush, color, size, opacity }: { brush: BrushDef; color: string; size?: number; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    BrushEngine.renderPreviewStroke(ctx, brush, color, 120, 40, size, opacity);
  }, [brush, color, size, opacity]);

  return <canvas ref={ref} width={120} height={40} className="w-full h-full" />;
}

// ─── Main BrushPanel ─────────────────────────────────────────────────

export default function BrushPanel() {
  const { activeColor } = useCanvasStore();
  const activeBrushId = useCanvasStore((s) => s.activeBrushId);
  const setBrush = useCanvasStore((s) => s.setActiveBrush);
  const brushSize = useCanvasStore((s) => s.brushWidth);
  const setBrushSize = useCanvasStore((s) => s.setBrushWidth);
  const brushOpacity = useCanvasStore((s) => s.brushOpacity);
  const setBrushOpacity = useCanvasStore((s) => s.setBrushOpacity);

  const [activeCategory, setActiveCategory] = useState<string>('base');
  const previewRef = useRef<HTMLCanvasElement>(null);

  const activeBrush = brushes.find((b) => b.id === activeBrushId) ?? brushes[0];
  const filteredBrushes = brushes.filter((b) => b.category === activeCategory && b.id !== 'eraser');

  // Live preview
  useEffect(() => {
    const ctx = previewRef.current?.getContext('2d');
    if (!ctx) return;
    BrushEngine.renderPreviewStroke(ctx, activeBrush, activeColor, 200, 60, brushSize, brushOpacity);
  }, [activeBrush, activeColor, brushSize, brushOpacity]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Category tabs */}
      <div className="flex border-b border-gray-100">
        {BRUSH_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${
              activeCategory === cat.id
                ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Brush grid */}
      <div className="p-2 grid grid-cols-2 gap-1.5">
        {filteredBrushes.map((b) => (
          <button
            key={b.id}
            onClick={() => setBrush(b.id)}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all ${
              activeBrushId === b.id
                ? 'border-purple-300 bg-purple-50 scale-[1.02]'
                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="w-full h-8 rounded bg-gray-50 overflow-hidden">
              <BrushPreview brush={b} color={activeColor} />
            </div>
            <span className="text-[9px] text-gray-500">{b.name}</span>
          </button>
        ))}

        {/* Eraser always at the end */}
        {(() => {
          const eraser = brushes.find((b) => b.id === 'eraser');
          if (!eraser) return null;
          return (
            <button
              onClick={() => setBrush('eraser')}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all ${
                activeBrushId === 'eraser'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="w-full h-8 rounded bg-gray-50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 20H7L3 16l9-9 8 8-4 4" /><path d="M18 13l-6-6" />
                </svg>
              </div>
              <span className="text-[9px] text-gray-500">Gomme</span>
            </button>
          );
        })()}
      </div>

      {/* Settings */}
      <div className="px-3 pb-3 space-y-2">
        {/* Size slider */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400 w-8">Taille</span>
          <input
            type="range"
            min={activeBrush.sizeRange[0]}
            max={activeBrush.sizeRange[1]}
            value={brushSize}
            onChange={(e) => setBrushSize(parseFloat(e.target.value))}
            className="flex-1 h-1 accent-purple-500"
          />
          <span className="text-[10px] text-gray-500 w-6 text-right">{Math.round(brushSize)}</span>
        </div>

        {/* Opacity slider */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400 w-8">Opacite</span>
          <input
            type="range"
            min={activeBrush.opacityRange[0] * 100}
            max={activeBrush.opacityRange[1] * 100}
            value={brushOpacity * 100}
            onChange={(e) => setBrushOpacity(parseFloat(e.target.value) / 100)}
            className="flex-1 h-1 accent-purple-500"
          />
          <span className="text-[10px] text-gray-500 w-6 text-right">{Math.round(brushOpacity * 100)}%</span>
        </div>

        {/* Live preview */}
        <div className="rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
          <canvas ref={previewRef} width={200} height={60} className="w-full h-[48px]" />
        </div>
      </div>
    </div>
  );
}
