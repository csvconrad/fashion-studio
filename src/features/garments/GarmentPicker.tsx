import { garmentTemplates } from './templates';
import { useGarmentStore } from '../../stores/garmentStore';
import type { GarmentTemplate } from '../../types/garment';

/** Inline SVG thumbnail rendered from zone path data */
function GarmentThumb({ template, active }: { template: GarmentTemplate; active: boolean }) {
  return (
    <svg
      viewBox={template.viewBox}
      className="w-full h-full"
      aria-label={template.name}
    >
      {template.zones.map((zone) => (
        <path
          key={zone.id}
          d={zone.pathData}
          fill={zone.defaultColor}
          stroke="#BDBDBD"
          strokeWidth={active ? 4 : 2}
        />
      ))}
    </svg>
  );
}

const categoryLabel: Record<string, string> = {
  top: 'Hauts',
  bottom: 'Bas',
  dress: 'Robes',
  accessory: 'Accessoires',
};

export default function GarmentPicker() {
  const { activeGarmentId, loadGarment, removeGarment } = useGarmentStore();

  // Group templates by category
  const categories = [...new Set(garmentTemplates.map((t) => t.category))];

  return (
    <div className="bg-white rounded-xl shadow-md p-3 space-y-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        Gabarits
      </h3>

      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
            {categoryLabel[cat] ?? cat}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {garmentTemplates
              .filter((t) => t.category === cat)
              .map((template) => {
                const isActive = activeGarmentId === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => loadGarment(template.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:shadow-sm ${
                      isActive
                        ? 'border-purple-400 bg-purple-50 shadow-sm'
                        : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="w-14 h-16">
                      <GarmentThumb template={template} active={isActive} />
                    </div>
                    <span className="text-[11px] font-medium text-gray-600 leading-tight">
                      {template.name}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      {activeGarmentId && (
        <button
          onClick={removeGarment}
          className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
        >
          Retirer le gabarit
        </button>
      )}
    </div>
  );
}
