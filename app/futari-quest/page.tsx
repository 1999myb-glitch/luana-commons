'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import {
  COMPANION_SPECIES,
  ENERGY_MAX,
  GOAL_COMPLETED_COUNT,
  PLAYERS,
  THEME,
  getLevel,
  getLevelProgress,
  getStageProgress,
  getThemeColor,
} from '@/lib/futari-quest/constants'
import { getProgressSnapshot, getServerProgressSnapshot, subscribeProgress, updateProgress } from '@/lib/futari-quest/storage'
import { FQ_GLOBAL_STYLES } from '@/lib/futari-quest/styles'
import BottomNav from './_components/BottomNav'
import { ActivityFeed } from './_components/ActivityFeed'

export default function FutariQuestHomePage() {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot)

  const level = getLevel(progress.exp)
  const { current, max, percent } = getLevelProgress(progress.exp)
  const stageProgress = getStageProgress(progress.completedCount)
  const speciesCount = new Set(progress.companions.map((c) => c.speciesId)).size

  function selectPlayer(id: (typeof PLAYERS)[number]['id']) {
    updateProgress((prev) => ({ ...prev, currentPlayerId: id }))
  }

  return (
    <main className="min-h-screen bg-[#FFF8F3] pb-24">
      <style>{FQ_GLOBAL_STYLES}</style>

      <div className="mx-auto max-w-md px-4 pt-6">
        <header className="mb-5 text-center">
          <p className="mb-1 text-xs font-bold tracking-[0.3em] text-[#BBA697]">TWO PLAYER ADVENTURE</p>
          <h1 className="text-3xl font-black text-[#6B5547]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            🎲 Futari Quest
          </h1>
          <p className="mt-2 text-xs text-[#BBA697]">ふたりの冒険アルバム</p>
        </header>

        {/* Players / "you are" switcher */}
        <section className="mb-4 flex gap-3">
          {PLAYERS.map((player) => {
            const color = getThemeColor(progress.themeColors[player.id])
            const isYou = progress.currentPlayerId === player.id
            return (
              <button
                key={player.id}
                onClick={() => selectPlayer(player.id)}
                className="flex-1 rounded-3xl border-2 p-3 text-center transition-transform active:scale-95"
                style={{ borderColor: color.border, background: isYou ? color.light : '#fff' }}
              >
                <div
                  className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: color.light }}
                >
                  {player.emoji}
                </div>
                <p className="text-sm font-black" style={{ color: color.text }}>
                  {player.name}
                </p>
                <p className="text-[10px] font-bold" style={{ color: isYou ? color.text : THEME.faint }}>
                  {isYou ? '◀ いまはあなた' : 'タップで切替'}
                </p>
              </button>
            )
          })}
        </section>

        {/* Level / EXP + current location */}
        <section className="mb-4 rounded-3xl border-2 bg-white p-5" style={{ borderColor: THEME.light }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-white"
                style={{ background: THEME.accent, fontFamily: "'Yusei Magic', sans-serif" }}
              >
                Lv{level}
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#BBA697]">ふたりのレベル</p>
                <p className="text-base font-black text-[#6B5547]">
                  {PLAYERS.map((p) => p.emoji).join(' ')} {PLAYERS.map((p) => p.name).join(' ✕ ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold tracking-widest text-[#BBA697]">現在地</p>
              <p className="text-sm font-black text-[#6B5547]">
                {stageProgress.stage.emoji} {stageProgress.stage.name}
              </p>
            </div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: THEME.light }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: THEME.accent }} />
          </div>
          <p className="mt-1 text-right text-[11px] text-[#BBA697]">
            EXP {current} / {max}
          </p>
        </section>

        {/* Stat grid */}
        <section className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border-2 bg-white p-3 text-center" style={{ borderColor: THEME.light }}>
            <p className="text-[10px] font-bold tracking-widest text-[#BBA697]">達成数</p>
            <p className="mt-1 text-lg font-black" style={{ color: THEME.accent }}>
              {progress.completedCount}
            </p>
            <p className="text-[10px] text-[#D9C7BC]">/ {GOAL_COMPLETED_COUNT}</p>
          </div>
          <div className="rounded-2xl border-2 bg-white p-3 text-center" style={{ borderColor: THEME.light }}>
            <p className="text-[10px] font-bold tracking-widest text-[#BBA697]">仲間</p>
            <p className="mt-1 text-lg font-black" style={{ color: THEME.accent }}>
              {progress.companions.length}
            </p>
            <p className="text-[10px] text-[#D9C7BC]">{speciesCount} / {COMPANION_SPECIES.length}種類</p>
          </div>
          <div className="rounded-2xl border-2 bg-white p-3 text-center" style={{ borderColor: THEME.light }}>
            <p className="text-[10px] font-bold tracking-widest text-[#BBA697]">友情コンボ</p>
            <p className="mt-1 text-lg font-black" style={{ color: THEME.accent }}>
              {progress.friendshipCombos}
            </p>
            <p className="text-[10px] text-[#D9C7BC]">回</p>
          </div>
        </section>

        {/* Energy gauge */}
        <section className="mb-5 rounded-3xl border-2 bg-white p-5" style={{ borderColor: THEME.light }}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-widest text-[#BBA697]">気（エネルギー）</p>
            <p className="text-[11px] font-bold text-[#BBA697]">超覚醒 ×{progress.superAwakenings}</p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: THEME.light }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(progress.energy / ENERGY_MAX) * 100}%`, background: 'linear-gradient(90deg, #BCE3C9, #AED4F2, #F7B8CF)' }}
            />
          </div>
          <p className="mt-1 text-right text-[11px] text-[#BBA697]">
            {progress.energy} / {ENERGY_MAX}
          </p>
        </section>

        {/* Main CTA */}
        <Link
          href="/futari-quest/quest"
          className="mb-3 block w-full rounded-full px-8 py-4 text-center text-base font-black text-white shadow-md transition-transform active:scale-95"
          style={{ background: THEME.accent }}
        >
          🎒 やりたいことリストへ →
        </Link>

        {/* Secondary links */}
        <section className="mb-5 grid grid-cols-3 gap-2">
          <Link href="/futari-quest/map" className="rounded-2xl border-2 bg-white p-3 text-center" style={{ borderColor: THEME.light }}>
            <p className="text-2xl">🗺️</p>
            <p className="mt-1 text-[11px] font-bold text-[#6B5547]">冒険マップ</p>
          </Link>
          <Link href="/futari-quest/collection" className="rounded-2xl border-2 bg-white p-3 text-center" style={{ borderColor: THEME.light }}>
            <p className="text-2xl">📖</p>
            <p className="mt-1 text-[11px] font-bold text-[#6B5547]">仲間図鑑</p>
          </Link>
          <Link href="/futari-quest/settings" className="rounded-2xl border-2 bg-white p-3 text-center" style={{ borderColor: THEME.light }}>
            <p className="text-2xl">⚙️</p>
            <p className="mt-1 text-[11px] font-bold text-[#6B5547]">せってい</p>
          </Link>
        </section>

        {/* Activity feed */}
        <section>
          <p className="mb-2 text-[11px] font-bold tracking-widest text-[#BBA697]">さいきんのできごと</p>
          <ActivityFeed activity={progress.activity} themeColors={progress.themeColors} limit={5} />
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
