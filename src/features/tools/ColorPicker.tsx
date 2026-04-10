import { colorPalette } from '../garments/templates';
import { useCanvasStore } from '../../stores/canvasStore';

export default function ColorPicker() {
  const { activeColor, setActiveColor, applyFillToSelection, selectedObjectIds, activeTool } =
    useCanvasStore();

  const handleColorClick = (color: string) => {
    setActiveColor(color);
    // In select mode with selection: immediately apply fill
    if (activeTool === 'select' && selectedObjectIds.length > 0) {
      applyFillToSelection(color);
    }
    // In draw/text/shape: the color is stored and used when creating
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
        Couleurs
      </h3>

      <div className="grid grid-cols-5 gap-1.5">
        {colorPalette.map((color) => (
          <button
            key={color.value}
            title={color.name}
            onClick={() => handleColorClick(color.value)}
            className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
              activeColor === color.value
                ? 'border-gray-700 scale-110 ring-2 ring-purple-300'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
    </div>
  );
}
