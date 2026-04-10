import { useEffect } from 'react';
import { useDesignStore } from './stores/designStore';
import DesignCanvas from './features/canvas/DesignCanvas';
import ColorPicker from './features/tools/ColorPicker';
import PatternPicker from './features/tools/PatternPicker';
import GarmentPicker from './features/garments/GarmentPicker';
import Toolbar from './features/tools/Toolbar';
import Gallery from './features/gallery/Gallery';

export default function App() {
  const { loadSavedDesigns, currentDesign } = useDesignStore();

  useEffect(() => {
    loadSavedDesigns();
  }, [loadSavedDesigns]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Atelier de Mode
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Cree tes propres vetements !
        </p>
      </header>

      {/* Toolbar */}
      <div className="max-w-5xl mx-auto px-4 mb-4">
        <Toolbar />
      </div>

      {/* Main layout */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left sidebar — garments */}
          <div className="w-full lg:w-48 flex-shrink-0 space-y-4">
            <GarmentPicker />
          </div>

          {/* Center — canvas */}
          <div className="flex-1 min-w-0">
            {currentDesign ? (
              <DesignCanvas />
            ) : (
              <div className="flex items-center justify-center h-[700px] bg-white/50 rounded-2xl border-4 border-dashed border-pink-200">
                <div className="text-center">
                  <p className="text-6xl mb-4">{'\u{1F3A8}'}</p>
                  <p className="text-gray-500 text-lg">
                    Clique sur <strong>Nouveau</strong> pour commencer !
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar — colors, patterns, gallery */}
          <div className="w-full lg:w-52 flex-shrink-0 space-y-4">
            <ColorPicker />
            <PatternPicker />

            {/* Gallery */}
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">
                Mes creations
              </h3>
              <Gallery />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
