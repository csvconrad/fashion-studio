import { shapes } from './shapeData';
import { useCanvasStore } from '../../stores/canvasStore';

export default function ShapeLibrary() {
  const { pendingShapeId, setPendingShape, activeColor } = useCanvasStore();

  return (
    <div className="bg-white rounded-xl shadow-md p-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
        Motifs
      </h3>
      <p className="text-[10px] text-gray-400 mb-2">
        Choisis un motif puis clique sur le canvas
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {shapes.map((shape) => {
          const isActive = pendingShapeId === shape.id;
          return (
            <button
              key={shape.id}
              onClick={() => setPendingShape(isActive ? null : shape.id)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-all ${
                isActive
                  ? 'border-purple-400 bg-purple-50 scale-105'
                  : 'border-transparent hover:border-purple-200 hover:bg-purple-50/40'
              }`}
              title={shape.name}
            >
              <svg viewBox="0 0 100 100" className="w-9 h-9">
                <path
                  d={shape.pathData}
                  fill={isActive ? activeColor : shape.defaultColor}
                  stroke="#00000015"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-[9px] text-gray-500 leading-tight">{shape.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
