/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SavedPresentation } from './store'

const DB_NAME = 'narrator-db'
const DB_VERSION = 1
const STORE_NAME = 'presentations'
const ACTIVE_SESSION_KEY = 'narrator-active-session'

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

interface PersistedState {
  state: {
    savedPresentations: SavedPresentation[]
    activePresentationId?: string | null
  }
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
      // Read activePresentationId from localStorage (small value, fast sync access)
      const activePresentationId = localStorage.getItem(ACTIVE_SESSION_KEY) || null
      return {
        state: {
          savedPresentations: presentations,
          activePresentationId,
        },
        version: 0,
      }
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

      // Persist activePresentationId to localStorage
      const activePresentationId = value?.state?.activePresentationId
      if (activePresentationId) {
        localStorage.setItem(ACTIVE_SESSION_KEY, activePresentationId)
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY)
      }
    } catch (error) {
      console.error('Failed to persist to IndexedDB:', error)
    }
  },

  removeItem: async (_name: string): Promise<void> => {
    await clearAllPresentations()
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  },
}
