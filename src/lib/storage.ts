const DB_NAME = 'ops_workbench'
const DB_VERSION = 3

export interface Material {
  id: string
  name: string
  type: 'image' | 'video' | 'pdf'
  size: number
  dataUrl: string
  category: string
  notes: string
  modelTag: string
  uploadedAt: string
}

export interface Attachment {
  id: string
  name: string
  type: "image" | "video"
  dataUrl: string
  size: number
}

export interface Issue {
  id: string
  title: string
  description: string
  date: string
  resolved: boolean
  resolvedAt?: string
  tags: string[]
  attachments: Attachment[]
  createdAt: string
}

export interface AppUser {
  id: string
  username: string
  password: string
  name: string
  role: string
  isAdmin: boolean
  createdAt: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('materials')) {
        db.createObjectStore('materials', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('issues')) {
        db.createObjectStore('issues', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' })
        store.createIndex('username', 'username', { unique: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function put<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const req = store.put(item)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// Materials
export async function getMaterials(): Promise<Material[]> { return getAll<Material>('materials') }
export async function addMaterial(m: Material): Promise<void> { return put('materials', m) }
export async function updateMaterial(m: Material): Promise<void> { return put('materials', m) }
export async function deleteMaterial(id: string): Promise<void> { return remove('materials', id) }
export async function deleteMaterials(ids: string[]): Promise<void> {
  for (const id of ids) await remove('materials', id)
}

// Issues
export async function getIssues(): Promise<Issue[]> { return getAll<Issue>('issues') }
export async function addIssue(issue: Issue): Promise<void> { return put('issues', issue) }
export async function updateIssue(issue: Issue): Promise<void> { return put('issues', issue) }
export async function deleteIssue(id: string): Promise<void> { return remove('issues', id) }

// Users
export async function getUsers(): Promise<AppUser[]> { return getAll<AppUser>('users') }
export async function addAppUser(u: AppUser): Promise<void> { return put('users', u) }
export async function updateAppUser(u: AppUser): Promise<void> { return put('users', u) }
export async function deleteAppUser(id: string): Promise<void> { return remove('users', id) }

// Helpers
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
