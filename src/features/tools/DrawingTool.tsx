import { useCanvasStore } from '../../stores/canvasStore';

const BRUSH_SIZES = [
  { label: 'Fin', value: 2 },
  { label: 'Moyen', value: 5 },
  { label: 'Epais', value: 10 },
  { label: 'Gros', value: 20 },
];

export default function DrawingTool() {
  const { brushWidth, setBrushWidth, activeColor } = useCanvasStore();

  return (
    <div className="bg-white rounded-xl shadow-md p-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
        Pinceau
      </h3>

      {/* Brush width */}
      <div className="flex items-center gap-2 justify-center">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => setBrushWidth(size.value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              brushWidth === size.value
                ? 'bg-purple-50 ring-2 ring-purple-300'
                : 'hover:bg-gray-50'
            }`}
            title={size.label}
          >
            <div
              className="rounded-full"
              style={{
                width: Math.max(size.value * 1.5, 6),
                height: Math.max(size.value * 1.5, 6),
                backgroundColor: activeColor,
              }}
            />
            <span className="text-[9px] text-gray-400">{size.label}</span>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="mt-3 flex justify-center">
        <svg width="140" height="40" className="rounded-lg bg-gray-50">
          <path
            d="M 10,30 Q 35,5 70,25 Q 105,45 130,15"
            fill="none"
            stroke={activeColor}
            strokeWidth={brushWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
