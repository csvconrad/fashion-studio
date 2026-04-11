import { garmentTemplates } from './templates';
import { useGarmentStore } from '../../stores/garmentStore';
import type { GarmentTemplate, GarmentView } from '../../types/garment';

const VIEW_LABELS: Record<GarmentView, string> = { front: 'Devant', back: 'Dos', side: 'Cote' };

function GarmentThumb({ template, view }: { template: GarmentTemplate; view: GarmentView }) {
  const zones = template.views[view];
  const vb = template.viewBoxes[view];
  return (
    <svg viewBox={vb} className="w-full h-full" aria-label={template.name}>
      {zones.map((zone) => (
        <path key={zone.id} d={zone.pathData} fill={zone.defaultColor} stroke="#BDBDBD" strokeWidth="2" />
      ))}
    </svg>
  );
}

const categoryLabel: Record<string, string> = {
  top: 'Hauts', bottom: 'Bas', dress: 'Robes', accessory: 'Accessoires',
};

export default function GarmentPicker() {
  const { activeGarmentId, activeView, loadGarment, switchView, removeGarment } = useGarmentStore();
  const categories = [...new Set(garmentTemplates.map((t) => t.category))];

  return (
    <div className="bg-white rounded-xl shadow-md p-3 space-y-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gabarits</h3>

      {/* View tabs — shown when a garment is selected */}
      {activeGarmentId && (
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {(['front', 'back', 'side'] as GarmentView[]).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                activeView === v
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">{categoryLabel[cat] ?? cat}</p>
          <div className="grid grid-cols-2 gap-2">
            {garmentTemplates.filter((t) => t.category === cat).map((template) => {
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
                  <div className="w-14 h-18">
                    <GarmentThumb template={template} view={isActive ? activeView : 'front'} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-600 leading-tight">{template.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {activeGarmentId && (
        <button onClick={removeGarment} className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1">
          Retirer le gabarit
        </button>
      )}
    </div>
  );
}
