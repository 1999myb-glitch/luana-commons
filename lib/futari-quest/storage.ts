export interface QuestItem {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export interface PlayerProgress {
  items: QuestItem[]
  exp: number
  completedCount: number
}

const STORAGE_PREFIX = 'futari-quest:'

const EMPTY_PROGRESS: PlayerProgress = { items: [], exp: 0, completedCount: 0 }

function readFromStorage(playerId: string): PlayerProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + playerId)
    if (!raw) return EMPTY_PROGRESS
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      exp: typeof parsed.exp === 'number' ? parsed.exp : 0,
      completedCount: typeof parsed.completedCount === 'number' ? parsed.completedCount : 0,
    }
  } catch {
    return EMPTY_PROGRESS
  }
}

const cache = new Map<string, PlayerProgress>()
const listeners = new Map<string, Set<() => void>>()

function getCached(playerId: string): PlayerProgress {
  let value = cache.get(playerId)
  if (!value) {
    value = readFromStorage(playerId)
    cache.set(playerId, value)
  }
  return value
}

/** Client-side snapshot for `useSyncExternalStore`. */
export function getProgressSnapshot(playerId: string): PlayerProgress {
  return getCached(playerId)
}

/** Server-side snapshot for `useSyncExternalStore` (localStorage isn't available during SSR). */
export function getServerProgressSnapshot(): PlayerProgress {
  return EMPTY_PROGRESS
}

export function subscribeProgress(playerId: string, onChange: () => void): () => void {
  let set = listeners.get(playerId)
  if (!set) {
    set = new Set()
    listeners.set(playerId, set)
  }
  set.add(onChange)
  return () => set.delete(onChange)
}

export function updateProgress(playerId: string, updater: (prev: PlayerProgress) => PlayerProgress): void {
  const next = updater(getCached(playerId))
  cache.set(playerId, next)
  window.localStorage.setItem(STORAGE_PREFIX + playerId, JSON.stringify(next))
  listeners.get(playerId)?.forEach((cb) => cb())
}
