// === Phase 1: Enfant — types de base ===
// === Phase 2+: ces types seront étendus avec calques, mesures, patrons ===

export interface Color {
  name: string;
  value: string;
}

export interface Pattern {
  id: string;
  name: string;
  // Phase 1: motif prédéfini (CSS pattern ou SVG inline)
  // Phase 3+: texture importée, image haute résolution
  type: 'dots' | 'stripes' | 'plaid' | 'floral' | 'solid' | 'custom';
  preview: string; // CSS background ou URL d'image
}

export type GarmentCategory = 'top' | 'bottom' | 'dress' | 'accessory' | 'shoes';

export interface GarmentTemplate {
  id: string;
  name: string;
  category: GarmentCategory;
  // SVG path data pour dessiner le vêtement sur le canvas
  svgPath: string;
  // Position par défaut sur le mannequin
  defaultPosition: { x: number; y: number };
  defaultScale: { x: number; y: number };
}

export interface GarmentInstance {
  id: string;
  templateId: string;
  color: string;
  pattern?: Pattern;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  zIndex: number;
  // Phase 3+: opacity, blendMode, etc.
}

export interface Design {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  garments: GarmentInstance[];
  canvasWidth: number;
  canvasHeight: number;
  // Phase 2+: layers, backgroundColor, mannequinType
  // Phase 4: measurements, technicalNotes, fabricSpecs
}

export interface AppState {
  currentDesign: Design | null;
  savedDesigns: Design[];
  selectedGarmentId: string | null;
  activeColor: string;
  activePattern: Pattern | null;
  activeTool: 'select' | 'color' | 'pattern' | 'move';
}
