import { getPlayer, getThemeColor, type PlayerId, type ThemeColorKey } from '@/lib/futari-quest/constants'

export function PlayerAvatar({
  playerId,
  themeColor,
  size = 28,
}: {
  playerId: PlayerId
  themeColor: ThemeColorKey
  size?: number
}) {
  const player = getPlayer(playerId)
  const color = getThemeColor(themeColor)
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: color.light, fontSize: size * 0.55 }}
      title={player.name}
    >
      {player.emoji}
    </span>
  )
}
