import { useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '../../../stores/canvasStore';
import { Shadow } from 'fabric';

// ─── Section wrapper ─────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50">
        {title}<span className="text-gray-300">{open ? '\u25BC' : '\u25B6'}</span>
      </button>
      {open && <div className="px-3 pb-2">{children}</div>}
    </div>
  );
}

// ─── Slider row ──────────────────────────────────────────────────────

function SliderRow({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-gray-400 w-14 flex-shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="flex-1 h-1 accent-purple-500" />
      <span className="text-[10px] text-gray-500 w-8 text-right flex-shrink-0">
        {step < 1 ? value.toFixed(1) : Math.round(value)}
      </span>
    </div>
  );
}

// ─── EffectsPanel ────────────────────────────────────────────────────

export default function EffectsPanel() {
  const { getCanvas, selectedObjectIds, commitToHistory } = useCanvasStore();

  // Shadow state
  const [shadowOn, setShadowOn] = useState(false);
  const [shadowColor, setShadowColor] = useState('#00000060');
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowX, setShadowX] = useState(4);
  const [shadowY, setShadowY] = useState(4);

  // Stroke state
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);

  // Opacity
  const [opacity, setOpacity] = useState(1);

  const getSelected = useCallback(() => {
    const canvas = getCanvas();
    return canvas?.getActiveObject() ?? null;
  }, [getCanvas]);

  // Sync from selection
  useEffect(() => {
    const obj = getSelected();
    if (!obj) return;
    setOpacity(obj.opacity ?? 1);
    setStrokeColor((obj.stroke as string) ?? '#000000');
    setStrokeWidth(obj.strokeWidth ?? 0);
    if (obj.shadow) {
      setShadowOn(true);
      const s = obj.shadow as Shadow;
      setShadowColor(s.color ?? '#00000060');
      setShadowBlur(s.blur ?? 10);
      setShadowX(s.offsetX ?? 4);
      setShadowY(s.offsetY ?? 4);
    } else {
      setShadowOn(false);
    }
  }, [selectedObjectIds, getSelected]);

  const apply = useCallback((props: Record<string, unknown>) => {
    const obj = getSelected();
    if (!obj) return;
    obj.set(props);
    getCanvas()?.renderAll();
  }, [getSelected, getCanvas]);

  const commit = useCallback(() => commitToHistory(), [commitToHistory]);

  const applyShadow = useCallback((on: boolean, color: string, blur: number, x: number, y: number) => {
    if (!on) { apply({ shadow: null }); return; }
    apply({ shadow: new Shadow({ color, blur, offsetX: x, offsetY: y }) });
  }, [apply]);

  if (selectedObjectIds.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
        <p className="text-[10px] text-gray-400 text-center">Selectionne un element pour voir les effets</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Opacity */}
      <Section title="Opacite" defaultOpen={true}>
        <SliderRow label="Opacite" value={opacity * 100} min={0} max={100}
          onChange={(v) => { setOpacity(v / 100); apply({ opacity: v / 100 }); }}
        />
        <div className="h-0" onMouseUp={commit} onTouchEnd={commit} />
      </Section>

      {/* Shadow */}
      <Section title="Ombre portee" defaultOpen={true}>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={shadowOn}
              onChange={(e) => { setShadowOn(e.target.checked); applyShadow(e.target.checked, shadowColor, shadowBlur, shadowX, shadowY); commit(); }}
              className="accent-purple-500" />
            <span className="text-[10px] text-gray-500">Activer</span>
            <input type="color" value={shadowColor.slice(0, 7)}
              onChange={(e) => { setShadowColor(e.target.value); applyShadow(shadowOn, e.target.value, shadowBlur, shadowX, shadowY); }}
              className="ml-auto w-5 h-5 rounded border border-gray-200 cursor-pointer" />
          </label>
          {shadowOn && (
            <>
              <SliderRow label="Flou" value={shadowBlur} min={0} max={40}
                onChange={(v) => { setShadowBlur(v); applyShadow(true, shadowColor, v, shadowX, shadowY); }} />
              <SliderRow label="Decalage X" value={shadowX} min={-20} max={20}
                onChange={(v) => { setShadowX(v); applyShadow(true, shadowColor, shadowBlur, v, shadowY); }} />
              <SliderRow label="Decalage Y" value={shadowY} min={-20} max={20}
                onChange={(v) => { setShadowY(v); applyShadow(true, shadowColor, shadowBlur, shadowX, v); }} />
            </>
          )}
        </div>
      </Section>

      {/* Stroke */}
      <Section title="Contour">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-400 w-14">Epaisseur</span>
            <input type="range" min={0} max={10} step={0.5} value={strokeWidth}
              onChange={(e) => { const v = +e.target.value; setStrokeWidth(v); apply({ stroke: strokeColor, strokeWidth: v }); }}
              className="flex-1 h-1 accent-purple-500" />
            <input type="color" value={strokeColor}
              onChange={(e) => { setStrokeColor(e.target.value); apply({ stroke: e.target.value, strokeWidth: strokeWidth || 1 }); commit(); }}
              className="w-5 h-5 rounded border border-gray-200 cursor-pointer" />
          </div>
        </div>
      </Section>
    </div>
  );
}
