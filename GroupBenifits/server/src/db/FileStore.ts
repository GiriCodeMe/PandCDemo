import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

// Resolve seed dir relative to server package root (one level above dist/)
function getSeedDir(): string {
  // In tests __dirname is src/db, in compiled dist __dirname is dist/db
  // seed/ is always at ../../seed relative to the server package root
  const serverRoot = path.resolve(__dirname, '../..');
  return path.resolve(serverRoot, env.SEED_DIR);
}

export class FileStore {
  private cache = new Map<string, unknown>();

  readArray<T>(collection: string): T[] {
    if (this.cache.has(collection)) {
      return this.cache.get(collection) as T[];
    }
    const filePath = path.join(getSeedDir(), collection + '.json');
    if (!fs.existsSync(filePath)) return [];
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const data = Array.isArray(raw) ? raw : [raw];
    this.cache.set(collection, data);
    return data as T[];
  }

  readObject<T>(collection: string): T | null {
    const filePath = path.join(getSeedDir(), collection + '.json');
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  }

  findOne<T extends Record<string, unknown>>(collection: string, key: string, value: unknown): T | undefined {
    return this.readArray<T>(collection).find(item => item[key] === value);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

let _instance: FileStore | null = null;
export function getStore(): FileStore {
  if (!_instance) _instance = new FileStore();
  return _instance;
}
export function resetStore(): void {
  _instance = null;
}
