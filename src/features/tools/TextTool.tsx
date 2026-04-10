import { useCanvasStore } from '../../stores/canvasStore';

const FONTS = [
  { name: 'Comic Sans', value: 'Comic Sans MS, cursive' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Courier', value: 'Courier New, monospace' },
  { name: 'Trebuchet', value: 'Trebuchet MS, sans-serif' },
];

const SIZES = [18, 24, 32, 48, 64];

export default function TextTool() {
  const { fontSize, fontFamily, setFontSize, setFontFamily, activeColor } = useCanvasStore();

  return (
    <div className="bg-white rounded-xl shadow-md p-3 space-y-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        Texte
      </h3>

      <p className="text-[10px] text-gray-400">
        Clique sur le canvas pour ajouter du texte
      </p>

      {/* Font family */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Police</p>
        <div className="space-y-1">
          {FONTS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFontFamily(f.value)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-all ${
                fontFamily === f.value
                  ? 'bg-purple-50 ring-2 ring-purple-300'
                  : 'hover:bg-gray-50'
              }`}
              style={{ fontFamily: f.value, color: fontFamily === f.value ? activeColor : '#374151' }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Taille</p>
        <div className="flex gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                fontSize === s
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        className="rounded-lg bg-gray-50 p-2 text-center truncate"
        style={{ fontFamily, fontSize: Math.min(fontSize, 32), color: activeColor }}
      >
        Abc 123
      </div>
    </div>
  );
}
