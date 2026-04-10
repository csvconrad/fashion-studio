import { openDB, type IDBPDatabase } from 'idb';
import type { CanvasLayer } from '../stores/canvasStore';

// ─── Interface (swap IndexedDB → Supabase later) ─────────────────────

export interface SavedDesign {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnail: string;         // data URL (PNG)
  canvasJson: object;        // Fabric.js canvas state
  layers: CanvasLayer[];
  activeLayerId: string;
  garmentId: string | null;  // template ID of the active garment
}

export interface DesignStorage {
  save(design: SavedDesign): Promise<void>;
  get(id: string): Promise<SavedDesign | undefined>;
  list(): Promise<SavedDesign[]>;
  delete(id: string): Promise<void>;
}

// ─── IndexedDB implementation ────────────────────────────────────────

const DB_NAME = 'fashion-studio';
const DB_VERSION = 1;
const STORE_NAME = 'designs';

let _db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    },
  });
  return _db;
}

export const storage: DesignStorage = {
  async save(design) {
    const db = await getDb();
    await db.put(STORE_NAME, design);
  },

  async get(id) {
    const db = await getDb();
    return db.get(STORE_NAME, id);
  },

  async list() {
    const db = await getDb();
    const all = await db.getAll(STORE_NAME);
    // Sort newest first
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async delete(id) {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
  },
};
