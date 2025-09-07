// Simple IndexedDB wrapper for offline routes and a sync queue
import type { MarchingRoute } from "@/schemas/routeSchema"

const DB_NAME = "march-smart-db"
const DB_VERSION = 1
const ROUTES_STORE = "routes"
const QUEUE_STORE = "queue"

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(ROUTES_STORE)) {
        db.createObjectStore(ROUTES_STORE, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const q = db.createObjectStore(QUEUE_STORE, { keyPath: "id", autoIncrement: true })
        q.createIndex("byType", "type")
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(store, mode)
    const s = t.objectStore(store)
    Promise.resolve(fn(s))
      .then((res) => {
        t.oncomplete = () => resolve(res)
        t.onerror = () => reject(t.error)
      })
      .catch(reject)
  })
}

export async function saveRouteOffline(route: MarchingRoute) {
  return tx(ROUTES_STORE, "readwrite", (s) => {
    s.put(route)
    return route
  })
}

export async function getRouteOffline(id: string): Promise<MarchingRoute | undefined> {
  return tx(ROUTES_STORE, "readonly", (s) => {
    return new Promise<MarchingRoute | undefined>((resolve) => {
      const req = s.get(id)
      req.onsuccess = () => resolve(req.result as MarchingRoute | undefined)
      req.onerror = () => resolve(undefined)
    })
  })
}

export async function listRoutesOffline(): Promise<MarchingRoute[]> {
  return tx(ROUTES_STORE, "readonly", (s) => {
    return new Promise<MarchingRoute[]>((resolve) => {
      const req = s.getAll()
      req.onsuccess = () => resolve((req.result as MarchingRoute[]) ?? [])
      req.onerror = () => resolve([])
    })
  })
}

export async function deleteRouteOffline(id: string) {
  return tx(ROUTES_STORE, "readwrite", (s) => {
    s.delete(id)
  })
}

type QueueItem = { type: "upsert" | "delete"; route?: MarchingRoute; routeId?: string; at: number }

export async function enqueueChange(item: QueueItem) {
  return tx(QUEUE_STORE, "readwrite", (s) => {
    s.add({ ...item, at: Date.now() })
  })
}

export async function drainQueue(): Promise<QueueItemWithId[]> {
  return tx(QUEUE_STORE, "readwrite", (s) => {
    return new Promise<QueueItemWithId[]>((resolve) => {
      const req = s.getAll()
      req.onsuccess = () => {
        const items = (req.result as QueueItemWithId[]) ?? []
        // clear
        items.forEach((i) => s.delete(i.id))
        resolve(items)
      }
      req.onerror = () => resolve([])
    })
  })
}

type QueueItemWithId = QueueItem & { id: number }

// Simple online check
function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

// Optional: auto-sync when back online
export function installOnlineSync(handler: (items: QueueItem[]) => Promise<void>) {
  if (typeof window === "undefined") return
  const sync = async () => {
    if (!isOnline()) return
    const items = await drainQueue()
    if (items.length) {
      await handler(items)
    }
  }
  window.addEventListener("online", sync)
  // initial
  void sync()
}
