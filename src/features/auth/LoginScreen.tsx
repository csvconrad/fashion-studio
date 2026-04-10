import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const { signIn, signUp, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    const ok = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setBusy(false);
    if (!ok) return; // error is in store
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Atelier de Mode
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isSignUp ? 'Creer un compte' : 'Connexion'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="parent@email.com"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
          >
            {busy ? '...' : isSignUp ? 'Creer le compte' : 'Se connecter'}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-xs text-gray-400 hover:text-purple-500 transition-colors"
          >
            {isSignUp ? 'Deja un compte ? Se connecter' : 'Premiere fois ? Creer un compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
