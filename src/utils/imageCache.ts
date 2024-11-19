interface CachedImage {
  prompt: string;
  modelId: string;
  parameters: Record<string, any>;
  url: string;
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DB_NAME = 'conservatory-cache';
const STORE_NAME = 'images';

let db: IDBDatabase | null = null;

// Initialize IndexedDB
const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: ['prompt', 'modelId'] });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
};

// Generate cache key from parameters
const generateCacheKey = (prompt: string, modelId: string, parameters: Record<string, any>) => {
  return JSON.stringify({ prompt, modelId, parameters });
};

// Store image in cache
export const cacheImage = async (
  prompt: string,
  modelId: string,
  parameters: Record<string, any>,
  url: string
): Promise<void> => {
  await initDB();
  if (!db) return;

  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  const image: CachedImage = {
    prompt,
    modelId,
    parameters,
    url,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const request = store.put(image);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Get image from cache
export const getCachedImage = async (
  prompt: string,
  modelId: string,
  parameters: Record<string, any>
): Promise<string | null> => {
  await initDB();
  if (!db) return null;

  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get([prompt, modelId]);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as CachedImage;
      if (!result || Date.now() - result.timestamp > CACHE_DURATION) {
        resolve(null);
        return;
      }

      // Check if parameters match
      if (JSON.stringify(result.parameters) !== JSON.stringify(parameters)) {
        resolve(null);
        return;
      }

      resolve(result.url);
    };
  });
};

// Clean up expired cache entries
export const cleanupCache = async (): Promise<void> => {
  await initDB();
  if (!db) return;

  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('timestamp');

  const cutoff = Date.now() - CACHE_DURATION;
  const range = IDBKeyRange.upperBound(cutoff);

  return new Promise((resolve, reject) => {
    const request = index.openCursor(range);
    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      } else {
        resolve();
      }
    };
  });
};

// Initialize cache and start cleanup interval
export const initializeCache = () => {
  initDB().then(() => {
    cleanupCache();
    // Run cleanup every 6 hours
    setInterval(cleanupCache, 6 * 60 * 60 * 1000);
  });
};
