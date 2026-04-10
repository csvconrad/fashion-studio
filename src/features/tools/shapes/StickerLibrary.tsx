import { useState, useEffect, useCallback, useRef } from 'react';
import { stickerCategories } from './stickerCategories';
import { searchIcons, getIconSvg, type IconifyIcon } from './iconifyApi';
import { useCanvasStore } from '../../../stores/canvasStore';

// ─── Favorites + recents (localStorage) ──────────────────────────────

const FAV_KEY = 'fashion-studio-sticker-favs';
const RECENT_KEY = 'fashion-studio-sticker-recents';
const MAX_RECENTS = 20;

function loadSet(key: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(key) ?? '[]')); } catch { return new Set(); }
}
function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

// ─── Component ───────────────────────────────────────────────────────

export default function StickerLibrary() {
  const { activeColor, getCanvas } = useCanvasStore();

  const [activeTab, setActiveTab] = useState('fashion');
  const [search, setSearch] = useState('');
  const [icons, setIcons] = useState<IconifyIcon[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => loadSet(FAV_KEY));
  const [recents, setRecents] = useState(() => loadSet(RECENT_KEY));
  const [hovered, setHovered] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load icons for active category
  const loadCategory = useCallback(async (catId: string) => {
    const cat = stickerCategories.find((c) => c.id === catId);
    if (!cat) return;
    setLoading(true);
    // Search with multiple queries, deduplicate
    const allIcons: IconifyIcon[] = [];
    const seen = new Set<string>();
    for (const q of cat.queries.slice(0, 4)) {
      const result = await searchIcons(q, 12, cat.prefixes);
      for (const icon of result.icons) {
        if (!seen.has(icon.fullName)) { seen.add(icon.fullName); allIcons.push(icon); }
      }
    }
    setIcons(allIcons);
    setLoading(false);
  }, []);

  // Search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { loadCategory(activeTab); return; }
    setLoading(true);
    const result = await searchIcons(q, 40, ['noto', 'twemoji', 'fluent-emoji-flat', 'openmoji', 'lucide', 'ph']);
    setIcons(result.icons);
    setLoading(false);
  }, [activeTab, loadCategory]);

  useEffect(() => { loadCategory(activeTab); }, [activeTab, loadCategory]);

  const handleSearchInput = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => doSearch(val), 400);
  };

  // Add sticker to canvas
  const handleAddSticker = async (icon: IconifyIcon) => {
    const canvas = getCanvas();
    if (!canvas) return;

    const svg = await getIconSvg(icon.prefix, icon.name);
    if (!svg) return;

    // Extract paths from SVG and add as fabric objects
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');
    const state = useCanvasStore.getState();

    if (paths.length > 0) {
      // Combine all paths or use the first meaningful one
      const allD = Array.from(paths).map((p) => p.getAttribute('d')).filter(Boolean).join(' ');
      if (allD) {
        state.addObject('path', {
          path: allD,
          fill: activeColor,
          left: 350,
          top: 450,
          scaleX: 2,
          scaleY: 2,
        });
      }
    } else {
      // Fallback: add SVG as image
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      const { FabricImage } = await import('fabric');
      const img = await FabricImage.fromURL(dataUrl);
      img.set({
        left: 350, top: 450, scaleX: 1.5, scaleY: 1.5,
        data: { objectId: crypto.randomUUID(), layerId: state.activeLayerId },
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      state.commitToHistory();
    }

    // Track recents
    const newRecents = new Set([icon.fullName, ...recents]);
    if (newRecents.size > MAX_RECENTS) {
      const arr = [...newRecents];
      arr.length = MAX_RECENTS;
      setRecents(new Set(arr));
      saveSet(RECENT_KEY, new Set(arr));
    } else {
      setRecents(newRecents);
      saveSet(RECENT_KEY, newRecents);
    }
  };

  const toggleFav = (fullName: string) => {
    const next = new Set(favorites);
    if (next.has(fullName)) next.delete(fullName); else next.add(fullName);
    setFavorites(next);
    saveSet(FAV_KEY, next);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Rechercher un sticker..."
          className="w-full px-2.5 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:border-purple-300 focus:outline-none"
        />
      </div>

      {/* Category tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-thin">
        <CatTab id="favs" name="\u2B50" active={activeTab === 'favs'} onClick={() => setActiveTab('favs')} />
        <CatTab id="recents" name="\u{1F552}" active={activeTab === 'recents'} onClick={() => setActiveTab('recents')} />
        {stickerCategories.map((cat) => (
          <CatTab key={cat.id} id={cat.id} name={cat.icon} active={activeTab === cat.id} onClick={() => { setActiveTab(cat.id); setSearch(''); }} />
        ))}
      </div>

      {/* Icon grid */}
      <div className="h-[200px] overflow-y-auto scrollbar-thin p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-300 text-xs">Chargement...</div>
        ) : icons.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-300 text-xs">Aucun resultat</div>
        ) : (
          <div className="grid grid-cols-5 gap-1">
            {icons.map((icon) => (
              <div key={icon.fullName} className="relative group">
                <button
                  onClick={() => handleAddSticker(icon)}
                  onMouseEnter={() => setHovered(icon.fullName)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-full aspect-square rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center p-1"
                  title={icon.name}
                >
                  <img
                    src={`https://api.iconify.design/${icon.prefix}/${icon.name}.svg`}
                    alt={icon.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </button>

                {/* Fav star */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(icon.fullName); }}
                  className={`absolute top-0 right-0 w-4 h-4 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${
                    favorites.has(icon.fullName) ? 'text-yellow-400 opacity-100' : 'text-gray-300'
                  }`}
                >
                  {favorites.has(icon.fullName) ? '\u2605' : '\u2606'}
                </button>

                {/* Tooltip */}
                {hovered === icon.fullName && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    {icon.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CatTab({ id, name, active, onClick }: { id: string; name: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-2 py-1.5 text-sm transition-colors ${
        active ? 'border-b-2 border-purple-500 bg-purple-50/50' : 'hover:bg-gray-50'
      }`}
      title={id}
    >
      {name}
    </button>
  );
}
