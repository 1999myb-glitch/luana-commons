'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { COMPANION_SPECIES, GROWTH_STAGES, THEME, getSpecies, rarityStars } from '@/lib/futari-quest/constants'
import { getCompanionStage, getProgressSnapshot, getServerProgressSnapshot, subscribeProgress } from '@/lib/futari-quest/storage'
import { FQ_GLOBAL_STYLES } from '@/lib/futari-quest/styles'
import BottomNav from '../_components/BottomNav'
import { PlayerAvatar } from '../_components/PlayerAvatar'

export default function FutariQuestCollectionPage() {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot)
  const obtainedSpecies = new Set(progress.companions.map((c) => c.speciesId))
  const sorted = [...progress.companions].sort((a, b) => b.rarity - a.rarity || b.obtainedAt - a.obtainedAt)

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
            📖 仲間図鑑
          </h1>
        </header>

        <section className="mb-5 rounded-3xl border-2 bg-white p-5 text-center" style={{ borderColor: THEME.light }}>
          <p className="text-[11px] font-bold tracking-widest text-[#BBA697]">図鑑コンプリート</p>
          <p className="mt-1 text-2xl font-black" style={{ color: THEME.accent }}>
            {obtainedSpecies.size} / {COMPANION_SPECIES.length}
          </p>
          <p className="mt-1 text-[11px] text-[#BBA697]">なかまの総数：{progress.companions.length}</p>
        </section>

        <section className="mb-5 grid grid-cols-4 gap-2">
          {COMPANION_SPECIES.map((species) => {
            const obtained = obtainedSpecies.has(species.id)
            return (
              <div
                key={species.id}
                className="flex flex-col items-center justify-center rounded-2xl border-2 p-3"
                style={{
                  borderColor: obtained ? THEME.accent : THEME.light,
                  background: obtained ? '#fff' : THEME.light,
                  opacity: obtained ? 1 : 0.6,
                }}
              >
                <span className="text-2xl">{obtained ? species.emoji : '❔'}</span>
                <span className="mt-1 text-[10px] font-bold text-[#6B5547]">{obtained ? species.name : '？？？'}</span>
              </div>
            )
          })}
        </section>

        {(progress.titles.length > 0 || progress.badges.length > 0) && (
          <section className="mb-5 rounded-3xl border-2 bg-white p-5" style={{ borderColor: THEME.light }}>
            {progress.titles.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-[11px] font-bold tracking-widest text-[#BBA697]">称号</p>
                <div className="flex flex-wrap gap-2">
                  {progress.titles.map((title) => (
                    <span key={title} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: THEME.light, color: THEME.accent }}>
                      🏷️ {title}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {progress.badges.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-bold tracking-widest text-[#BBA697]">バッジ</p>
                <div className="flex flex-wrap gap-2">
                  {progress.badges.map((badge) => (
                    <span key={badge} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: THEME.light, color: THEME.accent }}>
                      🎀 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section>
          <p className="mb-3 text-[11px] font-bold tracking-widest text-[#BBA697]">なかまリスト（{progress.companions.length}）</p>
          {progress.companions.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed py-10 text-center text-sm text-[#D9C7BC]" style={{ borderColor: THEME.light }}>
              やりたいことを達成して仲間を見つけよう ✨
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {sorted.map((companion) => {
                const species = getSpecies(companion.speciesId)
                const stage = getCompanionStage(companion, progress.completedCount)
                return (
                  <div key={companion.id} className="rounded-2xl border-2 bg-white p-3 text-center" style={{ borderColor: THEME.light }}>
                    <p className="text-3xl">{species.emoji}</p>
                    <p className="mt-1 text-sm font-black text-[#6B5547]">{species.name}</p>
                    <p className="text-xs font-bold" style={{ color: THEME.accent }}>
                      {rarityStars(companion.rarity)}
                    </p>
                    <p className="mt-1 text-[10px] text-[#BBA697]">
                      {GROWTH_STAGES[stage].decoration} {GROWTH_STAGES[stage].label}
                    </p>
                    <div className="mt-1 flex justify-center">
                      <PlayerAvatar playerId={companion.obtainedBy} themeColor={progress.themeColors[companion.obtainedBy]} size={20} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
