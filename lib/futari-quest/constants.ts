export interface Player {
  name: string
  emoji: string
}

export const PLAYERS: Player[] = [
  { name: 'あみ', emoji: '🍃' },
  { name: 'みやび', emoji: '💧' },
]

export const THEME = {
  accent: '#F2A0C4',
  light: '#FDEAF1',
} as const

export const EXP_PER_QUEST = 10
export const EXP_PER_LEVEL = 50

export function getLevel(exp: number): number {
  return Math.floor(exp / EXP_PER_LEVEL) + 1
}

export function getLevelProgress(exp: number): { current: number; max: number; percent: number } {
  const current = exp % EXP_PER_LEVEL
  return { current, max: EXP_PER_LEVEL, percent: (current / EXP_PER_LEVEL) * 100 }
}
