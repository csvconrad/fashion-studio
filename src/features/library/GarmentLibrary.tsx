import { useEffect, useState, useRef, useCallback, memo } from 'react';
// Perf: lazy thumbnail loading via IntersectionObserver handles 1400+ items
import { useLibraryStore, type LibraryGarment } from '../../stores/libraryStore';
import { useGarmentStore } from '../../stores/garmentStore';

// ─── Lazy thumbnail with IntersectionObserver ────────────────────────

const LazyImg = memo(({ src, alt }: { src: string; alt: string }) => {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoaded(true); obs.disconnect(); }
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={loaded ? src : undefined}
      alt={alt}
      className={`w-full h-full object-contain transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
      loading="lazy"
    />
  );
});

// ─── GarmentCard ─────────────────────────────────────────────────────

const GarmentCard = memo(({ garment, onSelect }: { garment: LibraryGarment; onSelect: (g: LibraryGarment) => void }) => {
  const { toggleFavorite, isFavorite } = useLibraryStore();
  const fav = isFavorite(garment.id);

  return (
    <div className="p-1 h-full">
      <div
        className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group relative"
        onClick={() => onSelect(garment)}
      >
        {/* Thumbnail */}
        <div className="aspect-square bg-gray-50 p-2">
          <LazyImg src={garment.thumbnailPath} alt={garment.name} />
        </div>

        {/* Info */}
        <div className="px-2 py-1.5">
          <p className="text-[11px] font-medium text-gray-800 truncate">{garment.name}</p>
          <p className="text-[9px] text-gray-400 truncate">{garment.categoryLabel}</p>
        </div>

        {/* Favorite star */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(garment.id); }}
          className={`absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full transition-all ${
            fav ? 'bg-yellow-100 text-yellow-500' : 'bg-white/80 text-gray-300 opacity-0 group-hover:opacity-100'
          }`}
        >
          {fav ? '\u2605' : '\u2606'}
        </button>

        {/* Add button on hover */}
        <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-purple-500 text-white text-[10px] text-center py-1.5 rounded-md font-medium">
            Add to Canvas
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Family Navigator (left sidebar) ─────────────────────────────────

function FamilyNav() {
  const { families, categories, totalCount, favorites, recents, collections,
    selectedFamily, selectedCategory, specialFilter,
    setSelectedFamily, setSelectedCategory, setSpecialFilter,
    createCollection, deleteCollection } = useLibraryStore();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showNewCol, setShowNewCol] = useState(false);
  const [newColName, setNewColName] = useState('');

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const navBtn = (active: boolean) =>
    `w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
      active ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
    }`;

  const handleCreateCol = () => {
    if (newColName.trim()) { createCollection(newColName.trim()); setNewColName(''); setShowNewCol(false); }
  };

  return (
    <div className="w-56 flex-shrink-0 border-r border-gray-200 overflow-y-auto h-full p-2 space-y-0.5">
      {/* Special filters */}
      <button onClick={() => setSpecialFilter('all')} className={navBtn(specialFilter === 'all' && !selectedFamily && !selectedCategory)}>
        All Garments <span className="text-gray-400 ml-1">({totalCount})</span>
      </button>
      <button onClick={() => setSpecialFilter('favorites')} className={navBtn(specialFilter === 'favorites')}>
        Favorites <span className="text-gray-400 ml-1">({favorites.size})</span>
      </button>
      <button onClick={() => setSpecialFilter('recents')} className={navBtn(specialFilter === 'recents')}>
        Recently Used <span className="text-gray-400 ml-1">({recents.length})</span>
      </button>

      {/* Collections */}
      <div className="pt-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Collections</span>
          <button onClick={() => setShowNewCol(true)} className="text-[10px] text-purple-500 hover:text-purple-700">+</button>
        </div>
        {showNewCol && (
          <div className="flex gap-1 px-2 mb-1">
            <input type="text" value={newColName} onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCol()}
              className="flex-1 text-[10px] px-2 py-1 border border-gray-200 rounded" placeholder="Name..." autoFocus />
            <button onClick={handleCreateCol} className="text-[10px] text-purple-500 px-1">OK</button>
          </div>
        )}
        {collections.map((col) => (
          <div key={col.id} className="flex items-center group">
            <button onClick={() => setSpecialFilter(col.id)} className={`flex-1 ${navBtn(specialFilter === col.id)}`}>
              {col.name} <span className="text-gray-400 ml-1">({col.garmentIds.length})</span>
            </button>
            <button onClick={() => deleteCollection(col.id)} className="text-gray-300 hover:text-red-400 px-1 opacity-0 group-hover:opacity-100 text-[10px]">&times;</button>
          </div>
        ))}
      </div>

      <hr className="border-gray-200 my-2" />

      {/* Families */}
      {families.map((fam) => {
        const isExpanded = expanded.has(fam.id);
        const famCategories = categories.filter((c) => c.family === fam.id);
        return (
          <div key={fam.id}>
            <button
              onClick={() => { setSelectedFamily(fam.id); toggle(fam.id); }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                selectedFamily === fam.id && !selectedCategory ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{fam.label}</span>
              <span className="flex items-center gap-1 text-gray-400">
                <span>({fam.count})</span>
                <span className="text-[8px]">{isExpanded ? '\u25BC' : '\u25B6'}</span>
              </span>
            </button>
            {isExpanded && (
              <div className="ml-3 space-y-0.5">
                {famCategories.map((cat) => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-2 py-1 rounded text-[10px] transition-colors ${
                      selectedCategory === cat.id ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                    {cat.label} <span className="text-gray-400">({cat.count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Library Component ──────────────────────────────────────────

export default function GarmentLibrary({ onClose }: { onClose: () => void }) {
  const { loading, error, loadIndex, searchQuery, setSearchQuery, getFilteredGarments, sortBy, setSortBy, addToRecents, totalCount } = useLibraryStore();
  const { loadSvgAsZones } = useGarmentStore();
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => { loadIndex(); }, [loadIndex]);

  // Debounced search
  const handleSearch = useCallback((q: string) => {
    setLocalQuery(q);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearchQuery(q), 300);
  }, [setSearchQuery]);

  const filtered = getFilteredGarments();

  const handleSelect = useCallback(async (garment: LibraryGarment) => {
    addToRecents(garment.id);
    // Load SVG as individual colorable paths
    await loadSvgAsZones(garment.svgPath, garment.name);
    onClose();
  }, [addToRecents, loadSvgAsZones, onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="text-2xl mb-2">Loading library...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40" onClick={onClose}>
      <div className="flex w-full max-w-5xl mx-auto my-4 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Left nav */}
        <FamilyNav />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <div className="flex-1 relative">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search garments..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              />
              <svg viewBox="0 0 16 16" className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4" /><path d="M14 14l-3-3" />
              </svg>
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-[11px] border border-gray-200 rounded-lg px-2 py-2 bg-white">
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>

            <span className="text-[11px] text-gray-400 whitespace-nowrap">
              {filtered.length} of {totalCount}
            </span>

            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">&times;</button>
          </div>

          {/* Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            {error ? (
              <div className="flex items-center justify-center h-full text-red-500 text-sm">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No garments found</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2" style={{ contain: 'layout style' }}>
                {filtered.map((g) => (
                  <GarmentCard key={g.id} garment={g} onSelect={handleSelect} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
