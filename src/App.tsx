import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DesignCanvas from './features/canvas/DesignCanvas';
import GarmentPicker from './features/garments/GarmentPicker';
import ColorPanel from './features/tools/colors/ColorPanel';
import Toolbar from './features/tools/Toolbar';
import ShapePanel from './features/tools/shapes/ShapePanel';
import BrushPanel from './features/tools/brushes/BrushPanel';
import TextPanel from './features/tools/text/TextPanel';
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
import EffectsPanel from './features/tools/effects/EffectsPanel';
import TransformPanel from './features/tools/effects/TransformPanel';
import ImagePanel from './features/tools/import/ImagePanel';
import BackgroundRemover from './features/tools/import/BackgroundRemover';
import LayersPanel from './features/layers/LayersPanel';
import Onboarding from './features/onboarding/Onboarding';
import GarmentLibrary from './features/library/GarmentLibrary';

// ─── Command Palette (Ctrl+K) ────────────────────────────────────────

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { setActiveTool, setActiveBrush } = useCanvasStore();

  const commands = [
    { name: 'Selection', shortcut: 'V', action: () => setActiveTool('select') },
    { name: 'Pinceau', shortcut: 'B', action: () => setActiveTool('draw') },
    { name: 'Texte', shortcut: 'T', action: () => setActiveTool('text') },
    { name: 'Formes', shortcut: 'S', action: () => setActiveTool('shape') },
    { name: 'Image', shortcut: 'I', action: () => setActiveTool('image') },
    { name: 'Gomme', shortcut: 'E', action: () => { setActiveBrush('eraser'); setActiveTool('draw'); } },
    { name: 'Undo', shortcut: '\u2318Z', action: () => useCanvasStore.getState().undo() },
    { name: 'Redo', shortcut: '\u2318\u21E7Z', action: () => useCanvasStore.getState().redo() },
    { name: 'Copy', shortcut: '\u2318C', action: () => useCanvasStore.getState().copySelection() },
    { name: 'Paste', shortcut: '\u2318V', action: () => useCanvasStore.getState().pasteClipboard() },
    { name: 'Duplicate', shortcut: '\u2318D', action: () => useCanvasStore.getState().duplicateSelection() },
    { name: 'Save', shortcut: '\u2318S', action: () => { const g = useGalleryStore.getState(); g.currentDesignId ? g.saveOverCurrent() : g.openSaveDialog(); } },
    { name: 'Pencil', action: () => { setActiveBrush('pencil'); setActiveTool('draw'); } },
    { name: 'Marker', action: () => { setActiveBrush('marker'); setActiveTool('draw'); } },
    { name: 'Watercolor', action: () => { setActiveBrush('watercolor'); setActiveTool('draw'); } },
    { name: 'Calligraphy', action: () => { setActiveBrush('calligraphy'); setActiveTool('draw'); } },
    { name: 'Neon', action: () => { setActiveBrush('neon'); setActiveTool('draw'); } },
    { name: 'Spray', action: () => { setActiveBrush('spray'); setActiveTool('draw'); } },
  ];

  const filtered = query
    ? commands.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const handleSelect = (cmd: typeof commands[0]) => {
    cmd.action();
    onClose();
    setQuery('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50" onClick={onClose}>
      <div className="w-[400px] bg-[#1e1e2e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-3 border-b border-white/5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, brushes, actions..."
            className="w-full bg-white/5 text-white text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none placeholder-white/30"
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {filtered.map((cmd) => (
            <button
              key={cmd.name}
              onClick={() => handleSelect(cmd)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors"
            >
              <span>{cmd.name}</span>
              {cmd.shortcut && <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{cmd.shortcut}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel ─────────────────────────────────────────────────────

function RightPanel() {
  const { activeTool, selectedObjectIds } = useCanvasStore();
  const isKid = useSettingsStore((s) => s.mode === 'kid');
  const hasSelection = selectedObjectIds.length > 0;

  return (
    <div className="flex flex-col gap-2 overflow-y-auto h-full p-2 scrollbar-thin">
      {activeTool === 'draw' && <BrushPanel />}
      {activeTool === 'text' && <TextPanel />}
      {activeTool === 'shape' && <ShapePanel />}
      {activeTool === 'image' && <ImagePanel />}
      {(activeTool === 'garment' || (activeTool === 'select' && !hasSelection)) && <GarmentPicker />}
      {hasSelection && !isKid && <EffectsPanel />}
      {hasSelection && !isKid && <TransformPanel />}
      {hasSelection && !isKid && <BackgroundRemover />}
      <ColorPanel />
      {!isKid && <LayersPanel />}
    </div>
  );
}

// ─── Status Bar ──────────────────────────────────────────────────────

function StatusBar() {
  const { zoomLevel, cursorPos, selectedObjectIds, getCanvas } = useCanvasStore();
  const obj = selectedObjectIds.length === 1 ? getCanvas()?.getActiveObject() : null;

  return (
    <div className="flex items-center justify-between px-3 py-1 bg-[#1a1a2e] text-[10px] text-white/40 border-t border-white/5 select-none">
      <div className="flex items-center gap-4">
        <span>x: {Math.round(cursorPos.x)} y: {Math.round(cursorPos.y)}</span>
        {obj && (
          <span className="text-white/30">
            {Math.round(obj.left ?? 0)}, {Math.round(obj.top ?? 0)} — {Math.round((obj.width ?? 0) * (obj.scaleX ?? 1))}x{Math.round((obj.height ?? 0) * (obj.scaleY ?? 1))}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => useCanvasStore.getState().setZoomLevel(Math.max(0.25, zoomLevel - 0.25))}
          className="hover:text-white/60 transition-colors">-</button>
        <span className="text-white/50 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={() => useCanvasStore.getState().setZoomLevel(Math.min(3, zoomLevel + 0.25))}
          className="hover:text-white/60 transition-colors">+</button>
      </div>
    </div>
  );
}

// ─── Editor ──────────────────────────────────────────────────────────

function Editor() {
  const { currentDesignName } = useGalleryStore();
  const { mode, toggleMode } = useSettingsStore();
  const profile = useAuthStore((s) => s.profile);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  // Open library when library tool is selected
  const activeTool = useCanvasStore((s) => s.activeTool);
  useEffect(() => {
    if (activeTool === 'library') {
      setLibraryOpen(true);
      useCanvasStore.getState().setActiveTool('select');
    }
  }, [activeTool]);

  // ── Autosave every 30s ──
  useEffect(() => {
    const interval = setInterval(() => {
      const g = useGalleryStore.getState();
      if (g.currentDesignId) g.saveOverCurrent();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── All keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      const canvas = useCanvasStore.getState().getCanvas();
      const isEditing = canvas && (canvas as unknown as { _activeObject?: { isEditing?: boolean } })._activeObject?.isEditing;

      // Ctrl shortcuts (always active)
      if (meta && e.key === 's') { e.preventDefault(); const g = useGalleryStore.getState(); g.currentDesignId ? g.saveOverCurrent() : g.openSaveDialog(); return; }
      if (meta && e.key === 'k') { e.preventDefault(); setCmdOpen(true); return; }
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); useCanvasStore.getState().undo(); return; }
      if (meta && (e.key === 'z' && e.shiftKey || e.key === 'y')) { e.preventDefault(); useCanvasStore.getState().redo(); return; }
      if (meta && e.key === 'c') { useCanvasStore.getState().copySelection(); return; }
      if (meta && e.key === 'v' && !isInput) { e.preventDefault(); useCanvasStore.getState().pasteClipboard(); return; }
      if (meta && e.key === 'd') { e.preventDefault(); useCanvasStore.getState().duplicateSelection(); return; }

      // Single key shortcuts (only when not typing)
      if (isInput || isEditing) return;

      const s = useCanvasStore.getState();
      switch (e.key) {
        case 'v': case 'V': s.setActiveTool('select'); break;
        case 'b': case 'B': s.setActiveTool('draw'); break;
        case 'e': case 'E': s.setActiveBrush('eraser'); s.setActiveTool('draw'); break;
        case 't': case 'T': s.setActiveTool('text'); break;
        case 's': case 'S': s.setActiveTool('shape'); break;
        case 'i': case 'I': s.setActiveTool('image'); break;
        case 'g': case 'G': s.setActiveTool('garment'); break;
        case 'l': case 'L': s.setActiveTool('library'); break;
        case '[': s.setBrushWidth(Math.max(1, s.brushWidth - 2)); break;
        case ']': s.setBrushWidth(Math.min(80, s.brushWidth + 2)); break;
        case 'Delete': case 'Backspace': e.preventDefault(); s.removeObject(); break;
        case 'Escape': s.setActiveTool('select'); setCmdOpen(false); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0f0f1a] overflow-hidden">
      {/* ── Header ──────────────────────────────── */}
      <header className="flex items-center justify-between px-4 h-10 bg-[#1a1a2e] border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Atelier de Mode
          </h1>
          <span className="text-[11px] text-white/25">{currentDesignName}</span>
        </div>
        <div className="flex items-center gap-2">
          {profile && <span className="text-[11px] text-white/30">{profile.avatar} {profile.name}</span>}
          <button onClick={() => setCmdOpen(true)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/30 hover:bg-white/10 hover:text-white/50 transition-colors border border-white/5">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4" /><path d="M14 14l-3-3" /></svg>
            Search...
            <span className="text-[9px] bg-white/5 px-1 rounded">\u2318K</span>
          </button>
          <button onClick={toggleMode}
            className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50 transition-colors border border-white/5">
            {mode === 'kid' ? 'Kid' : 'Pro'}
          </button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Left: toolbar */}
        <div className="w-12 flex-shrink-0 bg-[#16162a] border-r border-white/5 p-1 hidden md:flex">
          <Toolbar />
        </div>

        {/* Center: canvas */}
        <div className="flex-1 min-w-0 flex items-center justify-center overflow-auto bg-[#12121f] p-4">
          <DesignCanvas />
        </div>

        {/* Right: panels */}
        <div className="w-56 flex-shrink-0 bg-[#16162a] border-l border-white/5 hidden md:block">
          <RightPanel />
        </div>
      </div>

      {/* ── Status bar ──────────────────────────── */}
      <StatusBar />

      {/* ── Mobile bottom bar ───────────────────── */}
      <div className="md:hidden flex-shrink-0 bg-[#1a1a2e] border-t border-white/5 px-2 py-1 overflow-x-auto">
        <div className="flex justify-center [&>div]:flex-row [&>div]:gap-1"><Toolbar /></div>
      </div>

      {/* ── Overlays ────────────────────────────── */}
      <SaveDialog />
      <ExportDialog />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      {libraryOpen && <GarmentLibrary onClose={() => setLibraryOpen(false)} />}
      <Onboarding />
    </div>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, initAuth } = useAuthStore();
  useEffect(() => { initAuth(); }, [initAuth]);

  if (!isSupabaseConfigured) return <>{children}</>;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]"><div className="text-white/30 text-sm">Loading...</div></div>;
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
