import { useDesignStore } from '../../stores/designStore';

export default function Toolbar() {
  const {
    currentDesign,
    newDesign,
    saveDesign,
    selectedGarmentId,
    removeGarment,
    activeTool,
    setActiveTool,
  } = useDesignStore();

  const handleExport = () => {
    const canvasEl = document.querySelector('canvas');
    if (!canvasEl) return;
    const link = document.createElement('a');
    link.download = `${currentDesign?.name || 'creation'}.png`;
    link.href = canvasEl.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => newDesign()}
        className="px-4 py-2 bg-pink-500 text-white rounded-xl font-medium
                   hover:bg-pink-600 transition-colors text-sm shadow-sm"
      >
        Nouveau
      </button>

      <button
        onClick={saveDesign}
        disabled={!currentDesign}
        className="px-4 py-2 bg-purple-500 text-white rounded-xl font-medium
                   hover:bg-purple-600 transition-colors text-sm shadow-sm
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Sauvegarder
      </button>

      <button
        onClick={handleExport}
        disabled={!currentDesign}
        className="px-4 py-2 bg-blue-400 text-white rounded-xl font-medium
                   hover:bg-blue-500 transition-colors text-sm shadow-sm
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Exporter PNG
      </button>

      <button
        onClick={() => removeGarment(selectedGarmentId!)}
        disabled={!selectedGarmentId}
        className="px-4 py-2 bg-red-400 text-white rounded-xl font-medium
                   hover:bg-red-500 transition-colors text-sm shadow-sm
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Supprimer
      </button>

      <div className="flex gap-1 ml-auto">
        {(['select', 'color', 'move'] as const).map((tool) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTool === tool
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tool === 'select' && 'Selectionner'}
            {tool === 'color' && 'Colorier'}
            {tool === 'move' && 'Deplacer'}
          </button>
        ))}
      </div>
    </div>
  );
}
