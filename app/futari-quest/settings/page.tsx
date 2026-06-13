'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { PLAYERS, THEME, THEME_COLOR_KEYS, getThemeColor, type PlayerId, type ThemeColorKey } from '@/lib/futari-quest/constants'
import { getProgressSnapshot, getServerProgressSnapshot, subscribeProgress, updateProgress } from '@/lib/futari-quest/storage'
import { FQ_GLOBAL_STYLES } from '@/lib/futari-quest/styles'
import BottomNav from '../_components/BottomNav'

export default function FutariQuestSettingsPage() {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot)

  function setColor(playerId: PlayerId, color: ThemeColorKey) {
    updateProgress((prev) => ({ ...prev, themeColors: { ...prev.themeColors, [playerId]: color } }))
  }

  return (
    <main className="min-h-screen bg-[#FFF8F3] pb-24">
      <style>{FQ_GLOBAL_STYLES}</style>

      <div className="mx-auto max-w-md px-4 pt-6">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href="/futari-quest"
            aria-label="トップに戻る"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#FDEAF1] bg-white text-[#BBA697]"
          >
            ←
          </Link>
          <h1 className="text-lg font-black text-[#6B5547]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            ⚙️ せってい
          </h1>
        </header>

        {PLAYERS.map((player) => {
          const color = getThemeColor(progress.themeColors[player.id])
          return (
            <section key={player.id} className="mb-5 rounded-3xl border-2 bg-white p-5" style={{ borderColor: THEME.light }}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: color.light }}>
                  {player.emoji}
                </div>
                <div>
                  <p className="text-base font-black text-[#6B5547]">{player.name}</p>
                  <p className="text-[11px] text-[#BBA697]">テーマカラー：{color.label}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {THEME_COLOR_KEYS.map((key) => {
                  const c = getThemeColor(key)
                  const selected = progress.themeColors[player.id] === key
                  return (
                    <button
                      key={key}
                      onClick={() => setColor(player.id, key)}
                      className="flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-transform active:scale-95"
                      style={{ borderColor: selected ? c.main : '#F4EBE3', background: selected ? c.light : '#fff' }}
                    >
                      <span className="h-8 w-8 rounded-full border-2" style={{ background: c.main, borderColor: c.border }} />
                      <span className="text-[10px] font-bold text-[#6B5547]">{c.label}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}

        <section className="rounded-3xl border-2 bg-white p-5" style={{ borderColor: THEME.light }}>
          <p className="mb-3 text-[11px] font-bold tracking-widest text-[#BBA697]">プレビュー</p>
          <div className="flex gap-3">
            {PLAYERS.map((player) => {
              const color = getThemeColor(progress.themeColors[player.id])
              return (
                <div key={player.id} className="flex-1 rounded-2xl border-2 p-3 text-center" style={{ borderColor: color.border, background: color.light }}>
                  <p className="text-2xl">{player.emoji}</p>
                  <p className="mt-1 text-xs font-black" style={{ color: color.text }}>
                    {player.name}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div className="h-full w-2/3 rounded-full" style={{ background: color.main }} />
                  </div>
                  <button className="mt-2 w-full rounded-full py-1 text-[10px] font-bold text-white" style={{ background: color.main }}>
                    ボタン
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
