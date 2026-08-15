// IndexedDB & LocalStorage Robust Offline-First Storage Engine for Vendeo POS

const DB_NAME = 'VendeoPOS_Database';
const DB_VERSION = 1;

const STORES = [
  'products',
  'sales',
  'expenses',
  'cashMovements',
  'customers',
  'suppliers',
  'settings',
  'categories',
  'orders',
  'proformas',
  'users',
  'purchaseInvoices',
  'promotions',
  'packs',
  'cashSessions',
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get item from IndexedDB with fallback to localStorage
 */
export async function getStoredItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(key, 'readonly');
      const store = tx.objectStore(key);
      const request = store.get('data');

      request.onsuccess = () => {
        if (request.result !== undefined) {
          resolve(request.result as T);
        } else {
          // Check localStorage as fallback
          const local = localStorage.getItem(`vendeo_${key}`);
          if (local) {
            try {
              resolve(JSON.parse(local));
              return;
            } catch {
              // ignore parse error
            }
          }
          resolve(defaultValue);
        }
      };

      request.onerror = () => {
        const local = localStorage.getItem(`vendeo_${key}`);
        if (local) {
          try {
            resolve(JSON.parse(local));
            return;
          } catch {
            // ignore
          }
        }
        resolve(defaultValue);
      };
    });
  } catch {
    // IndexedDB failed, fallback to localStorage synchronously
    const local = localStorage.getItem(`vendeo_${key}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    return defaultValue;
  }
}

/**
 * Save item to both IndexedDB and localStorage for dual redundancy
 */
export async function setStoredItem<T>(key: string, value: T): Promise<void> {
  // Always update localStorage synchronously
  try {
    localStorage.setItem(`vendeo_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('[Storage] LocalStorage save warning:', e);
  }

  // Update IndexedDB asynchronously
  try {
    const db = await openDB();
    const tx = db.transaction(key, 'readwrite');
    const store = tx.objectStore(key);
    store.put(value, 'data');
  } catch (e) {
    console.warn('[Storage] IndexedDB save warning:', e);
  }
}
