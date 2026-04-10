import { useState, useCallback } from 'react';
import { hexToHsl, hslToHex, generateHarmony, HARMONY_TYPES, type HarmonyType } from './colorUtils';
import { palettes, PALETTE_CATEGORIES } from './palettes';
import { useCanvasStore } from '../../../stores/canvasStore';

// ─── LocalStorage for recents + favorites + custom palettes ──────────

const RECENTS_KEY = 'fashion-studio-color-recents';
const FAVS_KEY = 'fashion-studio-color-favs';
const CUSTOM_PAL_KEY = 'fashion-studio-custom-palettes';
const MAX_RECENTS = 16;

function loadArr(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}
function saveArr(key: string, arr: string[]) { localStorage.setItem(key, JSON.stringify(arr)); }

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

// ─── ColorPanel ──────────────────────────────────────────────────────

export default function ColorPanel() {
  const { activeColor, setActiveColor, applyFillToSelection, selectedObjectIds, activeTool, getCanvas } = useCanvasStore();
  const [recents, setRecents] = useState(() => loadArr(RECENTS_KEY));
  const [favorites, setFavorites] = useState(() => loadArr(FAVS_KEY));
  const [customPalettes, setCustomPalettes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOM_PAL_KEY) ?? '[]') as { name: string; colors: string[] }[]; } catch { return []; }
  });
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [palCat, setPalCat] = useState(PALETTE_CATEGORIES[0]);
  const [eyedropping, setEyedropping] = useState(false);

  const hsl = hexToHsl(activeColor);

  const pickColor = useCallback((color: string) => {
    setActiveColor(color);
    // Track recents
    const next = [color, ...recents.filter((c) => c !== color)].slice(0, MAX_RECENTS);
    setRecents(next);
    saveArr(RECENTS_KEY, next);
    // Apply to selection in select mode
    if (activeTool === 'select' && selectedObjectIds.length > 0) {
      applyFillToSelection(color);
    }
  }, [recents, activeTool, selectedObjectIds, setActiveColor, applyFillToSelection]);

  const toggleFav = (color: string) => {
    const next = favorites.includes(color) ? favorites.filter((c) => c !== color) : [...favorites, color];
    setFavorites(next);
    saveArr(FAVS_KEY, next);
  };

  // Eyedropper
  const handleEyedrop = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    setEyedropping(true);

    const handler = (opt: { scenePoint: { x: number; y: number } }) => {
      const el = (canvas as unknown as { lowerCanvasEl: HTMLCanvasElement }).lowerCanvasEl;
      const ctx = el.getContext('2d');
      if (!ctx) return;
      const px = ctx.getImageData(opt.scenePoint.x, opt.scenePoint.y, 1, 1).data;
      const hex = '#' + [px[0], px[1], px[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
      pickColor(hex);
      canvas.off('mouse:down', handler as () => void);
      setEyedropping(false);
      canvas.defaultCursor = 'default';
    };

    canvas.defaultCursor = 'crosshair';
    canvas.on('mouse:down', handler);
  }, [getCanvas, pickColor]);

  // Save custom palette
  const saveCustomPalette = () => {
    if (recents.length < 2) return;
    const name = prompt('Nom de la palette :');
    if (!name) return;
    const pal = { name, colors: recents.slice(0, 8) };
    const next = [...customPalettes, pal];
    setCustomPalettes(next);
    localStorage.setItem(CUSTOM_PAL_KEY, JSON.stringify(next));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
      {/* HSL Picker */}
      <Section title="Couleur" defaultOpen={true}>
        <div className="space-y-2">
          {/* Hue bar */}
          <div>
            <div
              className="h-4 rounded-lg cursor-pointer"
              style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const h = ((e.clientX - rect.left) / rect.width) * 360;
                pickColor(hslToHex(h, hsl.s, hsl.l));
              }}
            />
          </div>

          {/* Saturation + Lightness */}
          <div className="flex gap-2">
            <div className="flex-1">
              <span className="text-[8px] text-gray-400">Saturation</span>
              <input type="range" min="0" max="100" value={Math.round(hsl.s * 100)}
                onChange={(e) => pickColor(hslToHex(hsl.h, +e.target.value / 100, hsl.l))}
                className="w-full h-1 accent-purple-500" />
            </div>
            <div className="flex-1">
              <span className="text-[8px] text-gray-400">Luminosite</span>
              <input type="range" min="0" max="100" value={Math.round(hsl.l * 100)}
                onChange={(e) => pickColor(hslToHex(hsl.h, hsl.s, +e.target.value / 100))}
                className="w-full h-1 accent-purple-500" />
            </div>
          </div>

          {/* Hex input + swatch + eyedropper */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg border border-gray-200" style={{ backgroundColor: activeColor }} />
            <input
              type="text"
              value={activeColor}
              onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) pickColor(e.target.value); }}
              className="flex-1 px-2 py-1 text-[11px] font-mono border border-gray-200 rounded-lg focus:border-purple-300 focus:outline-none"
              maxLength={7}
            />
            <button onClick={handleEyedrop}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${eyedropping ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              title="Pipette">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 3l-1-1-2 2-4 4-2 2-1 3 3-1 2-2 4-4 2-2z" /><path d="M10 6l-4 4" />
              </svg>
            </button>
            <button onClick={() => toggleFav(activeColor)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${favorites.includes(activeColor) ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              title="Favori">
              {favorites.includes(activeColor) ? '\u2605' : '\u2606'}
            </button>
          </div>
        </div>
      </Section>

      {/* Favorites */}
      {favorites.length > 0 && (
        <Section title={`Favoris (${favorites.length})`} defaultOpen={true}>
          <div className="flex flex-wrap gap-1">
            {favorites.map((c) => (
              <Swatch key={c} color={c} active={activeColor === c} onClick={() => pickColor(c)} />
            ))}
          </div>
        </Section>
      )}

      {/* Recents */}
      {recents.length > 0 && (
        <Section title="Recents" defaultOpen={true}>
          <div className="flex flex-wrap gap-1">
            {recents.map((c, i) => (
              <Swatch key={`${c}-${i}`} color={c} active={activeColor === c} onClick={() => pickColor(c)} />
            ))}
          </div>
        </Section>
      )}

      {/* Harmony generator */}
      <Section title="Harmonie">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {HARMONY_TYPES.map((ht) => (
              <button key={ht.id} onClick={() => setHarmonyType(ht.id)}
                className={`px-2 py-0.5 rounded text-[9px] transition-colors ${harmonyType === ht.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-400'}`}>
                {ht.name}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {generateHarmony(activeColor, harmonyType).map((c, i) => (
              <Swatch key={i} color={c} active={activeColor === c} onClick={() => pickColor(c)} size="lg" />
            ))}
          </div>
        </div>
      </Section>

      {/* Palettes */}
      <Section title="Palettes">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1 mb-1">
            {PALETTE_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setPalCat(cat)}
                className={`px-2 py-0.5 rounded text-[9px] transition-colors ${palCat === cat ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-400'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="max-h-[140px] overflow-y-auto scrollbar-thin space-y-1.5">
            {palettes.filter((p) => p.category === palCat).map((p) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <div className="flex flex-1 h-6 rounded-lg overflow-hidden border border-gray-100">
                  {p.colors.map((c, i) => (
                    <button key={i} onClick={() => pickColor(c)} className="flex-1 hover:scale-y-125 transition-transform" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
                <span className="text-[8px] text-gray-400 w-14 truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Custom palettes */}
      <Section title="Mes palettes">
        {customPalettes.length === 0 ? (
          <p className="text-[9px] text-gray-400">Utilise des couleurs puis sauvegarde-les comme palette</p>
        ) : (
          <div className="space-y-1.5">
            {customPalettes.map((p, pi) => (
              <div key={pi} className="flex items-center gap-1.5">
                <div className="flex flex-1 h-6 rounded-lg overflow-hidden border border-gray-100">
                  {p.colors.map((c, i) => (
                    <button key={i} onClick={() => pickColor(c)} className="flex-1 hover:scale-y-125 transition-transform" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
                <span className="text-[8px] text-gray-400 truncate">{p.name}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={saveCustomPalette}
          className="mt-1 w-full text-[9px] text-gray-400 hover:text-purple-500 py-1 border border-dashed border-gray-200 rounded-lg transition-colors">
          + Sauvegarder les recents comme palette
        </button>
      </Section>
    </div>
  );
}

function Swatch({ color, active, onClick, size = 'sm' }: { color: string; active: boolean; onClick: () => void; size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <button
      onClick={onClick}
      className={`${s} rounded-lg border-2 transition-all hover:scale-110 ${
        active ? 'border-purple-500 scale-110 ring-2 ring-purple-300' : 'border-gray-200'
      }`}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}
