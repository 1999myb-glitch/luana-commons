import {
  AWAKENING_LEVELS,
  COMPANION_BOOST_COUNT,
  COMPANION_DROP_RATE,
  COMPANION_DROP_RATE_BOOSTED,
  COMPANION_SPECIES,
  DEFAULT_THEME_COLORS,
  ENERGY_MAX,
  ENERGY_PER_QUEST,
  EVOLVE_INTERVAL,
  EXP_PER_QUEST,
  GACHA_RATE,
  RARITY_WEIGHTS,
  WISH_EXP_BONUS,
  WISH_TICKET_INTERVAL,
  BADGES,
  TITLES,
  getLevel,
  getStageIndex,
  MAP_STAGES,
  otherPlayer,
  type MapStage,
  type PlayerId,
  type ThemeColorKey,
} from './constants'

export interface QuestItem {
  id: string
  text: string
  completed: boolean
  createdAt: number
  completedBy?: PlayerId
  completedDate?: string
}

export interface Companion {
  id: string
  speciesId: string
  rarity: number
  obtainedAt: number
  /** completedCount value at the moment this companion joined, used for evolution timing. */
  obtainedCompletedCount: number
  obtainedBy: PlayerId
}

export type ActivityType =
  | 'complete'
  | 'combo'
  | 'companion'
  | 'gacha'
  | 'wish'
  | 'levelup'
  | 'awaken'
  | 'superAwaken'
  | 'stageUp'

export interface ActivityEntry {
  id: string
  playerId: PlayerId | null
  type: ActivityType
  text: string
  timestamp: number
}

export interface QuestProgress {
  items: QuestItem[]
  exp: number
  completedCount: number
  energy: number
  companions: Companion[]
  wishTickets: number
  badges: string[]
  titles: string[]
  friendshipCombos: number
  lastCompletionDate: Partial<Record<PlayerId, string>>
  awakeningsShown: number[]
  superAwakenings: number
  companionBoostRemaining: number
  activity: ActivityEntry[]
  themeColors: Record<PlayerId, ThemeColorKey>
  currentPlayerId: PlayerId
}

const STORAGE_KEY = 'futari-quest:shared'

const EMPTY_PROGRESS: QuestProgress = {
  items: [],
  exp: 0,
  completedCount: 0,
  energy: 0,
  companions: [],
  wishTickets: 0,
  badges: [],
  titles: [],
  friendshipCombos: 0,
  lastCompletionDate: {},
  awakeningsShown: [],
  superAwakenings: 0,
  companionBoostRemaining: 0,
  activity: [],
  themeColors: { ...DEFAULT_THEME_COLORS },
  currentPlayerId: 'amy',
}

function readFromStorage(): QuestProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_PROGRESS
    const parsed = JSON.parse(raw) as Partial<QuestProgress>
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      exp: typeof parsed.exp === 'number' ? parsed.exp : 0,
      completedCount: typeof parsed.completedCount === 'number' ? parsed.completedCount : 0,
      energy: typeof parsed.energy === 'number' ? parsed.energy : 0,
      companions: Array.isArray(parsed.companions) ? parsed.companions : [],
      wishTickets: typeof parsed.wishTickets === 'number' ? parsed.wishTickets : 0,
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      titles: Array.isArray(parsed.titles) ? parsed.titles : [],
      friendshipCombos: typeof parsed.friendshipCombos === 'number' ? parsed.friendshipCombos : 0,
      lastCompletionDate:
        typeof parsed.lastCompletionDate === 'object' && parsed.lastCompletionDate ? parsed.lastCompletionDate : {},
      awakeningsShown: Array.isArray(parsed.awakeningsShown) ? parsed.awakeningsShown : [],
      superAwakenings: typeof parsed.superAwakenings === 'number' ? parsed.superAwakenings : 0,
      companionBoostRemaining: typeof parsed.companionBoostRemaining === 'number' ? parsed.companionBoostRemaining : 0,
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      themeColors: { ...DEFAULT_THEME_COLORS, ...(parsed.themeColors ?? {}) },
      currentPlayerId: parsed.currentPlayerId === 'miyabi' ? 'miyabi' : 'amy',
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

/* ---------------------------------------------------------------------- */
/* Companion helpers                                                        */
/* ---------------------------------------------------------------------- */

function rollRarity(): number {
  const total = RARITY_WEIGHTS.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < RARITY_WEIGHTS.length; i++) {
    r -= RARITY_WEIGHTS[i]
    if (r < 0) return i + 1
  }
  return 1
}

function rollSpecies(): string {
  return COMPANION_SPECIES[Math.floor(Math.random() * COMPANION_SPECIES.length)].id
}

function makeCompanion(playerId: PlayerId, completedCount: number, rarity?: number): Companion {
  return {
    id: crypto.randomUUID(),
    speciesId: rollSpecies(),
    rarity: rarity ?? rollRarity(),
    obtainedAt: Date.now(),
    obtainedCompletedCount: completedCount,
    obtainedBy: playerId,
  }
}

/** Growth stage index (0-2) for a companion, based on completions since it joined. */
export function getCompanionStage(companion: Companion, completedCount: number): number {
  const progress = completedCount - companion.obtainedCompletedCount
  return Math.min(2, Math.floor(progress / EVOLVE_INTERVAL))
}

function getSpeciesName(speciesId: string): string {
  return COMPANION_SPECIES.find((s) => s.id === speciesId)?.name ?? speciesId
}

/* ---------------------------------------------------------------------- */
/* Game events (shown as popups after completing a quest)                  */
/* ---------------------------------------------------------------------- */

export type GachaReward =
  | { kind: 'companion'; companion: Companion }
  | { kind: 'badge'; badge: string }
  | { kind: 'title'; title: string }

export type GameEvent =
  | { kind: 'combo' }
  | { kind: 'companion'; companion: Companion }
  | { kind: 'gacha'; reward: GachaReward }
  | { kind: 'wishTicket'; total: number }
  | { kind: 'levelup'; level: number }
  | { kind: 'awaken'; level: number }
  | { kind: 'superAwaken' }
  | { kind: 'stageUp'; stage: MapStage }

function pushActivity(activity: ActivityEntry[], playerId: PlayerId | null, type: ActivityType, text: string): void {
  activity.unshift({ id: crypto.randomUUID(), playerId, type, text, timestamp: Date.now() })
  if (activity.length > 50) activity.length = 50
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Toggle a quest item's completion state, applying every game-system side
 * effect (EXP, energy, friendship combos, companions, gacha, wishes,
 * level/awakening, map progress). Returns the next state plus a queue of
 * events for the UI to present as popups (only populated when completing).
 */
export function completeQuestItem(prev: QuestProgress, itemId: string): { next: QuestProgress; events: GameEvent[] } {
  const target = prev.items.find((i) => i.id === itemId)
  if (!target) return { next: prev, events: [] }

  const becomingComplete = !target.completed
  const playerId = prev.currentPlayerId

  if (!becomingComplete) {
    const items = prev.items.map((i) =>
      i.id === itemId ? { ...i, completed: false, completedBy: undefined, completedDate: undefined } : i
    )
    return {
      next: {
        ...prev,
        items,
        exp: Math.max(0, prev.exp - EXP_PER_QUEST),
        completedCount: Math.max(0, prev.completedCount - 1),
        energy: Math.max(0, prev.energy - ENERGY_PER_QUEST),
      },
      events: [],
    }
  }

  const events: GameEvent[] = []
  const activity = [...prev.activity]
  const today = todayString()
  const lastCompletionDate = { ...prev.lastCompletionDate }

  let exp = prev.exp
  let energy = prev.energy
  let superAwakenings = prev.superAwakenings
  let friendshipCombos = prev.friendshipCombos
  let wishTickets = prev.wishTickets
  let companions = prev.companions
  let badges = prev.badges
  let titles = prev.titles
  let companionBoostRemaining = prev.companionBoostRemaining
  const awakeningsShown = [...prev.awakeningsShown]

  const completedCount = prev.completedCount + 1

  // Friendship combo: both players completed something on the same day.
  let expGain = EXP_PER_QUEST
  if (lastCompletionDate[otherPlayer(playerId)] === today) {
    expGain *= 2
    friendshipCombos += 1
    events.push({ kind: 'combo' })
    pushActivity(activity, null, 'combo', '🎊 友情コンボ発生！EXPが2倍になった！')
  }
  lastCompletionDate[playerId] = today
  exp += expGain
  pushActivity(activity, playerId, 'complete', `「${target.text}」を達成した！`)

  // Energy / super awakening
  energy += ENERGY_PER_QUEST
  if (energy >= ENERGY_MAX) {
    energy = 0
    superAwakenings += 1
    events.push({ kind: 'superAwaken' })
    pushActivity(activity, playerId, 'superAwaken', '✨ 気がMAXになり超覚醒した！')
  }

  // Level up / awakening
  const prevLevel = getLevel(prev.exp)
  const newLevel = getLevel(exp)
  if (newLevel > prevLevel) {
    events.push({ kind: 'levelup', level: newLevel })
    pushActivity(activity, null, 'levelup', `🆙 レベル${newLevel}になった！`)
    for (const awLevel of AWAKENING_LEVELS) {
      if (newLevel >= awLevel && !awakeningsShown.includes(awLevel)) {
        awakeningsShown.push(awLevel)
        events.push({ kind: 'awaken', level: awLevel })
        pushActivity(activity, null, 'awaken', `🌟 レベル${awLevel}の覚醒が発生！`)
      }
    }
  }

  // Map stage progress
  const prevStageIdx = getStageIndex(prev.completedCount)
  const newStageIdx = getStageIndex(completedCount)
  if (newStageIdx > prevStageIdx) {
    const stage = MAP_STAGES[newStageIdx]
    events.push({ kind: 'stageUp', stage })
    if (stage.boss) {
      pushActivity(activity, null, 'stageUp', `⚔️ ${stage.boss.name}を倒して「${stage.name}」に到着！`)
    } else {
      pushActivity(activity, null, 'stageUp', `🗺️ 「${stage.name}」に到着！`)
    }
  }

  // Companion drop
  const boosted = companionBoostRemaining > 0
  const dropRate = boosted ? COMPANION_DROP_RATE_BOOSTED : COMPANION_DROP_RATE
  if (Math.random() < dropRate) {
    const companion = makeCompanion(playerId, completedCount)
    companions = [...companions, companion]
    events.push({ kind: 'companion', companion })
    pushActivity(activity, playerId, 'companion', `🎉 新しい仲間「${getSpeciesName(companion.speciesId)}」が見つかった！`)
    if (boosted) companionBoostRemaining -= 1
  }

  // Gacha bonus
  if (Math.random() < GACHA_RATE) {
    const roll = Math.random()
    let reward: GachaReward
    if (roll < 0.5) {
      const companion = makeCompanion(playerId, completedCount, 5)
      companions = [...companions, companion]
      reward = { kind: 'companion', companion }
      pushActivity(activity, playerId, 'gacha', `💫 激レア仲間「${getSpeciesName(companion.speciesId)}」をゲット！`)
    } else if (roll < 0.8) {
      const badge = BADGES[Math.floor(Math.random() * BADGES.length)]
      badges = badges.includes(badge) ? badges : [...badges, badge]
      reward = { kind: 'badge', badge }
      pushActivity(activity, playerId, 'gacha', `🎀 特別バッジ「${badge}」を獲得！`)
    } else {
      const title = TITLES[Math.floor(Math.random() * TITLES.length)]
      titles = titles.includes(title) ? titles : [...titles, title]
      reward = { kind: 'title', title }
      pushActivity(activity, playerId, 'gacha', `🏷️ 称号「${title}」を獲得！`)
    }
    events.push({ kind: 'gacha', reward })
  }

  // Wish ticket
  if (completedCount % WISH_TICKET_INTERVAL === 0) {
    wishTickets += 1
    events.push({ kind: 'wishTicket', total: wishTickets })
    pushActivity(activity, null, 'wish', '🌠 願いチケットを手に入れた！')
  }

  const items = prev.items.map((i) =>
    i.id === itemId ? { ...i, completed: true, completedBy: playerId, completedDate: today } : i
  )

  return {
    next: {
      ...prev,
      items,
      exp,
      completedCount,
      energy,
      companions,
      wishTickets,
      badges,
      titles,
      friendshipCombos,
      lastCompletionDate,
      awakeningsShown,
      superAwakenings,
      companionBoostRemaining,
      activity,
    },
    events,
  }
}

/* ---------------------------------------------------------------------- */
/* Wish ticket effects                                                      */
/* ---------------------------------------------------------------------- */

export type WishEffect = 'reroll' | 'expBonus' | 'companionBoost'

export function redeemWishTicket(prev: QuestProgress, effect: WishEffect): QuestProgress {
  if (prev.wishTickets <= 0) return prev
  const activity = [...prev.activity]
  let exp = prev.exp
  let companionBoostRemaining = prev.companionBoostRemaining

  if (effect === 'expBonus') {
    exp += WISH_EXP_BONUS
    pushActivity(activity, prev.currentPlayerId, 'wish', `🌠 願いの力でEXP+${WISH_EXP_BONUS}！`)
  } else if (effect === 'companionBoost') {
    companionBoostRemaining += COMPANION_BOOST_COUNT
    pushActivity(activity, prev.currentPlayerId, 'wish', '🌠 願いの力で仲間を見つけやすくなった！')
  } else {
    pushActivity(activity, prev.currentPlayerId, 'wish', '🌠 願いの力でサイコロの候補を再抽選した！')
  }

  return { ...prev, exp, companionBoostRemaining, wishTickets: prev.wishTickets - 1, activity }
}
