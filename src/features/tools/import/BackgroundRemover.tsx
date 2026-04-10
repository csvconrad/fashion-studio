import { useState, useCallback } from 'react';
import { useCanvasStore } from '../../../stores/canvasStore';
import type { FabricImage } from 'fabric';

export default function BackgroundRemover() {
  const { getCanvas, selectedObjectIds, commitToHistory } = useCanvasStore();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const getSelectedImage = useCallback((): FabricImage | null => {
    const canvas = getCanvas();
    if (!canvas) return null;
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'image') return obj as FabricImage;
    return null;
  }, [getCanvas]);

  const hasImage = selectedObjectIds.length > 0 && !!getSelectedImage();

  const handleRemoveBg = useCallback(async () => {
    const img = getSelectedImage();
    const canvas = getCanvas();
    if (!img || !canvas) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Dynamic import to avoid loading the heavy WASM model upfront
      const { removeBackground } = await import('@imgly/background-removal');

      // Get image source
      const el = img.getElement() as HTMLImageElement;
      const src = el.src || el.currentSrc;

      // Fetch as blob
      const res = await fetch(src);
      const blob = await res.blob();

      // Remove background
      const resultBlob = await removeBackground(blob, {
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
      });

      // Create data URL from result
      const resultUrl = URL.createObjectURL(resultBlob);

      // Replace the image on canvas
      const { FabricImage: FabImg } = await import('fabric');
      const newImg = await FabImg.fromURL(resultUrl);

      // Copy transform from original
      newImg.set({
        left: img.left,
        top: img.top,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        angle: img.angle,
        flipX: img.flipX,
        flipY: img.flipY,
        opacity: img.opacity,
        data: (img as unknown as { data?: Record<string, unknown> }).data,
      });

      canvas.remove(img);
      canvas.add(newImg);
      canvas.setActiveObject(newImg);
      canvas.renderAll();
      commitToHistory();
    } catch (err) {
      console.error('Background removal failed:', err);
    }

    setProcessing(false);
    setProgress(0);
  }, [getSelectedImage, getCanvas, commitToHistory]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Supprimer le fond</h3>

      {!hasImage ? (
        <p className="text-[10px] text-gray-400">Selectionne une image sur le canvas</p>
      ) : processing ? (
        <div className="space-y-2">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            {progress < 30 ? 'Chargement du modele IA...' : progress < 90 ? 'Traitement en cours...' : 'Finalisation...'}
          </p>
        </div>
      ) : (
        <button onClick={handleRemoveBg}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-medium hover:shadow-lg transition-all active:scale-95">
          Supprimer le fond automatiquement
        </button>
      )}

      <p className="text-[8px] text-gray-300 mt-2 text-center">
        Traitement 100% local (aucune donnee envoyee)
      </p>
    </div>
  );
}
