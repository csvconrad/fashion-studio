import { useState } from 'react';
import { geoShapes, SHAPE_CATEGORIES, type GeoShape } from './shapeGeometry';
import { shapes as decorativeShapes } from '../shapeData';
import StickerLibrary from './StickerLibrary';
import { useCanvasStore } from '../../../stores/canvasStore';

type Tab = 'geo' | 'deco' | 'stickers';

export default function ShapePanel() {
  const [tab, setTab] = useState<Tab>('geo');

  return (
    <div className="space-y-2">
      {/* Tab bar */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <TabBtn active={tab === 'geo'} onClick={() => setTab('geo')}>Formes</TabBtn>
        <TabBtn active={tab === 'deco'} onClick={() => setTab('deco')}>Motifs</TabBtn>
        <TabBtn active={tab === 'stickers'} onClick={() => setTab('stickers')}>Stickers</TabBtn>
      </div>

      {tab === 'geo' && <GeoShapeGrid />}
      {tab === 'deco' && <DecoShapeGrid />}
      {tab === 'stickers' && <StickerLibrary />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${
        active ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Geometric shapes grid ───────────────────────────────────────────

function GeoShapeGrid() {
  const { setPendingShape, pendingShapeId, activeColor } = useCanvasStore();
  const [activeCategory, setActiveCategory] = useState('basic');

  const filtered = geoShapes.filter((s) => s.category === activeCategory);

  // We reuse the shape tool mode — clicking a geo shape sets it as pending
  // and the canvas places it on click
  const handleSelect = (shape: GeoShape) => {
    // Store as "geo:circle" etc. to distinguish from decorative shapes
    const fullId = `geo:${shape.id}`;
    setPendingShape(pendingShapeId === fullId ? null : fullId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Category filter */}
      <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-thin">
        {SHAPE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex-1 py-1 text-[9px] font-medium transition-colors ${
              activeCategory === cat.id ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50' : 'text-gray-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="p-2 grid grid-cols-4 gap-1 max-h-[180px] overflow-y-auto scrollbar-thin">
        {filtered.map((shape) => {
          const fullId = `geo:${shape.id}`;
          const isActive = pendingShapeId === fullId;
          return (
            <button
              key={shape.id}
              onClick={() => handleSelect(shape)}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-lg border transition-all ${
                isActive ? 'border-purple-300 bg-purple-50' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
              title={shape.name}
            >
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                <path d={shape.pathData} fill={isActive ? activeColor : '#D1D5DB'} stroke="#9CA3AF" strokeWidth="2" />
              </svg>
              <span className="text-[8px] text-gray-400 truncate w-full text-center">{shape.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Decorative shapes grid (from shapeData.ts) ──────────────────────

function DecoShapeGrid() {
  const { setPendingShape, pendingShapeId, activeColor } = useCanvasStore();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
      <div className="grid grid-cols-4 gap-1.5">
        {decorativeShapes.map((shape) => {
          const isActive = pendingShapeId === shape.id;
          return (
            <button
              key={shape.id}
              onClick={() => setPendingShape(isActive ? null : shape.id)}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-lg border transition-all ${
                isActive ? 'border-purple-300 bg-purple-50' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
              title={shape.name}
            >
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                <path d={shape.pathData} fill={isActive ? activeColor : shape.defaultColor} stroke="#00000015" strokeWidth="2" />
              </svg>
              <span className="text-[8px] text-gray-400 truncate w-full text-center">{shape.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
