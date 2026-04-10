import { useDesignStore } from '../../stores/designStore';

export default function Gallery() {
  const { savedDesigns, loadDesign, deleteDesign } = useDesignStore();

  if (savedDesigns.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8 text-sm">
        Aucune creation sauvegardee
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {savedDesigns.map((design) => (
        <div
          key={design.id}
          className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100"
        >
          <button
            onClick={() => loadDesign(design.id)}
            className="text-left flex-1"
          >
            <div className="text-sm font-medium text-gray-700">
              {design.name}
            </div>
            <div className="text-xs text-gray-400">
              {design.garments.length} vetement
              {design.garments.length !== 1 ? 's' : ''} &middot;{' '}
              {new Date(design.updatedAt).toLocaleDateString('fr-FR')}
            </div>
          </button>
          <button
            onClick={() => deleteDesign(design.id)}
            className="text-gray-300 hover:text-red-400 text-lg ml-2"
            title="Supprimer"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
