export type PlayerId = 'a' | 'b'

export interface Player {
  id: PlayerId
  name: string
  emoji: string
  accent: string
  light: string
}

export const PLAYERS: Player[] = [
  { id: 'a', name: 'Aさん', emoji: '🌸', accent: '#F2A0C4', light: '#FDEAF1' },
  { id: 'b', name: 'Bさん', emoji: '🍪', accent: '#B9905F', light: '#F7EEE1' },
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
