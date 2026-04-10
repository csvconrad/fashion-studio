import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleryStore } from '../../stores/galleryStore';

export default function Gallery() {
  const navigate = useNavigate();
  const {
    designs,
    refreshDesigns,
    loadDesign,
    duplicateDesign,
    renameDesign,
    deleteDesign,
    downloadDesign,
    newDesign,
  } = useGalleryStore();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    refreshDesigns();
  }, [refreshDesigns]);

  const handleOpen = async (id: string) => {
    await loadDesign(id);
    navigate('/');
  };

  const handleNew = () => {
    newDesign();
    navigate('/');
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleRenameConfirm = async () => {
    if (renamingId && renameValue.trim()) {
      await renameDesign(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Supprimer "${name}" ?`)) {
      await deleteDesign(id);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto px-4 py-5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm font-medium">Retour</span>
        </button>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Mes Creations
        </h1>

        <button
          onClick={handleNew}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors shadow-sm"
        >
          + Nouveau
        </button>
      </header>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {designs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">{'\u{1F3A8}'}</div>
            <p className="text-gray-400 text-lg mb-4">Aucune creation sauvegardee</p>
            <button
              onClick={handleNew}
              className="px-6 py-3 text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors shadow-md font-medium"
            >
              Creer ma premiere creation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {designs.map((design) => (
              <div
                key={design.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Thumbnail */}
                <button
                  onClick={() => handleOpen(design.id)}
                  className="w-full aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden"
                >
                  {design.thumbnail ? (
                    <img
                      src={design.thumbnail}
                      alt={design.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-4xl text-gray-300">{'\u{1F457}'}</span>
                  )}
                </button>

                {/* Info */}
                <div className="p-2.5">
                  {renamingId === design.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleRenameConfirm}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameConfirm();
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      className="w-full text-sm font-medium border-b-2 border-purple-400 outline-none bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 truncate">{design.name}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(design.updatedAt)}</p>

                  {/* Actions */}
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionBtn title="Ouvrir" onClick={() => handleOpen(design.id)}>
                      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3h5l2 2h7v12H3z" />
                      </svg>
                    </ActionBtn>
                    <ActionBtn title="Dupliquer" onClick={() => duplicateDesign(design.id)}>
                      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="6" width="11" height="11" rx="1" /><path d="M3 14V3h11" />
                      </svg>
                    </ActionBtn>
                    <ActionBtn title="Renommer" onClick={() => handleRenameStart(design.id, design.name)}>
                      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3l3 3L7 16H4v-3L14 3z" />
                      </svg>
                    </ActionBtn>
                    <ActionBtn title="Telecharger" onClick={() => downloadDesign(design.id)}>
                      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 13v3H3v-3" /><polyline points="6 9 10 13 14 9" /><line x1="10" y1="13" x2="10" y2="3" />
                      </svg>
                    </ActionBtn>
                    <ActionBtn title="Supprimer" onClick={() => handleDelete(design.id, design.name)} danger>
                      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 5 5 5 17 5" /><path d="M15 5l-1 12H6L5 5" /><path d="M8 5V3h4v2" />
                      </svg>
                    </ActionBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ children, title, onClick, danger }: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition-colors ${
        danger
          ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
      }`}
    >
      {children}
    </button>
  );
}
