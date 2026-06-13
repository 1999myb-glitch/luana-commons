export type PlayerId = 'amy' | 'miyabi'

export interface Player {
  id: PlayerId
  name: string
  emoji: string
}

export const PLAYERS: Player[] = [
  { id: 'amy', name: 'あみ', emoji: '🍃' },
  { id: 'miyabi', name: 'みやび', emoji: '💧' },
]

export function getPlayer(id: PlayerId): Player {
  return PLAYERS.find((p) => p.id === id) ?? PLAYERS[0]
}

export function otherPlayer(id: PlayerId): PlayerId {
  return id === 'amy' ? 'miyabi' : 'amy'
}

/** Base app chrome colors (background, default accents). */
export const THEME = {
  accent: '#F2A0C4',
  light: '#FDEAF1',
  bg: '#FFF8F3',
  text: '#6B5547',
  sub: '#BBA697',
  faint: '#D9C7BC',
} as const

/** Selectable personal theme colors. */
export const THEME_COLORS = {
  pastelPink: { label: 'パステルピンク', main: '#F7B8CF', light: '#FDEAF1', text: '#9C5E78', border: '#F7B8CF' },
  pastelBlue: { label: 'パステルブルー', main: '#AED4F2', light: '#EAF4FD', text: '#5E7E9C', border: '#AED4F2' },
  pastelYellow: { label: 'パステルイエロー', main: '#F7E3A1', light: '#FDF7E3', text: '#9C8A4E', border: '#F7E3A1' },
  white: { label: 'ホワイト', main: '#FFFFFF', light: '#F7F5F2', text: '#8A7A6A', border: '#E5E0DA' },
  beige: { label: 'ベージュ', main: '#E8D5C8', light: '#F8F1EA', text: '#8A7158', border: '#E8D5C8' },
  pastelGreen: { label: 'パステルグリーン', main: '#BCE3C9', light: '#EAF8EF', text: '#5E9C78', border: '#BCE3C9' },
  lavender: { label: 'ラベンダー', main: '#D8C8F2', light: '#F3EDFD', text: '#7E5E9C', border: '#D8C8F2' },
  lightGray: { label: 'ライトグレー', main: '#D9D9DD', light: '#F4F4F6', text: '#7A7A82', border: '#D9D9DD' },
  pastelOrange: { label: 'パステルオレンジ', main: '#F7CBA4', light: '#FDF0E3', text: '#9C7350', border: '#F7CBA4' },
} as const

export type ThemeColorKey = keyof typeof THEME_COLORS
export const THEME_COLOR_KEYS = Object.keys(THEME_COLORS) as ThemeColorKey[]

export const DEFAULT_THEME_COLORS: Record<PlayerId, ThemeColorKey> = {
  amy: 'pastelGreen',
  miyabi: 'pastelBlue',
}

export function getThemeColor(key: ThemeColorKey) {
  return THEME_COLORS[key]
}

/* ---------------------------------------------------------------------- */
/* EXP / Level                                                              */
/* ---------------------------------------------------------------------- */

export const EXP_PER_QUEST = 10
export const EXP_PER_LEVEL = 50

export function getLevel(exp: number): number {
  return Math.floor(exp / EXP_PER_LEVEL) + 1
}

export function getLevelProgress(exp: number): { current: number; max: number; percent: number } {
  const current = exp % EXP_PER_LEVEL
  return { current, max: EXP_PER_LEVEL, percent: (current / EXP_PER_LEVEL) * 100 }
}

/** Levels at which a big "覚醒" animation should be shown. */
export const AWAKENING_LEVELS = [10, 20, 30]

/* ---------------------------------------------------------------------- */
/* Energy (気) / Super Awakening                                            */
/* ---------------------------------------------------------------------- */

export const ENERGY_PER_QUEST = 12
export const ENERGY_MAX = 100

/* ---------------------------------------------------------------------- */
/* Adventure Map                                                            */
/* ---------------------------------------------------------------------- */

export interface MapBoss {
  name: string
  emoji: string
}

export interface MapStage {
  id: string
  name: string
  emoji: string
  /** Total completed quests required to arrive at this stage. */
  threshold: number
  /** Cute "boss" guarding this stage, defeated automatically on arrival. */
  boss?: MapBoss
}

export const MAP_STAGES: MapStage[] = [
  { id: 'flower', name: 'お花畑', emoji: '🌷', threshold: 0 },
  { id: 'candy', name: 'お菓子の森', emoji: '🍬', threshold: 8, boss: { name: 'マシュマロベア', emoji: '🐻' } },
  { id: 'star', name: '星空の丘', emoji: '⭐', threshold: 20, boss: { name: 'ほしうさぎ', emoji: '🐰' } },
  { id: 'cloud', name: '雲の王国', emoji: '☁️', threshold: 38, boss: { name: 'くものプリンス', emoji: '🦄' } },
  { id: 'rainbow', name: '虹の橋', emoji: '🌈', threshold: 65, boss: { name: 'にじのちょうちょ', emoji: '🦋' } },
  { id: 'garden', name: '伝説の庭園', emoji: '🏰', threshold: 100, boss: { name: 'でんせつのともだち', emoji: '👑' } },
]

export function getStageIndex(completedCount: number): number {
  let idx = 0
  for (let i = 0; i < MAP_STAGES.length; i++) {
    if (completedCount >= MAP_STAGES[i].threshold) idx = i
  }
  return idx
}

export interface StageProgress {
  index: number
  stage: MapStage
  next: MapStage | null
  current: number
  max: number
  percent: number
}

export function getStageProgress(completedCount: number): StageProgress {
  const index = getStageIndex(completedCount)
  const stage = MAP_STAGES[index]
  const next = MAP_STAGES[index + 1] ?? null
  if (!next) {
    return { index, stage, next: null, current: completedCount - stage.threshold, max: 0, percent: 100 }
  }
  const span = next.threshold - stage.threshold
  const current = completedCount - stage.threshold
  return { index, stage, next, current, max: span, percent: Math.min(100, (current / span) * 100) }
}

/* ---------------------------------------------------------------------- */
/* Companions (collection / evolution)                                     */
/* ---------------------------------------------------------------------- */

export interface CompanionSpecies {
  id: string
  name: string
  emoji: string
}

export const COMPANION_SPECIES: CompanionSpecies[] = [
  { id: 'usagi', name: 'うさぎ', emoji: '🐰' },
  { id: 'neko', name: 'ねこ', emoji: '🐱' },
  { id: 'kuma', name: 'くま', emoji: '🐻' },
  { id: 'hiyoko', name: 'ひよこ', emoji: '🐤' },
  { id: 'kitsune', name: 'きつね', emoji: '🦊' },
  { id: 'penguin', name: 'ペンギン', emoji: '🐧' },
  { id: 'shiba', name: 'しばいぬ', emoji: '🐶' },
]

export function getSpecies(id: string): CompanionSpecies {
  return COMPANION_SPECIES.find((s) => s.id === id) ?? COMPANION_SPECIES[0]
}

/** Growth stages: かわいい → おしゃれ → かっこかわいい */
export const GROWTH_STAGES = [
  { label: 'かわいい', decoration: '' },
  { label: 'おしゃれ', decoration: '🎀' },
  { label: 'かっこかわいい', decoration: '👑' },
] as const

/** How many completions after obtaining before a companion grows one stage. */
export const EVOLVE_INTERVAL = 6

/** Rarity drop weights, index 0 = ★1 ... index 4 = ★5 (percent, sums to 100). */
export const RARITY_WEIGHTS = [45, 30, 15, 8, 2]
export const MAX_RARITY = RARITY_WEIGHTS.length

export function rarityStars(rarity: number): string {
  return '★'.repeat(rarity) + '☆'.repeat(MAX_RARITY - rarity)
}

/** Chance (0-1) that completing a quest gives a new companion. */
export const COMPANION_DROP_RATE = 0.45
/** Boosted chance while a 願いチケット companion-boost is active. */
export const COMPANION_DROP_RATE_BOOSTED = 0.75

/* ---------------------------------------------------------------------- */
/* Wish tickets (ドラゴンボール風の願い)                                      */
/* ---------------------------------------------------------------------- */

export const WISH_TICKET_INTERVAL = 10
export const WISH_EXP_BONUS = 30
export const COMPANION_BOOST_COUNT = 3

/* ---------------------------------------------------------------------- */
/* Gacha (低確率ボーナス)                                                    */
/* ---------------------------------------------------------------------- */

export const GACHA_RATE = 0.07

export const BADGES = ['きらめきバッジ', 'にじいろバッジ', 'ラブラブバッジ', 'ほしのバッジ', 'はなまるバッジ']
export const TITLES = ['はじめの一歩', '冒険者見習い', 'がんばり屋さん', 'ふたりの絆マスター', '伝説の冒険者']

/* ---------------------------------------------------------------------- */
/* Goal                                                                     */
/* ---------------------------------------------------------------------- */

export const GOAL_COMPLETED_COUNT = 100
