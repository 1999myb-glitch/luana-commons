import { THEME, getPlayer, getThemeColor, type PlayerId, type ThemeColorKey } from '@/lib/futari-quest/constants'
import type { ActivityEntry } from '@/lib/futari-quest/storage'

export function ActivityFeed({
  activity,
  themeColors,
  limit = 8,
}: {
  activity: ActivityEntry[]
  themeColors: Record<PlayerId, ThemeColorKey>
  limit?: number
}) {
  if (activity.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed py-6 text-center text-sm text-[#D9C7BC]" style={{ borderColor: THEME.light }}>
        まだ記録がありません
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {activity.slice(0, limit).map((entry) => {
        const player = entry.playerId ? getPlayer(entry.playerId) : null
        const color = entry.playerId ? getThemeColor(themeColors[entry.playerId]) : null
        return (
          <div
            key={entry.id}
            className="flex items-center gap-2 rounded-2xl border-2 bg-white px-3 py-2"
            style={{ borderColor: color?.border ?? THEME.light }}
          >
            <span
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm"
              style={{ background: color?.light ?? THEME.light }}
            >
              {player ? player.emoji : '✨'}
            </span>
            <p className="flex-1 text-xs text-[#6B5547]">{entry.text}</p>
            {player && (
              <span className="flex-shrink-0 text-[10px] font-bold" style={{ color: color?.text }}>
                {player.name}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
