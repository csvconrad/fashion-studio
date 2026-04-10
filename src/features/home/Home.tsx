import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleryStore } from '../../stores/galleryStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const { designs, refreshDesigns, loadDesign, duplicateDesign, renameDesign, deleteDesign, downloadDesign, newDesign } = useGalleryStore();
  const { mode, toggleMode } = useSettingsStore();
  const { profile, clearProfile } = useAuthStore();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => { refreshDesigns(); }, [refreshDesigns]);

  const handleOpen = async (id: string) => {
    await loadDesign(id);
    navigate('/editor');
  };

  const handleNew = () => {
    newDesign();
    navigate('/editor');
  };

  const handleRenameConfirm = async () => {
    if (renamingId && renameValue.trim()) await renameDesign(renamingId, renameValue.trim());
    setRenamingId(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Hero */}
      <div className="text-center pt-12 pb-8 px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Atelier de Mode
        </h1>
        {profile && (
          <p className="text-lg mt-2">{profile.avatar} <span className="font-semibold text-purple-600">{profile.name}</span></p>
        )}
        <p className="text-gray-400 mt-1 text-sm">Cree et personnalise tes vetements !</p>

        <button
          onClick={handleNew}
          className="mt-6 px-8 py-3.5 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          + Nouvelle creation
        </button>
      </div>

      {/* Designs grid */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {designs.length > 0 && (
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            Mes creations
          </h2>
        )}

        {designs.length === 0 ? (
          <p className="text-center text-gray-300 py-12 text-sm">
            Tes creations apparaitront ici
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {designs.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <button
                  onClick={() => handleOpen(d.id)}
                  className="w-full aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden"
                >
                  {d.thumbnail ? (
                    <img src={d.thumbnail} alt={d.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-4xl text-gray-200">{'\u{1F457}'}</span>
                  )}
                </button>

                <div className="p-2.5">
                  {renamingId === d.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleRenameConfirm}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setRenamingId(null); }}
                      className="w-full text-sm font-medium border-b-2 border-purple-400 outline-none bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(d.updatedAt)}</p>

                  {/* Actions — always visible on touch, hover on desktop */}
                  <div className="flex gap-1 mt-2 touch-visible opacity-0 group-hover:opacity-100 transition-opacity">
                    <SmallBtn title="Ouvrir" onClick={() => handleOpen(d.id)} icon="M3 3h5l2 2h7v12H3z" />
                    <SmallBtn title="Dupliquer" onClick={() => duplicateDesign(d.id)} icon="M7 7h10v10H7z M4 14V4h10" />
                    <SmallBtn title="Renommer" onClick={() => { setRenamingId(d.id); setRenameValue(d.name); }} icon="M14 3l3 3L7 16H4v-3L14 3z" />
                    <SmallBtn title="Telecharger" onClick={() => downloadDesign(d.id)} icon="M17 13v3H3v-3 M10 3v10 M6 9l4 4 4-4" />
                    <SmallBtn title="Supprimer" onClick={() => { if (confirm(`Supprimer "${d.name}" ?`)) deleteDesign(d.id); }} icon="M5 5h10 M13 5l-1 10H8L7 5 M9 5V3h2v2" danger />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        {isSupabaseConfigured && profile && (
          <button
            onClick={clearProfile}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md text-xs text-gray-500 hover:text-purple-600 transition-colors"
          >
            Changer de profil
          </button>
        )}
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md text-xs text-gray-500 hover:text-purple-600 transition-colors"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="3" /><path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.5 1.5M15 15l1.5 1.5M16.5 3.5l-1.5 1.5M5 15l-1.5 1.5" />
          </svg>
          {mode === 'kid' ? 'Mode enfant' : 'Mode avance'}
        </button>
      </div>
    </div>
  );
}

function SmallBtn({ title, onClick, icon, danger }: { title: string; onClick: () => void; icon: string; danger?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-colors ${
        danger ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
      }`}
    >
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
      </svg>
    </button>
  );
}
