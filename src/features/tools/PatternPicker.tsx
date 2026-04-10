import { useDesignStore } from '../../stores/designStore';
import { patternPresets } from '../garments/templates';

export default function PatternPicker() {
  const { activePattern, setActivePattern, setActiveTool, activeColor } =
    useDesignStore();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">
        Motifs
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {patternPresets.map((pattern) => (
          <button
            key={pattern.id}
            title={pattern.name}
            className={`w-14 h-14 rounded-xl border-2 transition-transform hover:scale-105 ${
              activePattern?.id === pattern.id
                ? 'border-gray-800 scale-105 ring-2 ring-purple-300'
                : 'border-gray-200'
            }`}
            style={{
              backgroundColor: activeColor,
              backgroundImage: pattern.preview || 'none',
              backgroundSize: pattern.type === 'dots' || pattern.type === 'custom' ? '12px 12px' : undefined,
            }}
            onClick={() => {
              setActivePattern(pattern);
              setActiveTool('pattern');
            }}
          >
            <span className="text-[10px] text-white font-bold drop-shadow-md">
              {pattern.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
