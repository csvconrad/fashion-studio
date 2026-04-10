import { useState } from 'react';
import { useAuthStore, type Profile } from '../../stores/authStore';

const AVATARS = ['🎨', '🦋', '🌸', '⭐', '🌈', '💎', '🎀', '🦄', '🌺', '💜', '🎵', '👑'];

export default function ProfilePicker() {
  const { profiles, selectProfile, createProfile, deleteProfile, signOut } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🎨');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProfile(newName.trim(), newAvatar);
    setNewName('');
    setNewAvatar('🎨');
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
          Qui est-ce ?
        </h1>
        <p className="text-gray-400 text-sm mb-10">Choisis ton profil</p>

        {/* Profile bubbles */}
        <div className="flex justify-center gap-8 mb-10 flex-wrap">
          {profiles.map((p) => (
            <ProfileBubble key={p.id} profile={p} onSelect={selectProfile} onDelete={deleteProfile} />
          ))}

          {/* Add profile button */}
          {profiles.length < 4 && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-3xl text-gray-300 border-2 border-dashed border-gray-200 group-hover:border-purple-300 group-hover:text-purple-400 transition-all">
                +
              </div>
              <span className="text-xs text-gray-400 group-hover:text-purple-500 transition-colors">Ajouter</span>
            </button>
          )}
        </div>

        {/* Create profile form */}
        {showCreate && (
          <div className="bg-white rounded-2xl shadow-lg p-5 max-w-xs mx-auto space-y-4">
            <h3 className="font-bold text-gray-700">Nouveau profil</h3>

            {/* Avatar picker */}
            <div className="flex flex-wrap justify-center gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setNewAvatar(a)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                    newAvatar === a ? 'bg-purple-100 ring-2 ring-purple-400 scale-110' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Prenom..."
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-center focus:border-purple-400 focus:outline-none transition-colors"
              autoFocus
              maxLength={20}
            />

            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 text-sm text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Annuler
              </button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 py-2 text-sm text-white bg-purple-500 rounded-xl hover:bg-purple-600 disabled:opacity-40 transition-colors">
                Creer
              </button>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={signOut}
          className="mt-10 text-xs text-gray-300 hover:text-gray-500 transition-colors"
        >
          Deconnexion
        </button>
      </div>
    </div>
  );
}

function ProfileBubble({ profile, onSelect, onDelete }: { profile: Profile; onSelect: (p: Profile) => void; onDelete: (id: string) => void }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <button
        onClick={() => onSelect(profile)}
        onContextMenu={(e) => { e.preventDefault(); setShowDelete(!showDelete); }}
        className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center text-4xl border-3 border-transparent hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
      >
        {profile.avatar}
      </button>
      <span className="text-sm font-medium text-gray-700">{profile.name}</span>

      {showDelete && (
        <button
          onClick={() => { if (confirm(`Supprimer le profil "${profile.name}" et toutes ses creations ?`)) onDelete(profile.id); setShowDelete(false); }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-md hover:bg-red-600"
        >
          &times;
        </button>
      )}
    </div>
  );
}
