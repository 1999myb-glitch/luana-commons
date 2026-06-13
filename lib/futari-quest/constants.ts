export type PlayerId = 'ami' | 'miyabi'

export interface Player {
  id: PlayerId
  name: string
  emoji: string
  accent: string
  light: string
}

export const PLAYERS: Player[] = [
  { id: 'ami', name: 'あみ', emoji: '🍃', accent: '#9ECBAC', light: '#E8F5EC' },
  { id: 'miyabi', name: 'みやび', emoji: '💧', accent: '#92C6E2', light: '#E7F4FA' },
]

export function getPlayer(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id)
}

export const EXP_PER_QUEST = 10
export const EXP_PER_LEVEL = 50

export function getLevel(exp: number): number {
  return Math.floor(exp / EXP_PER_LEVEL) + 1
}

export function getLevelProgress(exp: number): { current: number; max: number; percent: number } {
  const current = exp % EXP_PER_LEVEL
  return { current, max: EXP_PER_LEVEL, percent: (current / EXP_PER_LEVEL) * 100 }
}
