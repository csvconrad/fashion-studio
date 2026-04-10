import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import DesignCanvas from './features/canvas/DesignCanvas';
import GarmentPicker from './features/garments/GarmentPicker';
import ColorPicker from './features/tools/ColorPicker';
import Toolbar from './features/tools/Toolbar';
import ShapePanel from './features/tools/shapes/ShapePanel';
import BrushPanel from './features/tools/brushes/BrushPanel';
import TextTool from './features/tools/TextTool';
import Home from './features/home/Home';
import SaveDialog from './features/gallery/SaveDialog';
import ExportDialog from './features/gallery/ExportDialog';
import LoginScreen from './features/auth/LoginScreen';
import ProfilePicker from './features/auth/ProfilePicker';
import { useCanvasStore } from './stores/canvasStore';
import { useGalleryStore } from './stores/galleryStore';
import { useSettingsStore } from './stores/settingsStore';
import { useAuthStore } from './stores/authStore';
import { isSupabaseConfigured } from './lib/supabase';

import LayersPanel from './features/layers/LayersPanel';

// ─── Right Panel ─────────────────────────────────────────────────────

function RightPanel() {
  const { activeTool } = useCanvasStore();
  const isKid = useSettingsStore((s) => s.mode === 'kid');

  return (
    <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-80px)] pr-1 scrollbar-thin">
      {activeTool === 'draw' && <BrushPanel />}
      {activeTool === 'text' && <TextTool />}
      {activeTool === 'shape' && <ShapePanel />}
      {activeTool === 'select' && <GarmentPicker />}
      <ColorPicker />
      {!isKid && <LayersPanel />}
    </div>
  );
}

// ─── Editor ──────────────────────────────────────────────────────────

function Editor() {
  const { currentDesignName } = useGalleryStore();
  const { mode, toggleMode } = useSettingsStore();
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const g = useGalleryStore.getState();
        if (g.currentDesignId) g.saveOverCurrent(); else g.openSaveDialog();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur border-b border-gray-100 flex-shrink-0">
        <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Atelier de Mode
        </h1>
        <div className="flex items-center gap-3">
          {profile && <span className="text-xs text-gray-400">{profile.avatar} {profile.name}</span>}
          <span className="text-xs text-gray-300 hidden sm:block">{currentDesignName}</span>
          <button onClick={toggleMode}
            className="text-[10px] px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors">
            {mode === 'kid' ? 'Mode enfant' : 'Mode avance'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex-shrink-0 p-2 hidden md:flex"><Toolbar /></div>
        <div className="flex-1 min-w-0 p-2 flex items-start justify-center overflow-auto"><DesignCanvas /></div>
        <div className="w-52 flex-shrink-0 p-2 hidden md:block"><RightPanel /></div>
      </div>

      <div className="md:hidden flex-shrink-0 border-t border-gray-100 bg-white px-2 py-1.5 overflow-x-auto">
        <div className="flex justify-center [&>div]:flex-row [&>div]:gap-1.5"><Toolbar /></div>
      </div>

      <SaveDialog />
      <ExportDialog />
    </div>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, initAuth } = useAuthStore();

  useEffect(() => { initAuth(); }, [initAuth]);

  if (!isSupabaseConfigured) return <>{children}</>;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"><div className="text-gray-400">Chargement...</div></div>;
  if (!user) return <LoginScreen />;
  if (!profile) return <ProfilePicker />;
  return <>{children}</>;
}

// ─── App ─────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </AuthGate>
  );
}
