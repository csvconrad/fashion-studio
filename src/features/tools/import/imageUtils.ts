// ─── Image import utilities ──────────────────────────────────────────

import { FabricImage } from 'fabric';
import type { Canvas as FabricCanvas } from 'fabric';
import { useCanvasStore, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../stores/canvasStore';

/** Add an image to the canvas from a data URL or blob URL */
export async function addImageToCanvas(src: string, canvas: FabricCanvas) {
  const img = await FabricImage.fromURL(src);
  const state = useCanvasStore.getState();

  // Scale to fit within canvas (max 60% of canvas dimension)
  const maxW = CANVAS_WIDTH * 0.6;
  const maxH = CANVAS_HEIGHT * 0.6;
  const imgW = img.width ?? 100;
  const imgH = img.height ?? 100;
  const scale = Math.min(maxW / imgW, maxH / imgH, 1);

  img.set({
    left: (CANVAS_WIDTH - imgW * scale) / 2,
    top: (CANVAS_HEIGHT - imgH * scale) / 2,
    scaleX: scale,
    scaleY: scale,
    data: {
      objectId: crypto.randomUUID(),
      layerId: state.activeLayerId,
    },
  });

  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.renderAll();
  state.commitToHistory();
}

/** Read a File as data URL */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Load image from URL (handles CORS via fetch + blob) */
export async function loadImageFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ─── Unsplash API (free, no key needed for demo endpoint) ────────────

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;

export interface UnsplashPhoto {
  id: string;
  urls: { small: string; regular: string; thumb: string };
  alt_description: string | null;
  user: { name: string };
}

export async function searchUnsplash(query: string, page = 1): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) return [];
  const params = new URLSearchParams({ query, page: String(page), per_page: '20', orientation: 'squarish' });
  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}
