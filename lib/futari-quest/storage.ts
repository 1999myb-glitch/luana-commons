export interface QuestItem {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export interface QuestProgress {
  items: QuestItem[]
  exp: number
  completedCount: number
}

const STORAGE_KEY = 'futari-quest:shared'

const EMPTY_PROGRESS: QuestProgress = { items: [], exp: 0, completedCount: 0 }

function readFromStorage(): QuestProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_PROGRESS
    const parsed = JSON.parse(raw) as Partial<QuestProgress>
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      exp: typeof parsed.exp === 'number' ? parsed.exp : 0,
      completedCount: typeof parsed.completedCount === 'number' ? parsed.completedCount : 0,
    }
  } catch {
    return EMPTY_PROGRESS
  }
}

let cache: QuestProgress | null = null
const listeners = new Set<() => void>()

function getCached(): QuestProgress {
  if (!cache) cache = readFromStorage()
  return cache
}

/** Client-side snapshot for `useSyncExternalStore`. */
export function getProgressSnapshot(): QuestProgress {
  return getCached()
}

/** Server-side snapshot for `useSyncExternalStore` (localStorage isn't available during SSR). */
export function getServerProgressSnapshot(): QuestProgress {
  return EMPTY_PROGRESS
}

export function subscribeProgress(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

export function updateProgress(updater: (prev: QuestProgress) => QuestProgress): void {
  const next = updater(getCached())
  cache = next
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  listeners.forEach((cb) => cb())
}
