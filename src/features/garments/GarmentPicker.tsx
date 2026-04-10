import { useDesignStore } from '../../stores/designStore';
import { garmentTemplates } from './templates';
import type { GarmentInstance } from '../../types';

const categoryEmoji: Record<string, string> = {
  top: '\u{1F455}',
  bottom: '\u{1F456}',
  dress: '\u{1F457}',
  accessory: '\u{1F3A9}',
  shoes: '\u{1F45F}',
};

export default function GarmentPicker() {
  const { addGarment, activeColor, currentDesign } = useDesignStore();

  const handleAdd = (templateId: string) => {
    if (!currentDesign) return;
    const template = garmentTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const instance: GarmentInstance = {
      id: crypto.randomUUID(),
      templateId: template.id,
      color: activeColor,
      position: { ...template.defaultPosition },
      scale: { ...template.defaultScale },
      rotation: 0,
      zIndex: currentDesign.garments.length,
    };
    addGarment(instance);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">
        Vetements
      </h3>
      <div className="flex flex-col gap-2">
        {garmentTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleAdd(template.id)}
            disabled={!currentDesign}
            className="flex items-center gap-3 px-3 py-2 rounded-xl border-2 border-gray-100
                       hover:border-pink-300 hover:bg-pink-50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed text-left"
          >
            <span className="text-2xl">
              {categoryEmoji[template.category] || '\u{2728}'}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {template.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
