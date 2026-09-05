import { TestResult } from '../types';
import { safeValidateTestResults, safeValidateTestResult } from './schemas';

const DB_NAME = 'typesprint_db';
const DB_VERSION = 1;
const STORE_NAME = 'test_results';
const LEGACY_STORAGE_KEY = 'typesprint_test_results_v1';

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

// Initialize IndexedDB
function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }

  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('wpm', 'wpm', { unique: false });
        store.createIndex('mode', 'mode', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbInitPromise;
}

// In-memory cache for ultra-fast synchronous hydration
let memoryResultsCache: TestResult[] | null = null;

/**
 * Load initial results synchronously from memory or localStorage,
 * and asynchronously migrate / sync with IndexedDB.
 */
export function getInitialResults(): TestResult[] {
  if (memoryResultsCache) {
    return memoryResultsCache;
  }

  if (typeof window === 'undefined') return [];

  // 1. First attempt to read cached localStorage for instant UI mount
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const validated = safeValidateTestResults(parsed);
      memoryResultsCache = validated;
      // Kick off background migration to IndexedDB
      migrateLocalStorageToIndexedDB(validated).catch(console.error);
      return validated;
    }
  } catch (e) {
    console.warn('Could not read legacy localStorage', e);
  }

  memoryResultsCache = [];
  return [];
}

/**
 * Load all test results from IndexedDB asynchronously without blocking the main thread.
 */
export async function loadResultsFromIndexedDB(): Promise<TestResult[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Most recent first
      const results: TestResult[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const validated = safeValidateTestResult(cursor.value);
          if (validated) {
            results.push(validated);
          }
          cursor.continue();
        } else {
          memoryResultsCache = results;
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Falling back from IndexedDB to localStorage', e);
    return getInitialResults();
  }
}

/**
 * Save a test result asynchronously into IndexedDB.
 */
export async function saveResultToIndexedDB(result: TestResult): Promise<void> {
  // Update in-memory cache immediately
  if (memoryResultsCache) {
    memoryResultsCache = [result, ...memoryResultsCache.filter((r) => r.id !== result.id)];
  } else {
    memoryResultsCache = [result];
  }

  // Also update small localStorage cache for instant reboot (keep latest 50 for quick preview)
  try {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(memoryResultsCache.slice(0, 50)));
  } catch (e) {
    // Ignore quota errors gracefully
  }

  // Non-blocking asynchronous write to IndexedDB
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(result);
  } catch (e) {
    console.error('Failed to write to IndexedDB', e);
  }
}

/**
 * Delete all results from IndexedDB and localStorage.
 */
export async function clearAllResultsFromStorage(): Promise<void> {
  memoryResultsCache = [];
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (e) {}

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch (e) {
    console.error('Failed to clear IndexedDB', e);
  }
}

/**
 * Find the user's highest personal best result for a specific code snippet or text prompt
 */
export async function getPersonalBestForSnippet(
  snippetKey: string,
  mode?: string
): Promise<TestResult | null> {
  const allResults = memoryResultsCache || (await loadResultsFromIndexedDB());
  if (!allResults || allResults.length === 0) return null;

  const normalizedKey = snippetKey.trim().toLowerCase();

  const matching = allResults.filter((r) => {
    if (mode && r.mode !== mode) return false;
    if (r.snippetId && r.snippetId === snippetKey) return true;
    if (r.textSnippet && r.textSnippet.trim().toLowerCase().includes(normalizedKey.slice(0, 30))) {
      return true;
    }
    if (r.modeDetail && r.modeDetail.trim().toLowerCase() === normalizedKey) {
      return true;
    }
    return false;
  });

  if (matching.length === 0) {
    // If no exact snippet match, match best by mode
    if (mode) {
      const modeMatches = allResults
        .filter((r) => r.mode === mode)
        .sort((a, b) => b.wpm - a.wpm);
      return modeMatches[0] || null;
    }
    return null;
  }

  // Return the record with the highest WPM
  matching.sort((a, b) => b.wpm - a.wpm);
  return matching[0];
}

/**
 * Helper to migrate legacy localStorage array to IndexedDB
 */
async function migrateLocalStorageToIndexedDB(records: TestResult[]): Promise<void> {
  if (!records || records.length === 0) return;
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const record of records) {
      store.put(record);
    }
  } catch (e) {
    console.error('Failed migrating records to IndexedDB', e);
  }
}
