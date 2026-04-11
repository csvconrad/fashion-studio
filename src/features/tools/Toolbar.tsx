import { useNavigate } from 'react-router-dom';
import { useCanvasStore, type ToolMode } from '../../stores/canvasStore';
import { useGalleryStore } from '../../stores/galleryStore';
import { useSettingsStore } from '../../stores/settingsStore';

// ─── Tool definitions with inline SVG icons ──────────────────────────

interface ToolDef { id: ToolMode; label: string; shortcut?: string }

const tools: ToolDef[] = [
  { id: 'select',  label: 'Selection', shortcut: 'V' },
  { id: 'garment', label: 'Vetements' },
  { id: 'draw',    label: 'Pinceau', shortcut: 'B' },
  { id: 'text',    label: 'Texte', shortcut: 'T' },
  { id: 'shape',   label: 'Formes', shortcut: 'S' },
  { id: 'image',   label: 'Image', shortcut: 'I' },
];

function ToolIcon({ id, className }: { id: ToolMode; className: string }) {
  const s = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (id) {
    case 'select': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M5 3l-1 18 5.5-5.5 4 7 2.5-1.5-4-7H19z" fill="currentColor" stroke="none" />
      </svg>
    );
    case 'garment': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M8 2l-5 4 2 3 3-2v15h8V7l3 2 2-3-5-4" />
        <path d="M9.5 2a2.5 2.5 0 0 0 5 0" />
      </svg>
    );
    case 'draw': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M3 21l1.5-4.5L17 4l3 3L7.5 19.5z" />
        <path d="M15 6l3 3" />
      </svg>
    );
    case 'text': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M6 4h12M12 4v16M8 20h8" strokeWidth="2.2" />
      </svg>
    );
    case 'shape': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M12 3l8.5 15H3.5z" />
        <circle cx="12" cy="14" r="4" strokeDasharray="2 2" />
      </svg>
    );
    case 'image': return (
      <svg viewBox="0 0 24 24" {...s}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    );
  }
}

// ─── Component ───────────────────────────────────────────────────────

export default function Toolbar() {
  const navigate = useNavigate();
  const { activeTool, setActiveTool, undo, redo, canUndo, canRedo, removeObject, selectedObjectIds } = useCanvasStore();
  const { openSaveDialog, openExportDialog, saveOverCurrent, currentDesignId } = useGalleryStore();
  const isKid = useSettingsStore((s) => s.mode === 'kid');

  const sz = isKid ? 'w-12 h-12' : 'w-10 h-10';

  const toolBtn = (active: boolean) =>
    `${sz} flex items-center justify-center rounded-xl transition-all active:scale-90 group relative ${
      active
        ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/40'
        : 'text-white/40 hover:bg-white/8 hover:text-white/70'
    }`;

  const actionBtn = (disabled = false) =>
    `w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 group relative ${
      disabled
        ? 'text-white/10 cursor-not-allowed'
        : 'text-white/30 hover:bg-white/8 hover:text-white/60'
    }`;

  const iconSz = isKid ? 'w-6 h-6' : 'w-[18px] h-[18px]';
  const actionIconSz = 'w-[15px] h-[15px]';

  return (
    <div className="flex flex-col items-center gap-1">
      {/* ── Creative tools ── */}
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={toolBtn(activeTool === tool.id)}
          title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
        >
          <ToolIcon id={tool.id} className={iconSz} />
        </button>
      ))}

      <div className="w-6 h-px bg-white/10 my-1" />

      {/* ── History ── */}
      <button onClick={undo} disabled={!canUndo} className={actionBtn(!canUndo)} title="Annuler (Ctrl+Z)">
        <svg viewBox="0 0 24 24" className={actionIconSz} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10h10a5 5 0 0 1 0 10h-2" /><path d="M4 10l4-4M4 10l4 4" />
        </svg>
      </button>
      <button onClick={redo} disabled={!canRedo} className={actionBtn(!canRedo)} title="Refaire (Ctrl+Shift+Z)">
        <svg viewBox="0 0 24 24" className={actionIconSz} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10H10a5 5 0 0 0 0 10h2" /><path d="M20 10l-4-4M20 10l-4 4" />
        </svg>
      </button>

      {/* ── Delete (advanced) ── */}
      {!isKid && (
        <button onClick={() => removeObject()} disabled={!selectedObjectIds.length} className={actionBtn(!selectedObjectIds.length)} title="Supprimer (Delete)">
          <svg viewBox="0 0 24 24" className={actionIconSz} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M10 6V4h4v2M6 6v13a1 1 0 001 1h10a1 1 0 001-1V6" />
          </svg>
        </button>
      )}

      <div className="w-6 h-px bg-white/10 my-1" />

      {/* ── File actions ── */}
      <button onClick={() => currentDesignId ? saveOverCurrent() : openSaveDialog()} className={actionBtn()} title="Sauvegarder (Ctrl+S)">
        <svg viewBox="0 0 24 24" className={actionIconSz} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
          <path d="M17 21v-7H7v7M7 3v5h8" />
        </svg>
      </button>
      {!isKid && (
        <button onClick={openExportDialog} className={actionBtn()} title="Telecharger (PNG)">
          <svg viewBox="0 0 24 24" className={actionIconSz} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2" />
          </svg>
        </button>
      )}
      <button onClick={() => navigate('/')} className={actionBtn()} title="Accueil">
        <svg viewBox="0 0 24 24" className={actionIconSz} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l9-8 9 8M5 10v10h4v-6h6v6h4V10" />
        </svg>
      </button>
    </div>
  );
}
