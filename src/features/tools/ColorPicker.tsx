import { useDesignStore } from '../../stores/designStore';
import { colorPalette } from '../garments/templates';

export default function ColorPicker() {
  const { activeColor, setActiveColor, setActiveTool } = useDesignStore();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">
        Couleurs
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {colorPalette.map((color) => (
          <button
            key={color.value}
            title={color.name}
            className={`w-10 h-10 rounded-full border-3 transition-transform hover:scale-110 ${
              activeColor === color.value
                ? 'border-gray-800 scale-110 ring-2 ring-pink-300'
                : 'border-gray-200'
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => {
              setActiveColor(color.value);
              setActiveTool('color');
            }}
          />
        ))}
      </div>
    </div>
  );
}
