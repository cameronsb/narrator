import type { SavedPresentation } from './store'

const DB_NAME = 'narrator-db'
const DB_VERSION = 1
const STORE_NAME = 'presentations'
const MIGRATION_KEY = 'narrator-storage-migrated'

let dbInstance: IDBDatabase | null = null
let dbPromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('savedAt', 'savedAt', { unique: false })
      }
    }
  })

  return dbPromise
}

export async function getAllPresentations(): Promise<SavedPresentation[]> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const presentations = request.result as SavedPresentation[]
      presentations.sort((a, b) => b.savedAt - a.savedAt)
      resolve(presentations)
    }

    request.onerror = () => {
      console.error('Failed to get presentations:', request.error)
      reject(request.error)
    }
  })
}

export async function getPresentation(id: string): Promise<SavedPresentation | undefined> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      console.error('Failed to get presentation:', request.error)
      reject(request.error)
    }
  })
}

export async function savePresentation(presentation: SavedPresentation): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(presentation)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error('Failed to save presentation:', request.error)
      reject(request.error)
    }
  })
}

export async function deletePresentation(id: string): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error('Failed to delete presentation:', request.error)
      reject(request.error)
    }
  })
}

export async function clearAllPresentations(): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error('Failed to clear presentations:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Migrate data from localStorage to IndexedDB (one-time migration)
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return

  // Check if already migrated
  if (localStorage.getItem(MIGRATION_KEY)) return

  try {
    const oldData = localStorage.getItem('narrator-storage')
    if (!oldData) {
      localStorage.setItem(MIGRATION_KEY, 'true')
      return
    }

    const parsed = JSON.parse(oldData)
    const presentations: SavedPresentation[] = parsed?.state?.savedPresentations || []

    if (presentations.length > 0) {
      const db = await openDatabase()
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      for (const presentation of presentations) {
        store.put(presentation)
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })

      console.log(`Migrated ${presentations.length} presentations to IndexedDB`)
    }

    // Clear old localStorage data after successful migration
    localStorage.removeItem('narrator-storage')
    localStorage.setItem(MIGRATION_KEY, 'true')
  } catch (error) {
    console.error('Migration from localStorage failed:', error)
  }
}

interface PersistedState {
  state: { savedPresentations: SavedPresentation[] }
  version?: number
}

/**
 * Zustand-compatible async storage adapter for IndexedDB
 * Returns the state object directly (not stringified) as Zustand expects
 */
export const indexedDBStorage = {
  getItem: async (_name: string): Promise<PersistedState | null> => {
    try {
      const presentations = await getAllPresentations()
      return { state: { savedPresentations: presentations }, version: 0 }
    } catch {
      return null
    }
  },

  setItem: async (_name: string, value: PersistedState): Promise<void> => {
    try {
      const newPresentations: SavedPresentation[] = value?.state?.savedPresentations || []
      const existingPresentations = await getAllPresentations()

      // Find presentations to delete (exist in DB but not in new state)
      const newIds = new Set(newPresentations.map((p) => p.id))
      const toDelete = existingPresentations.filter((p) => !newIds.has(p.id))

      // Find presentations to add/update
      const existingIds = new Set(existingPresentations.map((p) => p.id))
      const toSave = newPresentations.filter((p) => {
        if (!existingIds.has(p.id)) return true
        const existing = existingPresentations.find((e) => e.id === p.id)
        return JSON.stringify(existing) !== JSON.stringify(p)
      })

      // Execute deletions
      for (const p of toDelete) {
        await deletePresentation(p.id)
      }

      // Execute saves
      for (const p of toSave) {
        await savePresentation(p)
      }
    } catch (error) {
      console.error('Failed to persist to IndexedDB:', error)
    }
  },

  removeItem: async (_name: string): Promise<void> => {
    await clearAllPresentations()
  },
}
