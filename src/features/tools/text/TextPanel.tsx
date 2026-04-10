import { useState, useEffect, useCallback } from 'react';
import { fonts, FONT_CATEGORIES, loadFont, preloadFont, type FontCategory } from './fontData';
import { textTemplates, type TextTemplate } from './textTemplates';
import { useCanvasStore } from '../../../stores/canvasStore';
import type { Textbox } from 'fabric';

// ─── Collapsible section ─────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50">
        {title}
        <span className="text-gray-300">{open ? '\u25BC' : '\u25B6'}</span>
      </button>
      {open && <div className="px-3 pb-2">{children}</div>}
    </div>
  );
}

// ─── Main TextPanel ──────────────────────────────────────────────────

export default function TextPanel() {
  const { getCanvas, commitToHistory } = useCanvasStore();
  const { fontFamily, fontSize, setFontFamily, setFontSize } = useCanvasStore();
  const [fontCat, setFontCat] = useState<FontCategory>('sans');
  const [fontWeight, setFontWeight] = useState(400);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('center');
  const [charSpacing, setCharSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.3);
  const [strokeColor, setStrokeColor] = useState('');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState('#00000060');
  const [shadowBlur, setShadowBlur] = useState(8);
  const [shadowX, setShadowX] = useState(2);
  const [shadowY, setShadowY] = useState(2);

  // Get selected textbox from canvas
  const getSelectedText = useCallback((): Textbox | null => {
    const canvas = getCanvas();
    if (!canvas) return null;
    const active = canvas.getActiveObject();
    if (active && active.type === 'textbox') return active as Textbox;
    return null;
  }, [getCanvas]);

  // Apply a property to the selected textbox
  const applyToText = useCallback((props: Record<string, unknown>) => {
    const tb = getSelectedText();
    if (!tb) return;
    tb.set(props);
    const canvas = getCanvas();
    canvas?.renderAll();
    commitToHistory();
  }, [getSelectedText, getCanvas, commitToHistory]);

  // Sync state from selected textbox
  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const sync = () => {
      const tb = getSelectedText();
      if (!tb) return;
      setFontFamily(tb.fontFamily ?? 'Inter');
      setFontSize(tb.fontSize ?? 32);
      setFontWeight(tb.fontWeight as number ?? 400);
      setIsItalic(tb.fontStyle === 'italic');
      setTextAlign(tb.textAlign ?? 'center');
      setCharSpacing(tb.charSpacing ?? 0);
      setLineHeight(tb.lineHeight ?? 1.3);
    };
    canvas.on('selection:created', sync);
    canvas.on('selection:updated', sync);
    return () => {
      canvas.off('selection:created', sync as () => void);
      canvas.off('selection:updated', sync as () => void);
    };
  }, [getCanvas, getSelectedText, setFontFamily, setFontSize]);

  // Handle font change
  const handleFontChange = async (family: string) => {
    const def = fonts.find((f) => f.family === family);
    const weight = def?.weights.includes(fontWeight) ? fontWeight : (def?.weights[0] ?? 400);
    await loadFont(family, weight);
    setFontFamily(family);
    setFontWeight(weight);
    applyToText({ fontFamily: family, fontWeight: weight });
  };

  // Apply template
  const applyTemplate = async (t: TextTemplate) => {
    await loadFont(t.fontFamily, t.fontWeight);
    setFontFamily(t.fontFamily);
    setFontSize(t.fontSize);
    setFontWeight(t.fontWeight);
    setIsItalic(t.fontStyle === 'italic');
    setTextAlign(t.textAlign);
    setCharSpacing(t.charSpacing ?? 0);

    const props: Record<string, unknown> = {
      fontFamily: t.fontFamily,
      fontSize: t.fontSize,
      fontWeight: t.fontWeight,
      fontStyle: t.fontStyle || 'normal',
      fill: t.fill,
      textAlign: t.textAlign,
      charSpacing: t.charSpacing ?? 0,
      lineHeight: t.lineHeight ?? 1.3,
    };

    if (t.strokeColor && t.strokeWidth) {
      props.stroke = t.strokeColor;
      props.strokeWidth = t.strokeWidth;
    }

    if (t.shadowColor) {
      props.shadow = `${t.shadowColor} ${t.shadowOffsetX ?? 0}px ${t.shadowOffsetY ?? 0}px ${t.shadowBlur ?? 0}px`;
    }

    applyToText(props);
  };

  const filteredFonts = fonts.filter((f) => f.category === fontCat);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
      {/* Templates */}
      <Section title="Templates" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-1.5">
          {textTemplates.map((t) => {
            // Preload on hover
            return (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                onMouseEnter={() => preloadFont(t.fontFamily)}
                className="p-2 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all text-center overflow-hidden"
                style={{
                  fontFamily: `"${t.fontFamily}", sans-serif`,
                  fontSize: Math.min(t.fontSize * 0.35, 18),
                  fontWeight: t.fontWeight,
                  fontStyle: t.fontStyle || 'normal',
                  color: t.fill,
                  textShadow: t.shadowColor ? `${t.shadowOffsetX ?? 0}px ${t.shadowOffsetY ?? 0}px ${t.shadowBlur ?? 0}px ${t.shadowColor}` : undefined,
                  WebkitTextStroke: t.strokeWidth ? `${Math.min(t.strokeWidth, 1.5)}px ${t.strokeColor}` : undefined,
                }}
              >
                {t.preview}
                <div className="text-[8px] text-gray-400 font-normal mt-0.5" style={{ fontFamily: 'Inter, sans-serif', WebkitTextStroke: 'unset', textShadow: 'none', color: '#9CA3AF' }}>
                  {t.name}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Font family */}
      <Section title="Police" defaultOpen={true}>
        <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-thin">
          {FONT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFontCat(cat.id)}
              className={`flex-shrink-0 px-2 py-0.5 rounded text-[9px] transition-colors ${
                fontCat === cat.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="max-h-[120px] overflow-y-auto scrollbar-thin space-y-0.5">
          {filteredFonts.map((f) => (
            <button
              key={f.family}
              onClick={() => handleFontChange(f.family)}
              onMouseEnter={() => preloadFont(f.family)}
              className={`w-full text-left px-2 py-1 rounded text-sm truncate transition-colors ${
                fontFamily === f.family ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
              }`}
              style={{ fontFamily: `"${f.family}", sans-serif` }}
            >
              {f.family}
            </button>
          ))}
        </div>
      </Section>

      {/* Size & weight */}
      <Section title="Taille et poids">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-400 w-8">Taille</span>
            <input type="range" min="8" max="120" value={fontSize}
              onChange={(e) => { const v = +e.target.value; setFontSize(v); applyToText({ fontSize: v }); }}
              className="flex-1 h-1 accent-purple-500" />
            <input type="number" min="8" max="200" value={fontSize}
              onChange={(e) => { const v = +e.target.value; setFontSize(v); applyToText({ fontSize: v }); }}
              className="w-10 text-[10px] text-center border border-gray-200 rounded py-0.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-400 w-8">Poids</span>
            <input type="range" min="100" max="900" step="100" value={fontWeight}
              onChange={(e) => { const v = +e.target.value; setFontWeight(v); applyToText({ fontWeight: v }); }}
              className="flex-1 h-1 accent-purple-500" />
            <span className="text-[10px] text-gray-500 w-6 text-right">{fontWeight}</span>
          </div>
        </div>
      </Section>

      {/* Style */}
      <Section title="Style">
        <div className="flex gap-1">
          <StyleBtn active={isItalic} onClick={() => { setIsItalic(!isItalic); applyToText({ fontStyle: !isItalic ? 'italic' : 'normal' }); }}>
            <span className="italic">I</span>
          </StyleBtn>
          <StyleBtn active={false} onClick={() => applyToText({ underline: true })}>
            <span className="underline">U</span>
          </StyleBtn>
          <StyleBtn active={false} onClick={() => applyToText({ linethrough: true })}>
            <span className="line-through">S</span>
          </StyleBtn>
          <div className="w-px bg-gray-200 mx-1" />
          {(['left', 'center', 'right'] as const).map((a) => (
            <StyleBtn key={a} active={textAlign === a} onClick={() => { setTextAlign(a); applyToText({ textAlign: a }); }}>
              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="3" x2={a === 'right' ? '15' : a === 'center' ? '15' : '12'} y2="3" />
                <line x1={a === 'right' ? '5' : '1'} y1="7" x2={a === 'center' ? '12' : '15'} y2="7" />
                <line x1="1" y1="11" x2={a === 'right' ? '15' : a === 'center' ? '15' : '10'} y2="11" />
              </svg>
            </StyleBtn>
          ))}
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Espacement" defaultOpen={false}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-400 w-12">Lettres</span>
            <input type="range" min="-200" max="1000" value={charSpacing}
              onChange={(e) => { const v = +e.target.value; setCharSpacing(v); applyToText({ charSpacing: v }); }}
              className="flex-1 h-1 accent-purple-500" />
            <span className="text-[10px] text-gray-500 w-8 text-right">{charSpacing}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-400 w-12">Lignes</span>
            <input type="range" min="0.5" max="3" step="0.1" value={lineHeight}
              onChange={(e) => { const v = +e.target.value; setLineHeight(+v); applyToText({ lineHeight: +v }); }}
              className="flex-1 h-1 accent-purple-500" />
            <span className="text-[10px] text-gray-500 w-8 text-right">{lineHeight.toFixed(1)}</span>
          </div>
        </div>
      </Section>

      {/* Effects */}
      <Section title="Effets" defaultOpen={false}>
        <div className="space-y-3">
          {/* Outline */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] text-gray-400">Contour</span>
              <input type="range" min="0" max="5" step="0.5" value={strokeWidth}
                onChange={(e) => { const v = +e.target.value; setStrokeWidth(v); applyToText({ stroke: strokeColor || '#000000', strokeWidth: v }); }}
                className="flex-1 h-1 accent-purple-500" />
              <input type="color" value={strokeColor || '#000000'}
                onChange={(e) => { setStrokeColor(e.target.value); applyToText({ stroke: e.target.value, strokeWidth: strokeWidth || 1 }); }}
                className="w-5 h-5 rounded border border-gray-200 cursor-pointer" />
            </div>
          </div>

          {/* Shadow */}
          <div>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" checked={shadowEnabled}
                onChange={(e) => {
                  setShadowEnabled(e.target.checked);
                  if (!e.target.checked) applyToText({ shadow: null });
                  else applyToText({ shadow: `${shadowColor} ${shadowX}px ${shadowY}px ${shadowBlur}px` });
                }}
                className="accent-purple-500" />
              <span className="text-[9px] text-gray-400">Ombre</span>
            </label>
            {shadowEnabled && (
              <div className="space-y-1 pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-400 w-6">Flou</span>
                  <input type="range" min="0" max="30" value={shadowBlur}
                    onChange={(e) => { const v = +e.target.value; setShadowBlur(v); applyToText({ shadow: `${shadowColor} ${shadowX}px ${shadowY}px ${v}px` }); }}
                    className="flex-1 h-1 accent-purple-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-400 w-6">X/Y</span>
                  <input type="range" min="-10" max="10" value={shadowX}
                    onChange={(e) => { const v = +e.target.value; setShadowX(v); applyToText({ shadow: `${shadowColor} ${v}px ${shadowY}px ${shadowBlur}px` }); }}
                    className="flex-1 h-1 accent-purple-500" />
                  <input type="range" min="-10" max="10" value={shadowY}
                    onChange={(e) => { const v = +e.target.value; setShadowY(v); applyToText({ shadow: `${shadowColor} ${shadowX}px ${v}px ${shadowBlur}px` }); }}
                    className="flex-1 h-1 accent-purple-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-400 w-6">Coul.</span>
                  <input type="color" value={shadowColor}
                    onChange={(e) => { setShadowColor(e.target.value); applyToText({ shadow: `${e.target.value} ${shadowX}px ${shadowY}px ${shadowBlur}px` }); }}
                    className="w-5 h-5 rounded border border-gray-200 cursor-pointer" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

function StyleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${
        active ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}
