import { useState, useRef, useCallback } from 'react';
import { useCanvasStore } from '../../../stores/canvasStore';
import { addImageToCanvas, fileToDataUrl, searchUnsplash, type UnsplashPhoto } from './imageUtils';

export default function ImagePanel() {
  const { getCanvas } = useCanvasStore();
  const [tab, setTab] = useState<'import' | 'unsplash'>('import');
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [searching, setSearching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ── Add image from file ──
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const canvas = getCanvas();
    if (!canvas) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await fileToDataUrl(file);
      await addImageToCanvas(dataUrl, canvas);
    }
  }, [getCanvas]);

  // ── Drag and drop ──
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── From URL ──
  const handleUrl = useCallback(async () => {
    if (!urlInput.trim()) return;
    const canvas = getCanvas();
    if (!canvas) return;
    setUrlLoading(true);
    try {
      const res = await fetch(urlInput.trim());
      const blob = await res.blob();
      const dataUrl = URL.createObjectURL(blob);
      await addImageToCanvas(dataUrl, canvas);
      setUrlInput('');
    } catch { /* silently fail */ }
    setUrlLoading(false);
  }, [urlInput, getCanvas]);

  // ── Camera ──
  const handleCamera = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => handleFiles(input.files);
    input.click();
  }, [handleFiles]);

  // ── Unsplash search ──
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!q.trim()) { setPhotos([]); return; }
      setSearching(true);
      const results = await searchUnsplash(q);
      setPhotos(results);
      setSearching(false);
    }, 400);
  }, []);

  const handleUnsplashAdd = useCallback(async (photo: UnsplashPhoto) => {
    const canvas = getCanvas();
    if (!canvas) return;
    await addImageToCanvas(photo.urls.regular, canvas);
  }, [getCanvas]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button onClick={() => setTab('import')}
          className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${tab === 'import' ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50' : 'text-gray-400'}`}>
          Importer
        </button>
        <button onClick={() => setTab('unsplash')}
          className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${tab === 'unsplash' ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50' : 'text-gray-400'}`}>
          Photos libres
        </button>
      </div>

      {tab === 'import' && (
        <div className="p-3 space-y-2">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 mx-auto mb-1 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-[10px] text-gray-400">Glisse une image ici ou clique</p>
            <p className="text-[9px] text-gray-300">PNG, JPG, SVG, WebP</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

          {/* Camera button (useful on tablet) */}
          <button onClick={handleCamera}
            className="w-full py-2 rounded-xl bg-gray-50 text-gray-500 text-[10px] hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center justify-center gap-1.5">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="16" height="12" rx="2" /><circle cx="10" cy="11" r="3" /><path d="M7 5l1-2h4l1 2" />
            </svg>
            Prendre une photo
          </button>

          {/* URL import */}
          <div className="flex gap-1">
            <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrl()}
              placeholder="Coller une URL d'image..."
              className="flex-1 px-2 py-1.5 text-[10px] border border-gray-200 rounded-lg focus:border-purple-300 focus:outline-none" />
            <button onClick={handleUrl} disabled={urlLoading || !urlInput.trim()}
              className="px-2 py-1.5 bg-purple-500 text-white text-[10px] rounded-lg hover:bg-purple-600 disabled:opacity-40 transition-colors">
              {urlLoading ? '...' : 'OK'}
            </button>
          </div>
        </div>
      )}

      {tab === 'unsplash' && (
        <div className="p-2 space-y-2">
          <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher des photos..."
            className="w-full px-2.5 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:border-purple-300 focus:outline-none" />

          <div className="h-[200px] overflow-y-auto scrollbar-thin">
            {searching ? (
              <div className="flex items-center justify-center h-full text-gray-300 text-xs">Recherche...</div>
            ) : photos.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-300 text-[10px]">
                {searchQuery ? 'Aucun resultat' : 'Tape un mot-cle pour chercher'}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {photos.map((p) => (
                  <button key={p.id} onClick={() => handleUnsplashAdd(p)}
                    className="rounded-lg overflow-hidden hover:ring-2 ring-purple-300 transition-all group relative">
                    <img src={p.urls.thumb} alt={p.alt_description ?? ''} className="w-full aspect-square object-cover" loading="lazy" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/40 px-1 py-0.5 text-[8px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.user.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!import.meta.env.VITE_UNSPLASH_ACCESS_KEY && (
            <p className="text-[9px] text-gray-400 text-center">
              Ajoute VITE_UNSPLASH_ACCESS_KEY pour activer la recherche Unsplash
            </p>
          )}
        </div>
      )}
    </div>
  );
}
