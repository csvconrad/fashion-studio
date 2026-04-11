import { useState, useRef, useCallback } from 'react';
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
  const { activeGarmentId, activeView, loadGarment, loadFromImage, switchView, removeGarment, customImageUrl } = useGarmentStore();
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const categories = [...new Set(garmentTemplates.map((t) => t.category))];

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        loadFromImage(reader.result, file.name.replace(/\.[^.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  }, [loadFromImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <div className="bg-white rounded-xl shadow-md p-3 space-y-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gabarits</h3>

      {/* ── Import custom template from image ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
        }`}
      >
        {customImageUrl && activeGarmentId === 'custom' ? (
          <img src={customImageUrl} alt="Gabarit" className="w-16 h-20 mx-auto object-contain rounded" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto mb-1 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-[10px] text-gray-400">Importer un gabarit</p>
            <p className="text-[8px] text-gray-300">Glisse une image ou clique</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* ── View tabs ── */}
      {activeGarmentId && activeGarmentId !== 'custom' && (
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {(['front', 'back', 'side'] as GarmentView[]).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                activeView === v ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      )}

      {/* ── Built-in templates ── */}
      <p className="text-[9px] text-gray-400 uppercase tracking-wide">Gabarits de base</p>
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
                    isActive ? 'border-purple-400 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/30'
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
