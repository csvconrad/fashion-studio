// ─── Garment template types ─────────────────────────────────────────

export type GarmentCategory = 'top' | 'bottom' | 'dress' | 'accessory';
export type GarmentView = 'front' | 'back' | 'side';

export interface GarmentZone {
  id: string;
  name: string;
  pathData: string;       // SVG <path d="..."> in 800x1000 canvas coordinates
  defaultColor: string;
}

export interface GarmentTemplate {
  id: string;
  name: string;
  category: GarmentCategory;
  views: Record<GarmentView, GarmentZone[]>;
  viewBoxes: Record<GarmentView, string>;
}
