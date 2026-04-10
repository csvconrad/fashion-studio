import { useState, useEffect, useRef } from 'react';
import { useGalleryStore } from '../../stores/galleryStore';
import { useCanvasStore } from '../../stores/canvasStore';

export default function SaveDialog() {
  const { showSaveDialog, closeSaveDialog, saveCurrentDesign, currentDesignName } = useGalleryStore();
  const [name, setName] = useState(currentDesignName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbnail = useCanvasStore((s) => s.exportToPNG)?.(0.3);

  useEffect(() => {
    if (showSaveDialog) {
      setName(currentDesignName);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [showSaveDialog, currentDesignName]);

  if (!showSaveDialog) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await saveCurrentDesign(name.trim());
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') closeSaveDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeSaveDialog}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-[340px] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 text-center">Sauvegarder</h2>

        {/* Thumbnail preview */}
        {thumbnail && (
          <div className="flex justify-center">
            <img
              src={thumbnail}
              alt="Apercu"
              className="w-32 h-40 object-contain rounded-lg border border-gray-200 bg-gray-50"
            />
          </div>
        )}

        {/* Name input */}
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nom de la creation..."
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-colors"
          maxLength={60}
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={closeSaveDialog}
            className="flex-1 px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 px-4 py-2 text-sm text-white bg-purple-500 rounded-xl hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
