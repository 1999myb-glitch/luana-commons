'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { GOAL_COMPLETED_COUNT, MAP_STAGES, PLAYERS, THEME, getStageProgress } from '@/lib/futari-quest/constants'
import { getProgressSnapshot, getServerProgressSnapshot, subscribeProgress } from '@/lib/futari-quest/storage'
import { FQ_GLOBAL_STYLES } from '@/lib/futari-quest/styles'
import BottomNav from '../_components/BottomNav'

export default function FutariQuestMapPage() {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot)
  const stageProgress = getStageProgress(progress.completedCount)
  const cleared = stageProgress.next === null

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
            🗺️ 冒険マップ
          </h1>
        </header>

        <section className="mb-5 rounded-3xl border-2 bg-white p-5 text-center" style={{ borderColor: THEME.light }}>
          <p className="text-[11px] font-bold tracking-widest text-[#BBA697]">現在地</p>
          <p className="mt-1 text-2xl font-black text-[#6B5547]">
            {stageProgress.stage.emoji} {stageProgress.stage.name}
          </p>
          <p className="mt-2 text-[11px] text-[#BBA697]">
            達成数 {progress.completedCount} / {GOAL_COMPLETED_COUNT}
          </p>
        </section>

        {cleared && (
          <section className="fq-pop mb-5 rounded-2xl border-2 p-4 text-center" style={{ borderColor: THEME.accent, background: THEME.light }}>
            <p className="fq-super inline-block text-3xl">🏆</p>
            <p className="mt-1 text-sm font-black text-[#6B5547]">マップ踏破おめでとう！ふたりの冒険は伝説になった</p>
          </section>
        )}

        <section className="flex flex-col">
          {MAP_STAGES.map((stage, i) => {
            const isCurrent = i === stageProgress.index
            const isFuture = i > stageProgress.index
            const bossDefeated = stage.boss && i <= stageProgress.index
            const showNextBossProgress = isCurrent && stageProgress.next?.boss

            return (
              <div key={stage.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 text-2xl ${isCurrent ? 'fq-pop' : ''}`}
                    style={{
                      borderColor: isFuture ? THEME.light : THEME.accent,
                      background: isFuture ? '#fff' : THEME.light,
                      opacity: isFuture ? 0.5 : 1,
                    }}
                  >
                    {isFuture ? '🔒' : stage.emoji}
                  </div>
                  {i < MAP_STAGES.length - 1 && (
                    <div className="my-1 h-10 w-1 flex-1 rounded-full" style={{ background: isFuture ? THEME.light : THEME.accent }} />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div
                    className="rounded-2xl border-2 p-4"
                    style={{
                      borderColor: isCurrent ? THEME.accent : THEME.light,
                      background: isCurrent ? THEME.light : '#fff',
                      opacity: isFuture ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-[#6B5547]">{stage.name}</p>
                      {isCurrent && <span className="fq-float text-lg">{PLAYERS.map((p) => p.emoji).join('')}</span>}
                      {!isCurrent && !isFuture && (
                        <span className="text-xs font-bold" style={{ color: THEME.accent }}>
                          クリア ✓
                        </span>
                      )}
                      {isFuture && <span className="text-xs text-[#D9C7BC]">未踏</span>}
                    </div>

                    {stage.boss && (
                      <p className="mt-2 text-[11px] text-[#BBA697]">
                        {bossDefeated ? (
                          <>
                            ✅ {stage.boss.emoji} {stage.boss.name} を撃破済み
                          </>
                        ) : (
                          <>
                            🔒 {stage.boss.emoji} {stage.boss.name}
                          </>
                        )}
                      </p>
                    )}

                    {showNextBossProgress && stageProgress.next?.boss && (
                      <div className="mt-3">
                        <p className="text-[11px] font-bold text-[#BBA697]">
                          つぎのボス：{stageProgress.next.boss.emoji} {stageProgress.next.boss.name}
                        </p>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ background: '#fff' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${stageProgress.percent}%`, background: THEME.accent }}
                          />
                        </div>
                        <p className="mt-1 text-right text-[10px] text-[#BBA697]">
                          {stageProgress.current} / {stageProgress.max}
                        </p>
                        <p className="mt-1 text-[10px] text-[#D9C7BC]">やりたいことを達成すると自動でダメージ！</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
