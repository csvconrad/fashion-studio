import { useState, useRef, useCallback, useEffect } from 'react';
import { useCanvasStore, type CanvasLayer } from '../../stores/canvasStore';

// ─── Thumbnail generator ─────────────────────────────────────────────

function useLayerThumbnail(layerId: string, layers: CanvasLayer[]): string | null {
  const [src, setSrc] = useState<string | null>(null);
  const getCanvas = useCanvasStore((s) => s.getCanvas);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    // Briefly hide other layers, render thumbnail, restore
    const objects = canvas.getObjects();
    const visibility: boolean[] = objects.map((o) => o.visible ?? true);

    objects.forEach((obj) => {
      const lid = (obj as unknown as { data?: { layerId?: string } }).data?.layerId;
      obj.visible = lid === layerId;
    });

    canvas.renderAll();
    const url = canvas.toDataURL({ format: 'png', multiplier: 0.08 });
    setSrc(url);

    // Restore
    objects.forEach((obj, i) => { obj.visible = visibility[i]; });
    canvas.renderAll();
  }, [layerId, layers, getCanvas]);

  return src;
}

// ─── Single layer row ────────────────────────────────────────────────

function LayerRow({ layer, index }: { layer: CanvasLayer; index: number }) {
  const {
    activeLayerId, selectLayer, renameLayer, toggleLayerVisibility, toggleLayerLock,
    removeLayer, duplicateLayer, mergeLayerDown, toggleGroupCollapse,
    layers, reorderLayerTo,
  } = useCanvasStore();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [showMenu, setShowMenu] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbnail = useLayerThumbnail(layer.id, layers);

  const isActive = layer.id === activeLayerId;
  const isGroup = layer.isGroup;
  const isGarment = layer.type === 'garment';
  // ── Rename ──
  const startRename = () => {
    setEditName(layer.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 30);
  };

  const commitRename = () => {
    if (editName.trim() && editName.trim() !== layer.name) {
      renameLayer(layer.id, editName.trim());
    }
    setEditing(false);
  };

  // ── DnD ──
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', layer.id);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  };
  const handleDragEnd = () => { setDragging(false); setDragOver(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const fromId = e.dataTransfer.getData('text/plain');
    if (fromId && fromId !== layer.id) {
      // Find the target index in the layers array (reversed display)
      const realIndex = layers.length - 1 - index;
      reorderLayerTo(fromId, realIndex);
    }
  };

  const indent = layer.groupId ? 'pl-5' : 'pl-0';

  return (
    <div
      draggable={!isGarment && !editing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => selectLayer(layer.id)}
      className={`relative flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] cursor-pointer transition-all select-none ${indent} ${
        isActive ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50 border border-transparent'
      } ${dragging ? 'opacity-40' : ''} ${dragOver ? 'border-purple-400 bg-purple-50/50' : ''}`}
    >
      {/* Group expand/collapse */}
      {isGroup && (
        <button
          onClick={(e) => { e.stopPropagation(); toggleGroupCollapse(layer.id); }}
          className="w-4 h-4 flex items-center justify-center text-gray-400 text-[10px]"
        >
          {layer.collapsed ? '\u25B6' : '\u25BC'}
        </button>
      )}

      {/* Thumbnail */}
      {!isGroup && (
        <div className="w-7 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
          {thumbnail ? (
            <img src={thumbnail} alt="" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-gray-50" />
          )}
        </div>
      )}

      {/* Visibility */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
        className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${layer.visible ? 'text-gray-500' : 'text-gray-300'}`}
        title={layer.visible ? 'Masquer' : 'Afficher'}
      >
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          {layer.visible ? (
            <><ellipse cx="8" cy="8" rx="6" ry="4" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></>
          ) : (
            <><line x1="2" y1="2" x2="14" y2="14" /><ellipse cx="8" cy="8" rx="6" ry="4" /></>
          )}
        </svg>
      </button>

      {/* Lock */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
        className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${layer.locked ? 'text-orange-400' : 'text-gray-300'}`}
        title={layer.locked ? 'Deverrouiller' : 'Verrouiller'}
      >
        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
          {layer.locked ? (
            <><rect x="3" y="7" width="10" height="7" rx="1" /><path d="M5 7V5a3 3 0 0 1 6 0v2" /></>
          ) : (
            <><rect x="3" y="7" width="10" height="7" rx="1" /><path d="M5 7V5a3 3 0 0 1 6 0" /></>
          )}
        </svg>
      </button>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false); }}
            className="w-full text-[11px] bg-white border border-purple-300 rounded px-1 py-0.5 outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            onDoubleClick={(e) => { e.stopPropagation(); if (!isGarment) startRename(); }}
            className="block truncate"
          >
            {isGroup ? '\u{1F4C1} ' : isGarment ? '\u{1F455} ' : ''}{layer.name}
          </span>
        )}
      </div>

      {/* Opacity badge */}
      {!isGroup && layer.opacity < 1 && (
        <span className="text-[9px] text-gray-400 flex-shrink-0">{Math.round(layer.opacity * 100)}%</span>
      )}

      {/* Context menu trigger */}
      {!isGarment && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="w-4 h-4 flex items-center justify-center text-gray-300 hover:text-gray-500 flex-shrink-0"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
      )}

      {/* Context menu */}
      {showMenu && (
        <LayerContextMenu
          layer={layer}
          onClose={() => setShowMenu(false)}
          onRename={startRename}
          onDuplicate={() => { duplicateLayer(layer.id); setShowMenu(false); }}
          onMerge={() => { mergeLayerDown(layer.id); setShowMenu(false); }}
          onDelete={() => { removeLayer(layer.id); setShowMenu(false); }}
        />
      )}
    </div>
  );
}

// ─── Context menu ────────────────────────────────────────────────────

function LayerContextMenu({ layer, onClose, onRename, onDuplicate, onMerge, onDelete }: {
  layer: CanvasLayer;
  onClose: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onMerge: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const item = "w-full text-left px-3 py-1.5 text-[11px] hover:bg-purple-50 hover:text-purple-600 transition-colors";

  return (
    <div ref={ref} className="absolute right-0 top-full z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[130px]">
      <button onClick={() => { onRename(); onClose(); }} className={item}>Renommer</button>
      {!layer.isGroup && <button onClick={onDuplicate} className={item}>Dupliquer</button>}
      {!layer.isGroup && <button onClick={onMerge} className={item}>Fusionner vers le bas</button>}
      <hr className="my-1 border-gray-100" />
      <button onClick={onDelete} className={`${item} text-red-500 hover:bg-red-50 hover:text-red-600`}>Supprimer</button>
    </div>
  );
}

// ─── Opacity slider (shown for active layer) ─────────────────────────

function OpacitySlider({ layer }: { layer: CanvasLayer }) {
  const setLayerOpacity = useCanvasStore((s) => s.setLayerOpacity);
  const commitToHistory = useCanvasStore((s) => s.commitToHistory);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLayerOpacity(layer.id, parseFloat(e.target.value) / 100);
  }, [layer.id, setLayerOpacity]);

  const handleMouseUp = useCallback(() => {
    commitToHistory();
  }, [commitToHistory]);

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <svg viewBox="0 0 16 16" className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" strokeDasharray="3 2" />
      </svg>
      <input
        type="range"
        min="0"
        max="100"
        value={Math.round(layer.opacity * 100)}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="flex-1 h-1 accent-purple-500"
      />
      <span className="text-[10px] text-gray-400 w-7 text-right">{Math.round(layer.opacity * 100)}%</span>
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────

export default function LayersPanel() {
  const { layers, activeLayerId, addLayer, createGroup } = useCanvasStore();

  // Build display list: groups with children nested
  const displayLayers = buildDisplayList(layers);
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calques</h3>
        <div className="flex gap-1">
          <button onClick={() => createGroup()} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="Nouveau groupe">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h5l1.5 1.5H14v8H2z" />
            </svg>
          </button>
          <button onClick={() => addLayer()} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="Nouveau calque">+</button>
        </div>
      </div>

      {/* Opacity slider for active layer */}
      {activeLayer && !activeLayer.isGroup && (
        <OpacitySlider layer={activeLayer} />
      )}

      {/* Layer list */}
      <div className="max-h-[300px] overflow-y-auto scrollbar-thin p-1 space-y-0.5">
        {displayLayers.map((layer, i) => (
          <LayerRow key={layer.id} layer={layer} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Build a flat display list respecting group hierarchy and collapsed state */
function buildDisplayList(layers: CanvasLayer[]): CanvasLayer[] {
  const reversed = [...layers].reverse();
  const result: CanvasLayer[] = [];
  const collapsedGroups = new Set(reversed.filter((l) => l.isGroup && l.collapsed).map((l) => l.id));

  for (const layer of reversed) {
    // Skip children of collapsed groups
    if (layer.groupId && collapsedGroups.has(layer.groupId)) continue;
    result.push(layer);
  }

  return result;
}
