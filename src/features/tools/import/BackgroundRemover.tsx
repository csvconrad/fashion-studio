import { useCanvasStore } from '../../../stores/canvasStore';
import type { FabricImage } from 'fabric';
import { useCallback } from 'react';

export default function BackgroundRemover() {
  const { getCanvas, selectedObjectIds } = useCanvasStore();

  const getSelectedImage = useCallback((): FabricImage | null => {
    const canvas = getCanvas();
    if (!canvas) return null;
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'image') return obj as FabricImage;
    return null;
  }, [getCanvas]);

  const hasImage = selectedObjectIds.length > 0 && !!getSelectedImage();

  if (!hasImage) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Supprimer le fond</h3>
      <p className="text-[9px] text-gray-400 mb-2">Bientot disponible — suppression de fond par IA locale</p>
      <button disabled className="w-full py-2 rounded-xl bg-gray-100 text-gray-400 text-[11px] cursor-not-allowed">
        Bientot disponible
      </button>
    </div>
  );
}
