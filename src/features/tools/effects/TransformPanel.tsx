import { useCallback } from 'react';
import { useCanvasStore, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../stores/canvasStore';

export default function TransformPanel() {
  const { getCanvas, selectedObjectIds, commitToHistory } = useCanvasStore();

  const getObj = useCallback(() => getCanvas()?.getActiveObject() ?? null, [getCanvas]);

  const transform = useCallback((fn: (obj: { set: (p: Record<string, unknown>) => void; left?: number; top?: number; scaleX?: number; scaleY?: number; angle?: number; width?: number; height?: number; flipX?: boolean; flipY?: boolean }) => void) => {
    const obj = getObj();
    if (!obj) return;
    fn(obj as unknown as Parameters<typeof fn>[0]);
    getCanvas()?.renderAll();
    commitToHistory();
  }, [getObj, getCanvas, commitToHistory]);

  if (selectedObjectIds.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
        <p className="text-[10px] text-gray-400 text-center">Selectionne un element</p>
      </div>
    );
  }

  const btn = "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-[10px] hover:bg-purple-50 hover:text-purple-600 transition-colors active:scale-95";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Transform */}
      <div className="px-3 py-2 border-b border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Transformer</h3>
        <div className="grid grid-cols-3 gap-1">
          <button className={btn} onClick={() => transform((o) => o.set({ flipX: !o.flipX }))}>
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 3h14M1 13h14M4 8h-3l3-4v8l-3-4M12 8h3l-3-4v8l3-4" /></svg>
            Miroir H
          </button>
          <button className={btn} onClick={() => transform((o) => o.set({ flipY: !o.flipY }))}>
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1v14M13 1v14M8 4V1l-4 3h8l-4-3M8 12v3l-4-3h8l-4 3" /></svg>
            Miroir V
          </button>
          <button className={btn} onClick={() => transform((o) => o.set({ angle: ((o.angle ?? 0) + 90) % 360 }))}>
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4l-2-2M12 4l-2 2M12 4A6 6 0 1 1 4 4" /></svg>
            +90°
          </button>
        </div>
      </div>

      {/* Align */}
      <div className="px-3 py-2 border-b border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Aligner</h3>
        <div className="grid grid-cols-3 gap-1">
          <button className={btn} onClick={() => transform((o) => o.set({ left: 0 }))}>
            <AlignIcon lines={[1, 1, 1]} side="left" /> Gauche
          </button>
          <button className={btn} onClick={() => transform((o) => {
            const w = (o.width ?? 100) * (o.scaleX ?? 1);
            o.set({ left: (CANVAS_WIDTH - w) / 2 });
          })}>
            <AlignIcon lines={[4, 2, 3]} side="center" /> Centre H
          </button>
          <button className={btn} onClick={() => transform((o) => {
            const w = (o.width ?? 100) * (o.scaleX ?? 1);
            o.set({ left: CANVAS_WIDTH - w });
          })}>
            <AlignIcon lines={[1, 1, 1]} side="right" /> Droite
          </button>
          <button className={btn} onClick={() => transform((o) => o.set({ top: 0 }))}>
            <AlignIcon lines={[1, 1, 1]} side="top" /> Haut
          </button>
          <button className={btn} onClick={() => transform((o) => {
            const h = (o.height ?? 100) * (o.scaleY ?? 1);
            o.set({ top: (CANVAS_HEIGHT - h) / 2 });
          })}>
            <AlignIcon lines={[4, 2, 3]} side="center" /> Centre V
          </button>
          <button className={btn} onClick={() => transform((o) => {
            const h = (o.height ?? 100) * (o.scaleY ?? 1);
            o.set({ top: CANVAS_HEIGHT - h });
          })}>
            <AlignIcon lines={[1, 1, 1]} side="bottom" /> Bas
          </button>
        </div>
      </div>

      {/* Center on canvas */}
      <div className="px-3 py-2">
        <button
          onClick={() => transform((o) => {
            const w = (o.width ?? 100) * (o.scaleX ?? 1);
            const h = (o.height ?? 100) * (o.scaleY ?? 1);
            o.set({ left: (CANVAS_WIDTH - w) / 2, top: (CANVAS_HEIGHT - h) / 2 });
          })}
          className="w-full py-1.5 rounded-lg bg-purple-50 text-purple-600 text-[10px] font-medium hover:bg-purple-100 transition-colors active:scale-95"
        >
          Centrer sur le canvas
        </button>
      </div>
    </div>
  );
}

function AlignIcon({ side }: { lines?: number[]; side: string }) {
  return (
    <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1">
      {side === 'left' && <><line x1="1" y1="1" x2="1" y2="11" strokeWidth="1.5" /><line x1="3" y1="3" x2="9" y2="3" /><line x1="3" y1="6" x2="7" y2="6" /><line x1="3" y1="9" x2="10" y2="9" /></>}
      {side === 'right' && <><line x1="11" y1="1" x2="11" y2="11" strokeWidth="1.5" /><line x1="3" y1="3" x2="9" y2="3" /><line x1="5" y1="6" x2="9" y2="6" /><line x1="2" y1="9" x2="9" y2="9" /></>}
      {side === 'center' && <><line x1="6" y1="1" x2="6" y2="11" strokeWidth="0.5" strokeDasharray="1 1" /><line x1="2" y1="3" x2="10" y2="3" /><line x1="3" y1="6" x2="9" y2="6" /><line x1="1" y1="9" x2="11" y2="9" /></>}
      {side === 'top' && <><line x1="1" y1="1" x2="11" y2="1" strokeWidth="1.5" /><line x1="3" y1="3" x2="3" y2="9" /><line x1="6" y1="3" x2="6" y2="7" /><line x1="9" y1="3" x2="9" y2="10" /></>}
      {side === 'bottom' && <><line x1="1" y1="11" x2="11" y2="11" strokeWidth="1.5" /><line x1="3" y1="3" x2="3" y2="9" /><line x1="6" y1="5" x2="6" y2="9" /><line x1="9" y1="2" x2="9" y2="9" /></>}
    </svg>
  );
}
