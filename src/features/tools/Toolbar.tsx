import { useNavigate } from 'react-router-dom';
import { useCanvasStore, type ToolMode } from '../../stores/canvasStore';
import { useGalleryStore } from '../../stores/galleryStore';
import { useSettingsStore } from '../../stores/settingsStore';

const tools: { id: ToolMode; label: string }[] = [
  { id: 'select', label: 'Selection' },
  { id: 'draw',   label: 'Pinceau' },
  { id: 'text',   label: 'Texte' },
  { id: 'shape',  label: 'Motifs' },
];

export default function Toolbar() {
  const navigate = useNavigate();
  const { activeTool, setActiveTool, undo, redo, canUndo, canRedo, removeObject, selectedObjectIds, clearCanvas } = useCanvasStore();
  const { openSaveDialog, openExportDialog, saveOverCurrent, currentDesignId } = useGalleryStore();
  const isKid = useSettingsStore((s) => s.mode === 'kid');

  const sz = isKid ? 'w-14 h-14' : 'w-11 h-11';
  const iconSz = isKid ? 'w-7 h-7' : 'w-5 h-5';

  const toolBtn = (active: boolean) =>
    `${sz} flex items-center justify-center rounded-2xl transition-all active:scale-90 ${
      active
        ? 'bg-purple-500 text-white shadow-lg scale-105'
        : 'bg-white text-gray-600 shadow-sm hover:bg-purple-50 hover:text-purple-500'
    }`;

  const actionBtn = (disabled = false) =>
    `${isKid ? 'w-11 h-11' : 'w-9 h-9'} flex items-center justify-center rounded-xl transition-all active:scale-90 ${
      disabled
        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
        : 'bg-white text-gray-500 shadow-sm hover:bg-gray-100'
    }`;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Tool mode buttons */}
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={toolBtn(activeTool === tool.id)}
          title={tool.label}
        >
          {tool.id === 'select' && (
            <svg viewBox="0 0 24 24" className={iconSz} fill="currentColor">
              <path d="M4,2 L4,22 L10,16 L15,22 L18,20 L13,14 L20,14 Z" />
            </svg>
          )}
          {tool.id === 'draw' && (
            <svg viewBox="0 0 24 24" className={iconSz} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12,20 Q8,22 5,20 Q2,18 4,14 L14,4 Q16,2 18,4 L20,6 Q22,8 20,10 L10,20" />
              <circle cx="17" cy="7" r="1" fill="currentColor" />
            </svg>
          )}
          {tool.id === 'text' && (
            <span className={`${isKid ? 'text-2xl' : 'text-lg'} font-black`}>T</span>
          )}
          {tool.id === 'shape' && (
            <svg viewBox="0 0 24 24" className={iconSz} fill="currentColor">
              <path d="M12,2 L14.5,9 L22,9 L16,13.5 L18,21 L12,16.5 L6,21 L8,13.5 L2,9 L9.5,9 Z" />
            </svg>
          )}
        </button>
      ))}

      <div className="w-6 h-px bg-gray-200 my-0.5" />

      {/* Undo / Redo */}
      <button onClick={undo} disabled={!canUndo} className={actionBtn(!canUndo)} title="Annuler (Ctrl+Z)">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10h10a5 5 0 0 1 0 10H13" /><polyline points="7 14 3 10 7 6" />
        </svg>
      </button>
      <button onClick={redo} disabled={!canRedo} className={actionBtn(!canRedo)} title="Refaire">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10H11a5 5 0 0 0 0 10h2" /><polyline points="17 14 21 10 17 6" />
        </svg>
      </button>

      {/* Advanced-only: Delete / Clear */}
      {!isKid && (
        <>
          <button onClick={() => removeObject()} disabled={!selectedObjectIds.length} className={actionBtn(!selectedObjectIds.length)} title="Supprimer">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
          <button onClick={clearCanvas} className={actionBtn()} title="Tout effacer">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </>
      )}

      <div className="w-6 h-px bg-gray-200 my-0.5" />

      {/* Save / Export / Gallery */}
      <button onClick={() => currentDesignId ? saveOverCurrent() : openSaveDialog()} className={actionBtn()} title="Sauvegarder (Ctrl+S)">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
        </svg>
      </button>
      {!isKid && (
        <button onClick={openExportDialog} className={actionBtn()} title="Telecharger HD">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      )}
      <button onClick={() => navigate('/')} className={actionBtn()} title="Mes creations">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
        </svg>
      </button>
    </div>
  );
}
