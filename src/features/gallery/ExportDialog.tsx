import { useState } from 'react';
import { useGalleryStore } from '../../stores/galleryStore';
import { useCanvasStore, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../stores/canvasStore';

const RESOLUTIONS = [
  { label: '1x', multiplier: 1, desc: `${CANVAS_WIDTH}x${CANVAS_HEIGHT}` },
  { label: '2x', multiplier: 2, desc: `${CANVAS_WIDTH * 2}x${CANVAS_HEIGHT * 2}` },
  { label: '3x', multiplier: 3, desc: `${CANVAS_WIDTH * 3}x${CANVAS_HEIGHT * 3}` },
  { label: '4x', multiplier: 4, desc: `${CANVAS_WIDTH * 4}x${CANVAS_HEIGHT * 4}` },
];

export default function ExportDialog() {
  const { showExportDialog, closeExportDialog, currentDesignName } = useGalleryStore();
  const { exportToPNG } = useCanvasStore();
  const [selected, setSelected] = useState(1); // index into RESOLUTIONS

  if (!showExportDialog) return null;

  const handleDownload = () => {
    const res = RESOLUTIONS[selected];
    const url = exportToPNG(res.multiplier);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDesignName || 'design'}_${res.label}.png`;
    a.click();
    closeExportDialog();
  };

  const preview = exportToPNG(0.3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeExportDialog}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-[360px] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 text-center">Telecharger</h2>

        {/* Preview */}
        {preview && (
          <div className="flex justify-center">
            <img
              src={preview}
              alt="Apercu"
              className="w-36 h-44 object-contain rounded-lg border border-gray-200 bg-gray-50"
            />
          </div>
        )}

        {/* Resolution picker */}
        <div>
          <p className="text-xs text-gray-500 mb-2 text-center">Resolution</p>
          <div className="grid grid-cols-4 gap-2">
            {RESOLUTIONS.map((res, i) => (
              <button
                key={res.label}
                onClick={() => setSelected(i)}
                className={`py-2 rounded-xl text-center transition-all ${
                  selected === i
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm font-bold">{res.label}</div>
                <div className="text-[9px] opacity-70">{res.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={closeExportDialog}
            className="flex-1 px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2 text-sm text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Telecharger PNG
          </button>
        </div>
      </div>
    </div>
  );
}
