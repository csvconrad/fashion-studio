import { useState } from 'react';
import { geoShapes, SHAPE_CATEGORIES, type GeoShape } from './shapeGeometry';
import { shapes as decorativeShapes } from '../shapeData';
import StickerLibrary from './StickerLibrary';
import { useCanvasStore, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../stores/canvasStore';

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
  const { addObject, setActiveTool, activeColor } = useCanvasStore();
  const [activeCategory, setActiveCategory] = useState('basic');

  const filtered = geoShapes.filter((s) => s.category === activeCategory);

  const handleSelect = (shape: GeoShape) => {
    addObject('path', {
      path: shape.pathData,
      left: CANVAS_WIDTH / 2 - 75,
      top: CANVAS_HEIGHT / 2 - 75,
      fill: activeColor, scaleX: 1.5, scaleY: 1.5,
      stroke: '#00000020', strokeWidth: 1,
    });
    setActiveTool('select');
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
        {filtered.map((shape) => (
            <button
              key={shape.id}
              onClick={() => handleSelect(shape)}
              className="flex flex-col items-center gap-0.5 p-1 rounded-lg border border-transparent hover:border-purple-200 hover:bg-purple-50/30 transition-all active:scale-90"
              title={shape.name}
            >
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                <path d={shape.pathData} fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2" />
              </svg>
              <span className="text-[8px] text-gray-400 truncate w-full text-center">{shape.name}</span>
            </button>
        ))}
      </div>
    </div>
  );
}

// ─── Decorative shapes grid (from shapeData.ts) ──────────────────────

function DecoShapeGrid() {
  const { addObject, setActiveTool, activeColor } = useCanvasStore();

  const handleAdd = (pathData: string) => {
    addObject('path', {
      path: pathData,
      left: CANVAS_WIDTH / 2 - 75,
      top: CANVAS_HEIGHT / 2 - 75,
      fill: activeColor, scaleX: 1.5, scaleY: 1.5,
      stroke: '#00000015', strokeWidth: 1,
    });
    setActiveTool('select');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
      <div className="grid grid-cols-4 gap-1.5">
        {decorativeShapes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => handleAdd(shape.pathData)}
              className="flex flex-col items-center gap-0.5 p-1 rounded-lg border border-transparent hover:border-purple-200 hover:bg-purple-50/30 transition-all active:scale-90"
              title={shape.name}
            >
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                <path d={shape.pathData} fill={shape.defaultColor} stroke="#00000015" strokeWidth="2" />
              </svg>
              <span className="text-[8px] text-gray-400 truncate w-full text-center">{shape.name}</span>
            </button>
        ))}
      </div>
    </div>
  );
}
