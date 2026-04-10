import { openDB, type IDBPDatabase } from 'idb';
import { supabase, isSupabaseConfigured } from './supabase';
import type { CanvasLayer } from '../stores/canvasStore';

// ─── Interface ───────────────────────────────────────────────────────

export interface SavedDesign {
  id: string;
  profile_id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  canvasJson: object;
  layers: CanvasLayer[];
  activeLayerId: string;
  garmentId: string | null;
}

export interface DesignStorage {
  save(design: SavedDesign): Promise<void>;
  get(id: string): Promise<SavedDesign | undefined>;
  list(profileId: string): Promise<SavedDesign[]>;
  delete(id: string): Promise<void>;
}

// ─── Supabase implementation ─────────────────────────────────────────

function createSupabaseStorage(): DesignStorage {
  return {
    async save(design) {
      if (!supabase) return;
      const row = {
        id: design.id,
        profile_id: design.profile_id,
        name: design.name,
        thumbnail: design.thumbnail,
        canvas_json: design.canvasJson,
        layers: design.layers,
        active_layer_id: design.activeLayerId,
        garment_id: design.garmentId,
        created_at: design.createdAt,
        updated_at: design.updatedAt,
      };
      await supabase.from('designs').upsert(row);
    },

    async get(id) {
      if (!supabase) return undefined;
      const { data } = await supabase.from('designs').select('*').eq('id', id).single();
      return data ? mapRow(data) : undefined;
    },

    async list(profileId) {
      if (!supabase) return [];
      const { data } = await supabase
        .from('designs')
        .select('*')
        .eq('profile_id', profileId)
        .order('updated_at', { ascending: false });
      return (data ?? []).map(mapRow);
    },

    async delete(id) {
      if (!supabase) return;
      await supabase.from('designs').delete().eq('id', id);
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): SavedDesign {
  return {
    id: row.id,
    profile_id: row.profile_id,
    name: row.name,
    thumbnail: row.thumbnail ?? '',
    canvasJson: row.canvas_json,
    layers: row.layers,
    activeLayerId: row.active_layer_id,
    garmentId: row.garment_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── IndexedDB implementation (offline fallback) ─────────────────────

const DB_NAME = 'fashion-studio';
const DB_VERSION = 2;
const STORE_NAME = 'designs';

let _db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('profile_id', 'profile_id');
      store.createIndex('updatedAt', 'updatedAt');
    },
  });
  return _db;
}

function createIndexedDBStorage(): DesignStorage {
  return {
    async save(design) {
      const db = await getDb();
      await db.put(STORE_NAME, design);
    },

    async get(id) {
      const db = await getDb();
      return db.get(STORE_NAME, id);
    },

    async list(profileId) {
      const db = await getDb();
      const all = await db.getAllFromIndex(STORE_NAME, 'profile_id', profileId);
      return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async delete(id) {
      const db = await getDb();
      await db.delete(STORE_NAME, id);
    },
  };
}

// ─── Export (auto-selects backend) ───────────────────────────────────

export const storage: DesignStorage = isSupabaseConfigured
  ? createSupabaseStorage()
  : createIndexedDBStorage();
