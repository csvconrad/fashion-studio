// ─── Garment template types ─────────────────────────────────────────
// Designed for extensibility:
//   - Add garments: define zones[] with SVG path data
//   - Future: views (front/back/side), AI-generated masks, custom zone shapes
//   - Future: GarmentInstance for per-design state (colors, modifications)

export type GarmentCategory = 'top' | 'bottom' | 'dress' | 'accessory';

/** A colorable region within a garment (e.g. "body", "sleeves", "collar") */
export interface GarmentZone {
  id: string;
  name: string;
  pathData: string;       // SVG <path d="..."> in 800x1000 canvas coordinates
  defaultColor: string;
}

/** A garment template — reusable base that can be loaded onto the canvas */
export interface GarmentTemplate {
  id: string;
  name: string;
  category: GarmentCategory;
  zones: GarmentZone[];
  /** Tight bounding box around the garment, used for SVG thumbnails */
  viewBox: string;
  // Future extensions:
  // views?: Record<'front' | 'back' | 'side', GarmentZone[]>;
  // sourceSvg?: string;  // URL to original SVG file
  // aiMask?: string;     // URL to AI-generated zone mask image
}
