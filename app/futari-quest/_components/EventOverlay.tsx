'use client'

import { useState } from 'react'
import { GROWTH_STAGES, THEME, getSpecies, rarityStars } from '@/lib/futari-quest/constants'
import type { GameEvent } from '@/lib/futari-quest/storage'

function EventContent({ event }: { event: GameEvent }) {
  switch (event.kind) {
    case 'combo':
      return (
        <>
          <p className="fq-sparkle text-5xl">🎊</p>
          <p className="mt-3 text-lg font-black" style={{ color: THEME.accent }}>
            友情コンボ発生！
          </p>
          <p className="mt-1 text-sm text-[#BBA697]">同じ日にふたりで達成したから EXPが2倍になったよ</p>
        </>
      )
    case 'companion': {
      const species = getSpecies(event.companion.speciesId)
      return (
        <>
          <p className="fq-bounce-in text-6xl">{species.emoji}</p>
          <p className="mt-3 text-lg font-black text-[#6B5547]">新しい仲間：{species.name}</p>
          <p className="mt-1 text-base font-bold" style={{ color: THEME.accent }}>
            {rarityStars(event.companion.rarity)}
          </p>
          <p className="mt-1 text-xs text-[#BBA697]">{GROWTH_STAGES[0].label}な姿で仲間になった</p>
        </>
      )
    }
    case 'gacha': {
      const { reward } = event
      if (reward.kind === 'companion') {
        const species = getSpecies(reward.companion.speciesId)
        return (
          <>
            <p className="fq-super text-6xl">{species.emoji}</p>
            <p className="mt-3 text-lg font-black text-[#6B5547]">激レア仲間出現！</p>
            <p className="mt-1 text-base font-bold" style={{ color: THEME.accent }}>
              {species.name} {rarityStars(reward.companion.rarity)}
            </p>
          </>
        )
      }
      if (reward.kind === 'badge') {
        return (
          <>
            <p className="fq-sparkle text-6xl">🎀</p>
            <p className="mt-3 text-lg font-black text-[#6B5547]">特別バッジ獲得！</p>
            <p className="mt-1 text-base font-bold" style={{ color: THEME.accent }}>
              {reward.badge}
            </p>
          </>
        )
      }
      return (
        <>
          <p className="fq-sparkle text-6xl">🏷️</p>
          <p className="mt-3 text-lg font-black text-[#6B5547]">称号獲得！</p>
          <p className="mt-1 text-base font-bold" style={{ color: THEME.accent }}>
            「{reward.title}」
          </p>
        </>
      )
    }
    case 'wishTicket':
      return (
        <>
          <p className="fq-float text-6xl">🌠</p>
          <p className="mt-3 text-lg font-black text-[#6B5547]">願いチケットを獲得！</p>
          <p className="mt-1 text-sm text-[#BBA697]">のこり {event.total} 枚</p>
        </>
      )
    case 'levelup':
      return (
        <>
          <p className="fq-bounce-in text-6xl">🆙</p>
          <p className="mt-3 text-lg font-black text-[#6B5547]">レベルアップ！</p>
          <p className="mt-1 text-2xl font-black" style={{ color: THEME.accent }}>
            Lv.{event.level}
          </p>
        </>
      )
    case 'awaken':
      return (
        <>
          <p className="fq-super text-6xl">🌟</p>
          <p className="mt-3 text-lg font-black text-[#6B5547]">覚醒！！</p>
          <p className="mt-1 text-sm text-[#BBA697]">レベル{event.level}到達でふたりの力がパワーアップした！</p>
        </>
      )
    case 'superAwaken':
      return (
        <>
          <p className="fq-super text-7xl">💥</p>
          <p className="mt-3 text-xl font-black" style={{ color: THEME.accent }}>
            超覚醒！！！
          </p>
          <p className="mt-1 text-sm text-[#BBA697]">気がMAXになった！ふたりの力が爆発する！</p>
        </>
      )
    case 'stageUp':
      return (
        <>
          <p className="fq-bounce-in text-6xl">{event.stage.emoji}</p>
          <p className="mt-3 text-lg font-black text-[#6B5547]">「{event.stage.name}」に到着！</p>
          {event.stage.boss && (
            <p className="mt-1 text-sm" style={{ color: THEME.accent }}>
              {event.stage.boss.emoji} {event.stage.boss.name}をたおした！
            </p>
          )}
        </>
      )
  }
}

export default function EventOverlay({ events, onClose }: { events: GameEvent[]; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  if (events.length === 0) return null
  const isLast = index === events.length - 1

  function next() {
    if (isLast) {
      setIndex(0)
      onClose()
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6B5547]/40 px-6" onClick={next}>
      <div
        className="fq-bounce-in w-full max-w-xs rounded-3xl border-2 bg-white p-6 text-center shadow-xl"
        style={{ borderColor: THEME.accent }}
        onClick={(e) => e.stopPropagation()}
      >
        <EventContent event={events[index]} />
        <button onClick={next} className="mt-5 rounded-full px-6 py-2 text-sm font-bold text-white" style={{ background: THEME.accent }}>
          {isLast ? 'とじる' : 'つぎへ'}
        </button>
      </div>
    </div>
  )
}
